# 애니메이션 시스템

common.css에 정의된 재사용 가능한 애니메이션 클래스 시스템입니다.  
player.js의 `animateScene()`에서 클래스를 동적으로 부여하여 등장 애니메이션을 실행합니다.

---

## 요소 등장 애니메이션

| 클래스 | 효과 | 용도 |
|--------|------|------|
| `anim-fade-up` | 아래→위 페이드인 | 타이틀, 본문, 대부분의 텍스트 |
| `anim-fade-left` | 좌→우 페이드인 | 하이라이트 박스, 스텝 |
| `anim-fade-right` | 우→좌 페이드인 | 표 행 |
| `anim-fade-scale` | 확대 페이드인 | 이미지, 캐릭터, 카드 |
| `anim-fade-in` | 단순 페이드인 | 각주, 소스, 부가 정보 |
| `anim-width` | 너비 0→80px 성장 | 라인 장식 (`line-accent`, `divider`) |

### 사용법

player.js의 `animateScene()` 함수에서 CSS 클래스를 교체합니다:

```javascript
// 예: Scene 2 애니메이션
case 2: {
  el.querySelector('.heading').className = 'heading anim-fade-up delay-1';
  el.querySelector('.body-text').className = 'body-text anim-fade-up delay-5';
  el.querySelector('.highlight-box').className = 'highlight-box anim-fade-left delay-6';
  break;
}
```

**중요**: 초기 CSS에서 요소의 `opacity: 0`을 설정해야 애니메이션이 자연스럽게 작동합니다.

---

## 딜레이 클래스

요소 등장 순서를 제어합니다. 순차적으로 부여하면 스태거(stagger) 효과가 됩니다.

| 클래스 | 딜레이 |
|--------|--------|
| `delay-1` | 0.5s |
| `delay-2` | 1.1s |
| `delay-3` | 1.7s |
| `delay-4` | 2.3s |
| `delay-5` | 2.9s |
| `delay-6` | 3.5s |
| `delay-7` | 4.1s |
| `delay-8` | 4.7s |
| `delay-9` | 5.3s |

**간격**: 약 0.6초 단위. 읽기 시간이 필요한 콘텐츠에 적합합니다.

---

## 씬 전환 애니메이션

씬이 `active`가 될 때 적용되는 진입 효과입니다.

| 클래스 | 효과 | 권장 사용 |
|--------|------|----------|
| `anim-scene` | 블러→선명 페이드 | 기본 전환 |
| `anim-scene-up` | 아래→위 슬라이드 | 개념 설명 씬 |
| `anim-scene-zoom` | 줌인 | 데이터/비교 씬 |
| `anim-scene-left` | 좌→우 슬라이드 | 경고/전환 씬 |

player.js의 `SCENE_TRANSITIONS` 배열에서 씬별 전환을 지정합니다:

```javascript
const SCENE_TRANSITIONS = [
  'anim-scene',       // Scene 1: 기본 페이드
  'anim-scene-up',    // Scene 2: 슬라이드업
  'anim-scene',       // Scene 3: 기본
  'anim-scene-zoom',  // Scene 4: 줌
  'anim-scene-left',  // Scene 5: 슬라이드
  'anim-scene-zoom',  // Scene 6: 줌
  'anim-scene-up',    // Scene 7: 슬라이드업
  'anim-scene',       // Scene 8: 기본
  'anim-scene-zoom',  // Scene 9: 줌
];
```

**팁**: 연속 씬에 같은 전환을 쓰지 않으면 시각적 단조로움을 피할 수 있습니다.

---

## 특수 애니메이션

### Ken Burns (배경 이미지)

```css
.anim-ken-burns-1  /* scale(1) → scale(1.12), 좌상 이동 */
.anim-ken-burns-2  /* scale(1.05) → scale(1.15), 우상 이동 */
.anim-ken-burns-3  /* scale(1) → scale(1.1), 좌하 이동 */
```

인트로 씬의 배경 이미지(`bg-photo`)에 사용합니다.

### 텍스트 하이라이트

`text-highlight` 클래스에 `.revealed`를 추가하면 배경이 0%→100% 채워집니다:

```javascript
function revealHighlights(sceneId) {
  const highlights = el.querySelectorAll('.text-highlight');
  highlights.forEach((h, i) => {
    setTimeout(() => h.classList.add('revealed'), 1800 + i * 400);
  });
}
```

- 기본 대기: 1800ms (텍스트 읽기 후 강조)
- 요소 간격: 400ms

### 위험 게이지 (danger-meter)

`animateScene(5)`에서 setTimeout으로 너비를 제어합니다:

```javascript
setTimeout(() => { el.querySelector('.danger-fill').style.width = '85%'; }, 1800);
```

### 파티클 (Scene 9)

`createParticles('particles9', 12)`로 브랜드 씬에 떠다니는 입자를 생성합니다.

---

## 애니메이션 리셋

씬을 떠날 때 `resetSceneAnimations(sceneId)`가 호출됩니다:
- 모든 `anim-*`, `delay-*` 클래스 제거
- 인라인 스타일(opacity, transform, animation) 초기화
- 특수 요소(danger-fill, bg-photo 등) 별도 리셋

**새 씬 추가 시**: 특수 애니메이션을 사용했다면 `resetSceneAnimations()`에 리셋 로직을 추가하세요.
