# 플레이어 설정 (player.js)

player.js는 씬 타이밍, 자막, 오디오, 애니메이션 오케스트레이션을 담당합니다.

---

## 1. 타이밍 설정 (SCENES)

```javascript
const TOTAL_DURATION = 130;  // 총 영상 길이 (초)
const SCENES = [
  { id: 1, start: 0,   end: 6 },    // 인트로
  { id: 2, start: 6,   end: 21 },   // 개념 설명
  { id: 3, start: 21,  end: 37 },   // 메커니즘
  // ...
];
```

### 씬 시간 배분 가이드

| 씬 유형 | 권장 시간 | 근거 |
|---------|----------|------|
| 인트로 | 6~10초 | TTS 4~5초 + 여유 |
| 개념 설명 (텍스트 많음) | 15~19초 | TTS 12~17초 + 애니메이션 버퍼 |
| 비교/카드 | 13~15초 | 카드 3개 읽기 시간 |
| 표/데이터 | 15~18초 | 행 4개 순차 등장 |
| 아웃트로 | 10~14초 | 감성 메시지 여운 |
| 브랜드 | 8~10초 | 로고 인식 |

**공식**: `씬 시간 = TTS 길이 + 2~4초 (애니메이션 버퍼)`

### 주의사항
- `end` 값은 다음 씬의 `start`와 일치해야 함
- 마지막 씬의 `end`는 `TOTAL_DURATION`과 일치해야 함
- index.html의 `timeTotal` 텍스트도 함께 수정

---

## 2. 자막 설정 (SUBTITLES)

씬 인덱스 순서대로 자막 텍스트를 배열합니다.

```javascript
const SUBTITLES = [
  "인트로 자막",
  "두 번째 씬 자막\n줄바꿈 가능",
  "세 번째 씬 자막",
  // ... (SCENES 개수와 동일)
];
```

- `\n`으로 줄바꿈
- 씬 전환 시 0.5초 후 페이드인
- 캡처 시 자동 숨김 (subtitle-bar display:none)

---

## 3. 오디오 설정 (SCENE_AUDIO)

```javascript
const SCENE_AUDIO = [
  '../assets/audio/scene_1/audio.wav',
  '../assets/audio/scene_2/audio (2).wav',
  // ... (SCENES 개수와 동일)
];
```

### TTS 오디오 규칙
- 포맷: `.wav` (비압축, 브라우저 호환성 최적)
- 경로: `assets/audio/scene_{N}/` 폴더에 각각 배치
- 씬 전환 시 이전 오디오 정지 → 새 오디오 재생
- 캡처 시 오디오 무음 처리됨 (capture.js에서 AudioContext mock)

---

## 4. 씬 전환 설정 (SCENE_TRANSITIONS)

```javascript
const SCENE_TRANSITIONS = [
  'anim-scene',       // 블러 페이드
  'anim-scene-up',    // 슬라이드업
  'anim-scene',       // 블러 페이드
  'anim-scene-zoom',  // 줌인
  'anim-scene-left',  // 슬라이드 좌
  // ...
];
```

상세 내용은 [애니메이션 시스템](./animation-system.md) 참조.

---

## 5. 씬 애니메이션 함수 (animateScene)

`switch(sceneId)` 블록에서 각 씬의 요소 등장 순서를 제어합니다.

### 새 씬 추가 시 체크리스트

1. `SCENES` 배열에 타이밍 추가
2. `SUBTITLES` 배열에 자막 추가
3. `SCENE_AUDIO` 배열에 오디오 경로 추가
4. `SCENE_TRANSITIONS` 배열에 전환 타입 추가
5. `animateScene()` 함수에 `case N:` 블록 추가
6. `resetSceneAnimations()`에 특수 리셋 로직 추가 (필요 시)

### animateScene 작성 패턴

```javascript
case N: {
  // 1. 헤딩 먼저
  el.querySelector('.heading').className = 'heading anim-fade-up delay-1';
  
  // 2. 이미지/영상
  el.querySelector('.img-cut').className = 'img-cut anim-fade-scale delay-2';
  
  // 3. 본문 텍스트
  el.querySelector('.body-text').className = 'body-text anim-fade-up delay-3';
  
  // 4. 반복 요소 (스태거)
  el.querySelectorAll('.item').forEach((item, i) => {
    item.className = 'item anim-fade-left delay-' + (i + 3);
  });
  
  // 5. 하단 요약/CTA
  el.querySelector('.bottom-note').className = 'bottom-note anim-fade-up delay-7';
  
  // 6. 텍스트 하이라이트 (있으면)
  revealHighlights(N);
  break;
}
```

**등장 순서 원칙**: 위→아래, 제목→내용→보조정보 순서로 delay를 부여합니다.

---

## 6. 파티클 생성

브랜드 씬에 파티클을 추가합니다:

```javascript
createParticles('particles9', 12);  // containerId, 파티클 개수
```

- HTML에 `<div class="particles" id="particles9"></div>` 필요
- common.css의 `.particle`, `@keyframes particleFloat` 사용

---

## 전체 설정 체크리스트 (새 영상)

- [ ] `TOTAL_DURATION` 설정
- [ ] `SCENES` 배열 (id, start, end)
- [ ] `SUBTITLES` 배열 (씬 수 일치)
- [ ] `SCENE_AUDIO` 배열 (경로 확인)
- [ ] `SCENE_TRANSITIONS` 배열
- [ ] `animateScene()` switch 블록
- [ ] `resetSceneAnimations()` 특수 리셋
- [ ] index.html `timeTotal` 텍스트
- [ ] `createParticles()` 호출 (브랜드 씬)
