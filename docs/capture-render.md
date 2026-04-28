# 캡처 및 렌더링

Puppeteer로 브라우저 내 HTML 영상을 실시간 녹화하고, FFmpeg로 MP4로 변환합니다.

---

## 사전 요구사항

```bash
npm install          # puppeteer 설치
```

- **Node.js**: 18+
- **Puppeteer**: 24+ (package.json에 포함)
- **FFmpeg**: 시스템에 설치 필요

### FFmpeg 설치 확인

```bash
ffmpeg -version
```

Windows WinGet으로 설치한 경우 capture.js가 자동으로 경로를 탐지합니다:
```
C:\Users\{user}\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_...\bin\ffmpeg.exe
```

---

## capture.js 설정

`tools/capture.js` 상단의 설정값을 수정합니다:

```javascript
const HTML_FILE = path.resolve(__dirname, '..', 'v{N}', 'index.html');
const OUTPUT_WEBM = path.resolve(__dirname, '..', 'output', '{name}.webm');
const OUTPUT_FILE = path.resolve(__dirname, '..', 'output', '{name}.mp4');
const TOTAL_DURATION = 130;   // player.js의 TOTAL_DURATION과 일치
const WIDTH = 720;            // 세로형 9:16
const HEIGHT = 1280;
```

### 새 영상 캡처 시 변경할 것

| 설정 | 변경 내용 |
|------|----------|
| `HTML_FILE` | 새 버전 폴더 경로 (`v{N}/index.html`) |
| `OUTPUT_FILE` | 출력 파일명 |
| `TOTAL_DURATION` | player.js와 동일한 값 |

---

## 캡처 실행

```bash
node tools/capture.js
```

### 실행 과정

1. **브라우저 실행** — Puppeteer headless Chrome 시작 (720x1280)
2. **페이지 로드** — HTML 파일 열기 + 폰트 대기
3. **UI 숨김** — 컨트롤, 워터마크, 자막 바 숨김
4. **녹화 시작** — CDP screencast로 WebM 녹화
5. **재생 시작** — `play()` 호출 + AudioContext mock (무음)
6. **실시간 대기** — TOTAL_DURATION + 2초 대기
7. **녹화 종료** — WebM 저장
8. **MP4 변환** — FFmpeg로 WebM → MP4

### FFmpeg 변환 옵션

```bash
ffmpeg -y -i input.webm \
  -vf "scale=720:1280" \
  -c:v libx264 \
  -preset slow \
  -crf 18 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -r 60 \
  output.mp4
```

| 옵션 | 값 | 설명 |
|------|-----|------|
| `-preset` | slow | 압축 품질 우선 (느리지만 고품질) |
| `-crf` | 18 | 품질 (0=무손실, 23=기본, 18=고품질) |
| `-r` | 60 | 출력 FPS |
| `-pix_fmt` | yuv420p | 호환성 보장 |
| `-movflags` | +faststart | 스트리밍 최적화 |

---

## 캡처 시 자동 처리되는 것

| 항목 | 처리 |
|------|------|
| 컨트롤 바 | `display: none` |
| 워터마크 | `display: none` |
| 자막 바 | `display: none` |
| player-wrapper | 뷰포트 꽉 채움 |
| body 마진 | 0 |
| 오디오 | AudioContext mock (무음) |

---

## 오디오 합성 (별도 작업)

capture.js의 녹화는 **영상만** 포함합니다. TTS 오디오를 합성하려면 별도로 FFmpeg를 사용합니다:

```bash
# 오디오 합성 예시
ffmpeg -i output.mp4 -i combined_audio.wav \
  -c:v copy -c:a aac -b:a 192k \
  -map 0:v:0 -map 1:a:0 \
  output_with_audio.mp4
```

씬별 오디오를 하나로 합치려면:
```bash
# 씬 오디오를 타이밍에 맞게 concat + padding
ffmpeg -i "concat:scene1.wav|silence_gap.wav|scene2.wav|..." output_combined.wav
```

---

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| 폰트 깨짐 | Google Fonts 로드 실패 | `networkidle0` 대기 확인, 로컬 폰트 사용 |
| 검은 화면 | play() 호출 실패 | 콘솔 에러 확인, AudioContext mock 확인 |
| 해상도 불일치 | viewport 설정 | `setViewport({ width: 720, height: 1280 })` 확인 |
| ffmpeg 못 찾음 | PATH 미등록 | capture.js의 `wingetFfmpeg` 경로 수정 |
| 영상 잘림 | TOTAL_DURATION 불일치 | capture.js와 player.js 값 동기화 |
