// ===================== TIMING CONFIG =====================
const TOTAL_DURATION = 130;
const SCENES = [
  { id: 1, start: 0,   end: 6 },    // 타이틀 (6초, TTS 4.2s)
  { id: 2, start: 6,   end: 21 },   // NK세포란 (15초, TTS 12.4s)
  { id: 3, start: 21,  end: 37 },   // 퍼포린/그랜자임 (16초, TTS 14.1s)
  { id: 4, start: 37,  end: 52 },   // vs 비교 (15초, TTS 12.8s)
  { id: 5, start: 52,  end: 71 },   // 떨어지면 (19초, TTS 16.6s)
  { id: 6, start: 71,  end: 89 },   // 활성도 검사 (18초, TTS 15.8s)
  { id: 7, start: 89,  end: 106 },  // 관리법 (17초, TTS 15.2s)
  { id: 8, start: 106, end: 120 },  // 아웃트로 (14초, TTS 11.8s)
  { id: 9, start: 120, end: 130 },  // 교보라이프플래닛 (10초, TTS 7.3s)
];

// ===================== SUBTITLE CONFIG =====================
const SUBTITLES = [
  "우리 몸의 건강 방어선, 암 잡는 NK세포",
  "NK세포는 바이러스 감염 세포나 암세포를\n빠르게 인식해 직접 사멸시킵니다",
  "퍼포린과 그랜자임을 분비하여\n암세포를 직접 파괴합니다",
  "NK세포는 학습 없이 즉각 공격하는 것이\n차별점입니다",
  "활성도가 떨어지면\n암이 자랄 가능성이 높아집니다",
  "혈액 검사로 NK세포 활성도를\n수치로 확인할 수 있습니다",
  "수면, 운동, 식습관, 스트레스 관리로\nNK세포를 관리하세요",
  "면역과 삶 전체를 준비하는 것이\n암 예방의 시작입니다",
  "설계사 수수료 없는 알뜰보험\n교보라이프플래닛",
];

// ===================== AUDIO CONFIG =====================
const SCENE_AUDIO = [
  '../assets/audio/scene_1/audio.wav',
  '../assets/audio/scene_2/audio (2).wav',
  '../assets/audio/scene_3/audio (3).wav',
  '../assets/audio/scene_4/audio (4).wav',
  '../assets/audio/scene_5/audio (5).wav',
  '../assets/audio/scene_6/audio (6).wav',
  '../assets/audio/scene_7/audio (7).wav',
  '../assets/audio/scene_8/audio (8).wav',
  '../assets/audio/scene_9/audio (9).wav',
];
let currentAudio = null;

function playSceneAudio(sceneIndex) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  const src = SCENE_AUDIO[sceneIndex];
  if (!src) return;
  currentAudio = new Audio(src);
  currentAudio.play().catch(() => {});
}

function stopSceneAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

// ===================== STATE =====================
let isPlaying = false;
let currentTime = 0;
let currentScene = -1;
let animFrame = null;
let lastTimestamp = null;
const btnPlay = document.getElementById('btnPlay');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const timeCurrent = document.getElementById('timeCurrent');
const subtitleText = document.getElementById('subtitleText');
const sceneDots = document.getElementById('sceneDots');

// ===================== PARTICLES =====================
function createParticles(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = 30 + Math.random() * 60 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    if (Math.random() > 0.5) p.style.background = 'rgba(255,255,255,0.3)';
    container.appendChild(p);
  }
}
createParticles('particles9', 12);

// ===================== SCENE DOTS =====================
SCENES.forEach((s, i) => {
  const dot = document.createElement('div');
  dot.className = 'scene-dot' + (i === 0 ? ' active' : '');
  dot.dataset.index = i;
  sceneDots.appendChild(dot);
});

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

// ===================== SUBTITLE =====================
function showSubtitle(sceneIndex) {
  const text = SUBTITLES[sceneIndex] || '';
  subtitleText.textContent = text;
  subtitleText.classList.remove('visible');
  setTimeout(() => subtitleText.classList.add('visible'), 500);
}

function hideSubtitle() {
  subtitleText.classList.remove('visible');
}

// ===================== HIGHLIGHT ANIMATION =====================
function revealHighlights(sceneId) {
  const el = document.getElementById('scene-' + sceneId);
  if (!el) return;
  const highlights = el.querySelectorAll('.text-highlight');
  highlights.forEach((h, i) => {
    setTimeout(() => h.classList.add('revealed'), 1800 + i * 400);
  });
}

function resetHighlights(sceneId) {
  const el = document.getElementById('scene-' + sceneId);
  if (!el) return;
  el.querySelectorAll('.text-highlight').forEach(h => h.classList.remove('revealed'));
}

