const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const HTML_FILE = path.resolve(__dirname, '..', 'v4', 'nk_cell_video_v4.html');
const OUTPUT_WEBM = path.resolve(__dirname, '..', 'output', 'nk_cell_video_v4.webm');
const OUTPUT_FILE = path.resolve(__dirname, '..', 'output', 'nk_cell_video_v4.mp4');
const TOTAL_DURATION = 130;
const WIDTH = 720;
const HEIGHT = 1280;

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      `--window-size=${WIDTH},${HEIGHT}`,
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.goto('file:///' + HTML_FILE.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  // 컨트롤, 워터마크, 자막 숨기기 + player-wrapper를 뷰포트에 꽉 채우기
  await page.evaluate(() => {
    const controls = document.querySelector('.controls');
    if (controls) controls.style.display = 'none';
    const watermark = document.querySelector('.watermark');
    if (watermark) watermark.style.display = 'none';
    const subtitleBar = document.querySelector('.subtitle-bar');
    if (subtitleBar) subtitleBar.style.display = 'none';

    // player-wrapper를 뷰포트에 꽉 채우기
    const player = document.querySelector('.player-wrapper');
    if (player) {
      player.style.maxWidth = '100%';
      player.style.maxHeight = '100%';
      player.style.width = '100vw';
      player.style.height = '100vh';
      player.style.borderRadius = '0';
      player.style.boxShadow = 'none';
    }
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  });

  // CDP로 screencast 시작 (정확히 720x1280)
  const cdp = await page.createCDPSession();

  // 녹화 시작
  console.log(`Recording at ${WIDTH}x${HEIGHT}...`);
  const recorder = await page.screencast({
    path: OUTPUT_WEBM,
    speed: 1,
  });

  // 오디오 무력화 + 재생 시작
  await page.evaluate(() => {
    const noOp = () => {};
    const fakeGain = { value: 0, setValueAtTime: noOp, exponentialRampToValueAtTime: noOp, linearRampToValueAtTime: noOp };
    const fakeNode = { connect: noOp, start: noOp, stop: noOp, type: '', frequency: { value: 0, setValueAtTime: noOp, exponentialRampToValueAtTime: noOp }, Q: { value: 0 }, gain: fakeGain, buffer: null };
    window.AudioContext = window.webkitAudioContext = function() {
      return { state: 'running', resume: () => Promise.resolve(), currentTime: 0, sampleRate: 44100, destination: {},
        createOscillator: () => ({...fakeNode}), createGain: () => ({ gain: {...fakeGain}, connect: noOp }),
        createBiquadFilter: () => ({...fakeNode}), createBuffer: () => ({ getChannelData: () => new Float32Array(1) }),
        createBufferSource: () => ({...fakeNode}),
      };
    };
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    play();
  });

  // play() 후에도 UI 확실히 숨기기
  await page.evaluate(() => {
    document.querySelector('.controls').style.cssText = 'display:none !important';
    document.querySelector('.watermark').style.cssText = 'display:none !important';
    document.querySelector('.subtitle-bar').style.cssText = 'display:none !important';
  });

  console.log(`실시간 녹화 중... ${TOTAL_DURATION}초 대기`);
  const startTime = Date.now();
  const interval = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const pct = Math.min(100, Math.round(elapsed / TOTAL_DURATION * 100));
    process.stdout.write(`\r  ${elapsed}s / ${TOTAL_DURATION}s (${pct}%)`);
  }, 1000);

  await new Promise(r => setTimeout(r, (TOTAL_DURATION + 2) * 1000));

  clearInterval(interval);
  console.log('\nStopping recording...');
  await recorder.stop();

  console.log('Closing browser...');
  await browser.close();

  // WebM → MP4
  console.log('Converting to MP4...');
  let ffmpegPath = 'ffmpeg';
  const wingetFfmpeg = 'C:\\Users\\hitorish\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe';
  if (fs.existsSync(wingetFfmpeg)) {
    ffmpegPath = wingetFfmpeg;
  }

  const cmd = `"${ffmpegPath}" -y -i "${OUTPUT_WEBM}" -vf "scale=${WIDTH}:${HEIGHT}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -r 60 "${OUTPUT_FILE}"`;

  try {
    execSync(cmd, { stdio: 'inherit', timeout: 600000 });
    console.log(`\nDone! Output: ${OUTPUT_FILE}`);
    fs.unlinkSync(OUTPUT_WEBM);
  } catch (e) {
    console.error('ffmpeg failed:', e.message);
    console.log(`WebM preserved: ${OUTPUT_WEBM}`);
  }

  console.log('All done!');
})();
