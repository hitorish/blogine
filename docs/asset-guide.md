# 에셋 준비 가이드

---

## 폴더 구조

```
assets/
├── images/
│   ├── scene_1/          # 씬별 이미지 (사용하지 않는 씬은 빈 폴더)
│   ├── scene_2/
│   │   ├── character.png
│   │   └── walk.mp4      # 짧은 루프 영상도 가능
│   ├── scene_3/
│   │   ├── item_a.png
│   │   └── item_b.png
│   ├── ...
│   ├── 로고/
│   │   └── logo-removebg-preview.png
│   ├── image_01.jpg       # 공통 이미지 (인트로 배경 등)
│   └── *.jpg/png          # 원본 블로그 이미지 (참조용)
└── audio/
    ├── scene_1/
    │   └── audio.wav
    ├── scene_2/
    │   └── audio (2).wav
    └── ...
```

---

## 이미지

### 권장 사양

| 항목 | 권장 | 비고 |
|------|------|------|
| 포맷 | PNG (투명 배경) / JPG (배경 사진) | |
| 해상도 | 720px 이상 (영상 너비 기준) | |
| 배경 제거 | 캐릭터/아이콘은 투명 배경 필수 | removebg 등 활용 |
| 파일명 | 영문 또는 설명적 이름 | 한글 경로도 동작하나 영문 권장 |

### 이미지 유형

| 유형 | 용도 | HTML 클래스 |
|------|------|------------|
| 배경 사진 | 인트로 전체 배경 | `.bg-photo` |
| 캐릭터 이미지 | 씬 내 삽화/캐릭터 | `.char-*`, `.nk-dizzy` 등 |
| 비교/설명 이미지 | 씬 내 보조 이미지 | `.battle-img`, `.img-cut` |
| 루프 영상 | 캐릭터 움직임 | `<video>` in `.video-wrap` |
| 브랜드 로고 | 마지막 씬 | `.brand-logo` |

### 영상 에셋

씬 내 짧은 루프 영상(캐릭터 걷기 등)을 사용할 수 있습니다:

```html
<div class="video-wrap">
  <video class="character-video" src="../assets/images/scene_2/walk.mp4" 
         autoplay muted loop playsinline></video>
</div>
```

- `autoplay muted loop playsinline` 필수
- MP4 (H.264) 권장
- 짧은 루프 (2~5초)

---

## TTS 오디오

### 생성 방법

1. 씬별 자막/나레이션 스크립트 작성
2. TTS 서비스로 .wav 생성 (네이버 클로바, 구글 TTS 등)
3. `assets/audio/scene_{N}/` 폴더에 배치

### 권장 사양

| 항목 | 권장 |
|------|------|
| 포맷 | WAV (비압축) |
| 샘플레이트 | 44100Hz |
| 채널 | 모노 또는 스테레오 |
| 파일명 | `audio.wav` 또는 `audio ({N}).wav` |

### TTS 길이 → 씬 시간 계산

1. TTS 파일 길이 확인
2. 씬 시간 = TTS 길이 + 2~4초 (애니메이션 버퍼)
3. player.js의 `SCENES` 배열에 반영

예시 (v5 기준):
```
Scene 1: TTS 4.2s → 씬 6초  (+1.8s)
Scene 2: TTS 12.4s → 씬 15초 (+2.6s)
Scene 5: TTS 16.6s → 씬 19초 (+2.4s)
```

---

## SVG 아이콘

비교 카드나 관리법 아이콘은 인라인 SVG로 직접 작성합니다:

```html
<svg viewBox="0 0 48 48" fill="none" width="46" height="46">
  <circle cx="24" cy="24" r="20" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
  <!-- ... -->
</svg>
```

- 외부 이미지 대신 SVG를 쓰면 캡처 시 깨짐 방지
- 간단한 아이콘/일러스트에 적합
- 복잡한 일러스트는 PNG 사용

---

## 에셋 체크리스트 (새 영상)

- [ ] 인트로 배경 이미지 (`.bg-photo`)
- [ ] 씬별 캐릭터/설명 이미지 (투명 배경 PNG)
- [ ] 브랜드 로고 (투명 배경 PNG)
- [ ] 씬별 TTS 오디오 (.wav)
- [ ] (선택) 캐릭터 루프 영상 (.mp4)
- [ ] 모든 이미지 경로가 `../assets/images/scene_{N}/`을 가리키는지 확인