// ===================== SCENE ANIMATIONS =====================
function animateScene(sceneId) {
  const el = document.getElementById('scene-' + sceneId);
  if (!el) return;

  switch(sceneId) {
    case 1: {
      const bg = el.querySelector('.bg-photo');
      if (bg) { bg.style.opacity = '0.3'; bg.className = 'bg-photo anim-ken-burns-1'; }
      el.querySelector('.title-main').className = 'title-main anim-fade-up delay-1';
      el.querySelector('.subtitle').className = 'subtitle anim-fade-up delay-2';
      el.querySelector('.line-accent').className = 'line-accent anim-width delay-3';
      break;
    }
    case 2: {
      // 등장순서: 타이틀 → 영상 → 본문 → 하이라이트 → 각주
      el.querySelector('.heading').className = 'heading anim-fade-up delay-1';
      const vidWrap = el.querySelector('.video-wrap');
      if (vidWrap) vidWrap.className = 'video-wrap anim-fade-scale delay-3';
      el.querySelector('.body-text').className = 'body-text anim-fade-up delay-5';
      el.querySelector('.highlight-box').className = 'highlight-box anim-fade-left delay-6';
      el.querySelector('.footnote').className = 'footnote anim-fade-in delay-7';
      revealHighlights(2);
      break;
    }
    case 3: {
      el.querySelector('.heading').className = 'heading anim-fade-up delay-1';
      const charArea = el.querySelector('.char-area');
      if (charArea) charArea.className = 'char-area anim-fade-scale delay-2';
      el.querySelectorAll('.mech-step').forEach((s, i) => {
        s.className = 'mech-step anim-fade-left delay-' + (i + 3);
      });
      el.querySelector('.important-note').className = 'important-note anim-fade-scale delay-6';
      revealHighlights(3);
      break;
    }
    case 4: {
      el.querySelector('.heading').className = 'heading anim-fade-scale delay-1';
      el.querySelector('.sub-question').className = 'sub-question anim-fade-in delay-2';
      el.querySelectorAll('.cell-card').forEach((c, i) => {
        c.className = 'cell-card anim-fade-up delay-' + (i + 2);
      });
      setTimeout(() => {
        el.querySelectorAll('.cell-card .cell-name').forEach(n => {
          n.style.animation = 'fadeIn 0.6s ease-out forwards';
        });
      }, 2000);
      setTimeout(() => {
        el.querySelectorAll('.cell-card .cell-desc').forEach(d => {
          d.style.animation = 'fadeIn 0.6s ease-out forwards';
        });
      }, 2600);
      const battle = el.querySelector('.battle-area');
      setTimeout(() => {
        battle.style.animation = 'fadeInScale 1s ease-out forwards';
      }, 3200);
      el.querySelector('.bottom-note').className = 'bottom-note anim-fade-up delay-8';
      break;
    }
    case 5: {
      const dizzy = el.querySelector('.nk-dizzy');
      if (dizzy) {
        dizzy.style.animation = 'fadeInScale 1s ease-out forwards';
        dizzy.style.animationDelay = '0.3s';
      }
      el.querySelector('.heading').className = 'heading anim-fade-up delay-1';
      const warnings = el.querySelectorAll('.warning-content');
      warnings[0].className = 'warning-content anim-fade-up delay-2';
      const meter = el.querySelector('.danger-meter');
      meter.className = 'danger-meter anim-fade-in delay-3';
      el.querySelector('.meter-labels').className = 'meter-labels anim-fade-in delay-3';
      setTimeout(() => { el.querySelector('.danger-fill').style.width = '85%'; }, 1800);
      if (warnings[1]) warnings[1].className = 'warning-content anim-fade-up delay-5';
      el.querySelector('.question-prompt').className = 'question-prompt anim-fade-up delay-6';
      el.querySelector('.source').className = 'source anim-fade-in delay-7';
      revealHighlights(5);
      break;
    }
    case 6: {
      el.querySelector('.top-label').className = 'top-label anim-fade-in delay-1';
      el.querySelector('.heading').className = 'heading anim-fade-up delay-2';
      // 표 전체를 타이틀 후에 표시
      const table = el.querySelector('.level-table');
      if (table) table.className = 'level-table anim-fade-up delay-3';
      el.querySelectorAll('.level-row').forEach((row, i) => {
        row.className = 'level-row anim-fade-right delay-' + (i + 4);
      });
      el.querySelector('.table-note').className = 'table-note anim-fade-up delay-8';
      break;
    }
    case 7: {
      el.querySelector('.heading').className = 'heading anim-fade-up delay-1';
      el.querySelectorAll('.manage-item').forEach((item, i) => {
        item.className = 'manage-item anim-fade-scale delay-' + (i + 2);
      });
      el.querySelector('.closing-text').className = 'closing-text anim-fade-up delay-6';
      break;
    }
    case 8: {
      const shield = el.querySelector('.shield-illust');
      shield.setAttribute('class', 'shield-illust anim-shield-bg delay-1');
      el.querySelector('.outro-heading').className = 'outro-heading anim-fade-up delay-2';
      el.querySelector('.outro-highlight').className = 'outro-highlight anim-fade-up delay-3';
      el.querySelector('.outro-body').className = 'outro-body anim-fade-up delay-4';
      el.querySelector('.outro-cta').className = 'outro-cta anim-fade-up delay-5';
      el.querySelector('.brand').className = 'brand anim-fade-in delay-6';
      break;
    }
    case 9: {
      el.querySelector('.badge').className = 'badge anim-fade-up delay-1';
      el.querySelector('.main-copy').className = 'main-copy anim-fade-up delay-2';
      el.querySelector('.sub-copy').className = 'sub-copy anim-fade-up delay-3';
      el.querySelector('.divider').className = 'divider anim-width delay-4';
      el.querySelector('.brand-logo').className = 'brand-logo anim-fade-scale delay-5';
      break;
    }
  }
}

