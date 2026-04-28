const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const contentText = document.getElementById('contentText');
const generateBtn = document.getElementById('generateBtn');
const formSection = document.getElementById('form');
const loadingSection = document.getElementById('loading');
const resultSection = document.getElementById('result');
const errorBox = document.getElementById('errorBox');
const errorText = document.getElementById('errorText');
const retryBtn = document.getElementById('retryBtn');
const resultFrame = document.getElementById('resultFrame');
const restartBtn = document.getElementById('restartBtn');
const statusEl = document.querySelector('#loading .status');
const elapsedEl = document.getElementById('elapsed');

let sessionId = null;
let selectedFiles = [];

dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => addFiles(e.target.files));

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('drag');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('drag');
  addFiles(e.dataTransfer.files);
});

function addFiles(files) {
  for (const f of files) {
    if (f.type.startsWith('image/')) selectedFiles.push(f);
  }
  renderFiles();
}

function renderFiles() {
  fileList.innerHTML = selectedFiles
    .map((f, i) => `<li>${i + 1}. ${escapeHtml(f.name)}</li>`)
    .join('');
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

generateBtn.addEventListener('click', async () => {
  if (selectedFiles.length === 0) {
    alert('Please add at least one image.');
    return;
  }

  formSection.classList.add('hidden');
  loadingSection.classList.remove('hidden');

  try {
    const sessionRes = await fetch('/api/session', { method: 'POST' }).then(r => r.json());
    sessionId = sessionRes.id;

    const fd = new FormData();
    for (const f of selectedFiles) fd.append('images', f);
    await fetch(`/api/session/${sessionId}/images`, { method: 'POST', body: fd });

    await fetch(`/api/session/${sessionId}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: contentText.value }),
    });

    await fetch(`/api/session/${sessionId}/generate`, { method: 'POST' });
    poll();
  } catch (err) {
    showError(err.message || String(err));
  }
});

const ROTATING = [
  'Reading your content…',
  'Designing scenes…',
  'Composing animations…',
  'Polishing the look…',
  'Almost there…',
];

function startStatusRotation() {
  let i = 0;
  statusEl.textContent = ROTATING[0];
  return setInterval(() => {
    i = (i + 1) % ROTATING.length;
    statusEl.textContent = ROTATING[i];
  }, 7000);
}

function startElapsedTimer() {
  const start = Date.now();
  elapsedEl.textContent = '0s';
  return setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    elapsedEl.textContent = `${s}s`;
  }, 1000);
}

async function poll() {
  const rotateTimer = startStatusRotation();
  const elapsedTimer = startElapsedTimer();
  try {
    while (true) {
      await sleep(2500);
      const res = await fetch(`/api/session/${sessionId}`).then(r => r.json());
      if (res.state === 'done') {
        showResult(res.outputUrl);
        return;
      }
      if (res.state === 'error') {
        showError(res.error || 'generation failed');
        return;
      }
    }
  } finally {
    clearInterval(rotateTimer);
    clearInterval(elapsedTimer);
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showResult(url) {
  loadingSection.classList.add('hidden');
  resultSection.classList.remove('hidden');
  resultFrame.src = url;
  resultFrame.addEventListener('load', () => {
    setTimeout(() => {
      try {
        const w = resultFrame.contentWindow;
        if (w && typeof w.play === 'function') w.play();
      } catch (_) { /* same-origin should be fine; ignore otherwise */ }
    }, 600);
  }, { once: true });
}

function showError(msg) {
  loadingSection.classList.add('hidden');
  formSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  errorBox.classList.remove('hidden');
  errorText.textContent = msg;
}

function reset() {
  selectedFiles = [];
  fileInput.value = '';
  fileList.innerHTML = '';
  contentText.value = '';
  resultFrame.src = 'about:blank';
  errorBox.classList.add('hidden');
  resultSection.classList.add('hidden');
  loadingSection.classList.add('hidden');
  formSection.classList.remove('hidden');
}

restartBtn.addEventListener('click', reset);
retryBtn.addEventListener('click', reset);
