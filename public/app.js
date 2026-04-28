const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const contentText = document.getElementById('contentText');
const generateBtn = document.getElementById('generateBtn');
const sampleBtn = document.getElementById('sampleBtn');
const formSection = document.getElementById('form');
const loadingSection = document.getElementById('loading');
const resultSection = document.getElementById('result');
const errorBox = document.getElementById('errorBox');
const errorText = document.getElementById('errorText');
const retryBtn = document.getElementById('retryBtn');
const resultFrame = document.getElementById('resultFrame');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const restartBtn = document.getElementById('restartBtn');
const elapsedEl = document.getElementById('elapsed');
const stageEls = Array.from(document.querySelectorAll('.stage'));

let sessionId = null;
let selectedFiles = [];

dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => addFiles(e.target.files));
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('drag');
  addFiles(e.dataTransfer.files);
});

function addFiles(files) {
  for (const f of files) {
    if (f.type && f.type.startsWith('image/')) selectedFiles.push(f);
  }
  renderFiles();
}

function renderFiles() {
  fileList.innerHTML = selectedFiles
    .map((f, i) => `<li>${i + 1}. ${escapeHtml(f.name)}</li>`)
    .join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const SAMPLE = {
  images: [
    '/assets/images/02-02NK%EC%84%B8%ED%8F%AC_IG02.jpg',
    '/assets/images/02-02NK%EC%84%B8%ED%8F%AC_IG03.jpg',
    '/assets/images/02-02NK%EC%84%B8%ED%8F%AC_IG04.jpg',
    '/assets/images/02-02NK%EC%84%B8%ED%8F%AC_IG05.jpg',
    '/assets/images/02-02NK%EC%84%B8%ED%8F%AC_IG06.jpg',
  ],
  text: `NK세포는 우리 몸의 자연살해세포(Natural Killer Cell)로, 선천면역의 핵심을 담당하는 면역세포입니다.

NK세포의 가장 큰 특징은 항체나 기억 면역 없이도 즉각 반응한다는 점입니다. 바이러스에 감염된 세포나 암세포를 빠르게 인식해 직접 사멸시킵니다.

작동 메커니즘은 3단계입니다. 암세포 표면의 이상 신호 감지 → 퍼포린으로 암세포 막에 구멍 형성 → 그랜자임 주입으로 직접 파괴. 특히 암이 성장하기 전 초기 단계에서 NK세포의 역할이 매우 중요합니다.

NK세포 활성도가 떨어지면 암이 자랄 가능성이 높아집니다. 충분한 수면, 적절한 운동, 균형잡힌 식사, 스트레스 관리로 NK세포를 건강하게 유지하는 것이 좋습니다.`,
};

sampleBtn.addEventListener('click', async () => {
  sampleBtn.disabled = true;
  const original = sampleBtn.textContent;
  sampleBtn.textContent = '샘플 불러오는 중…';
  try {
    selectedFiles = [];
    for (const url of SAMPLE.images) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`failed to fetch ${url}`);
      const blob = await res.blob();
      const filename = decodeURIComponent(url.split('/').pop());
      selectedFiles.push(new File([blob], filename, { type: blob.type || 'image/jpeg' }));
    }
    renderFiles();
    contentText.value = SAMPLE.text;
    sampleBtn.textContent = '샘플 불러옴 — 영상 만들기 클릭';
  } catch (err) {
    sampleBtn.textContent = original;
    sampleBtn.disabled = false;
    alert('샘플을 불러오지 못했어요: ' + err.message);
  }
});

generateBtn.addEventListener('click', async () => {
  if (selectedFiles.length === 0) {
    alert('이미지를 한 장 이상 추가해주세요.');
    return;
  }

  formSection.classList.add('hidden');
  loadingSection.classList.remove('hidden');
  loadingSection.classList.add('fade-in-up');

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

const STAGE_DURATIONS = [12, 60, 35]; // s for stages 0, 1, 2 (stage 3 holds until done)
let stageTimer = null;

function startStages() {
  stageEls.forEach((el) => el.classList.remove('active', 'done'));
  let cur = 0;
  stageEls[0].classList.add('active');

  function advance() {
    if (cur >= 3) return;
    stageEls[cur].classList.remove('active');
    stageEls[cur].classList.add('done');
    cur++;
    stageEls[cur].classList.add('active');
    if (cur < 3) stageTimer = setTimeout(advance, STAGE_DURATIONS[cur] * 1000);
  }
  stageTimer = setTimeout(advance, STAGE_DURATIONS[0] * 1000);
}

function finishStages() {
  if (stageTimer) { clearTimeout(stageTimer); stageTimer = null; }
  stageEls.forEach((el) => { el.classList.remove('active'); el.classList.add('done'); });
}

function startElapsedTimer() {
  const start = Date.now();
  elapsedEl.textContent = '0초';
  return setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    elapsedEl.textContent = `${s}초`;
  }, 1000);
}

async function poll() {
  startStages();
  const elapsedTimer = startElapsedTimer();
  try {
    while (true) {
      await sleep(2500);
      const res = await fetch(`/api/session/${sessionId}`).then(r => r.json());
      if (res.state === 'done') {
        finishStages();
        await sleep(400);
        showResult(res.outputUrl);
        return;
      }
      if (res.state === 'error') {
        finishStages();
        showError(res.error || 'generation failed');
        return;
      }
    }
  } finally {
    clearInterval(elapsedTimer);
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showResult(url) {
  loadingSection.classList.add('hidden');
  loadingSection.classList.remove('fade-in-up');
  resultSection.classList.remove('hidden');
  resultSection.classList.remove('fade-in-up');
  void resultSection.offsetWidth; // restart animation
  resultSection.classList.add('fade-in-up');

  fullscreenBtn.href = url;
  resultFrame.src = url;
  resultFrame.addEventListener('load', () => {
    try {
      const doc = resultFrame.contentDocument;
      if (doc) {
        const style = doc.createElement('style');
        style.textContent =
          '.controls,.watermark,.subtitle-bar{display:none!important}';
        doc.head.appendChild(style);
      }
    } catch (_) { /* ignore */ }
    setTimeout(() => {
      try {
        const w = resultFrame.contentWindow;
        if (w && typeof w.play === 'function') w.play();
      } catch (_) { /* ignore */ }
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
  sampleBtn.disabled = false;
  sampleBtn.textContent = '샘플로 한 번 보기';
}

restartBtn.addEventListener('click', reset);
retryBtn.addEventListener('click', reset);