function resetSceneAnimations(sceneId) {
  const el = document.getElementById('scene-' + sceneId);
  if (!el) return;
  const animEls = el.querySelectorAll('[class*="anim-"]');
  animEls.forEach(a => {
    const cls = (typeof a.className === 'string') ? a.className : a.getAttribute('class') || '';
    const base = cls.replace(/anim-[\w-]+/g, '').replace(/delay-\d/g, '').trim();
    if (a instanceof SVGElement) {
      a.setAttribute('class', base);
    } else {
      a.className = base;
    }
    a.style.removeProperty('opacity');
    a.style.removeProperty('transform');
    a.style.removeProperty('animation');
    a.style.removeProperty('animation-delay');
  });
  const bgPhoto = el.querySelector('.bg-photo');
  if (bgPhoto) { bgPhoto.style.opacity = '0'; bgPhoto.className = 'bg-photo'; }
  if (sceneId === 5) {
    const fill = el.querySelector('.danger-fill');
    if (fill) fill.style.width = '0';
  }
  const dizzy = el.querySelector('.nk-dizzy');
  if (dizzy) { dizzy.style.removeProperty('animation'); dizzy.style.removeProperty('animation-delay'); }
  const battle = el.querySelector('.battle-area');
  if (battle) { battle.style.removeProperty('animation'); }
  el.querySelectorAll('.cell-name, .cell-desc').forEach(e => { e.style.removeProperty('animation'); });
  resetHighlights(sceneId);
}

const SCENE_TRANSITIONS = [
  'anim-scene',       // 1
  'anim-scene-up',    // 2
  'anim-scene',       // 3
  'anim-scene-zoom',  // 4
  'anim-scene-left',  // 5
  'anim-scene-zoom',  // 6
  'anim-scene-up',    // 7
  'anim-scene',       // 8
  'anim-scene-zoom',  // 9
];

function switchScene(newSceneIndex) {
  if (newSceneIndex === currentScene) return;

  document.querySelectorAll('.scene').forEach(s => {
    s.classList.remove('active', 'anim-scene', 'anim-scene-up', 'anim-scene-zoom', 'anim-scene-left');
  });
  if (currentScene >= 0) resetSceneAnimations(SCENES[currentScene].id);
  currentScene = newSceneIndex;
  const scene = SCENES[currentScene];
  const el = document.getElementById('scene-' + scene.id);
  const transition = SCENE_TRANSITIONS[currentScene] || 'anim-scene';
  el.classList.add('active', transition);
  setTimeout(() => animateScene(scene.id), 80);
  document.querySelectorAll('.scene-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentScene);
  });
  showSubtitle(currentScene);
  playSceneAudio(currentScene);
}

// ===================== PLAYBACK =====================
function tick(timestamp) {
  if (!isPlaying) return;
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  currentTime = Math.min(currentTime + delta, TOTAL_DURATION);

  const pct = (currentTime / TOTAL_DURATION) * 100;
  progressFill.style.width = pct + '%';
  timeCurrent.textContent = formatTime(currentTime);

  for (let i = 0; i < SCENES.length; i++) {
    if (currentTime >= SCENES[i].start && currentTime < SCENES[i].end) {
      switchScene(i);
      break;
    }
  }

  if (currentTime >= TOTAL_DURATION) {
    isPlaying = false;
    btnPlay.innerHTML = '&#10227;';
    lastTimestamp = null;
    hideSubtitle();
    stopSceneAudio();
    return;
  }
  animFrame = requestAnimationFrame(tick);
}

function play() {
  if (currentTime >= TOTAL_DURATION) {
    currentTime = 0;
    currentScene = -1;
  }
  isPlaying = true;
  lastTimestamp = null;
  btnPlay.innerHTML = '&#9208;';
  // 현재 씬의 오디오 재생 (브라우저 autoplay 정책 우회 - 사용자 클릭 후)
  if (currentScene >= 0) {
    playSceneAudio(currentScene);
  }
  animFrame = requestAnimationFrame(tick);
}

function pause() {
  isPlaying = false;
  lastTimestamp = null;
  btnPlay.innerHTML = '&#9654;';
  if (animFrame) cancelAnimationFrame(animFrame);
  hideSubtitle();
  stopSceneAudio();
}

btnPlay.addEventListener('click', () => {
  if (isPlaying) pause(); else play();
});

progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  currentTime = ratio * TOTAL_DURATION;
  currentScene = -1;
  progressFill.style.width = (ratio * 100) + '%';
  timeCurrent.textContent = formatTime(currentTime);
  for (let i = 0; i < SCENES.length; i++) {
    if (currentTime >= SCENES[i].start && currentTime < SCENES[i].end) {
      switchScene(i);
      break;
    }
  }
});

switchScene(0);
