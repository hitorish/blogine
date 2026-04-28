# 씬 구성 가이드

## HTML 씬 기본 구조

모든 씬은 `<div class="scene">` 안에 작성합니다.

```html
<div class="scene scene-{N}" id="scene-{N}">
  <!-- 씬 내용 -->
</div>
```

### 클래스 규칙

| 클래스 | 용도 |
|--------|------|
| `scene` | 기본 씬 (padding-bottom: 30%, 컨트롤 영역 확보) |
| `scene.extended` | 콘텐츠가 많은 씬 (padding-top: 3%, padding-bottom: 18%) |
| `scene.active` | 현재 활성 씬 (player.js가 자동 제어) |

**규칙**: 텍스트가 많거나 요소가 4개 이상이면 `extended` 클래스를 추가합니다.

---

## 씬 유형별 템플릿

### 1. 인트로 씬 (Scene 1)

배경 이미지 + 타이틀 + 서브타이틀 구조입니다.

```html
<div class="scene scene-1 active" id="scene-1">
  <img class="bg-photo" src="../assets/images/image_01.jpg" alt="">
  <div class="title-main">메인 제목<br><span>강조 키워드</span></div>
  <div class="subtitle">서브 카피</div>
  <div class="line-accent"></div>
</div>
```

**CSS 포인트**:
- 배경: 어두운 그라데이션 + `bg-photo` (Ken Burns 효과)
- 타이틀: `clamp(62px, 14.4vw, 98px)`, font-weight 900
- `span` 으로 브랜드 컬러 강조
- `line-accent`: 하단 그린 라인 장식

---

### 2. 개념 설명 씬

헤딩 + 이미지/영상 + 본문 + 하이라이트 박스 구조입니다.

```html
<div class="scene scene-2 extended" id="scene-2">
  <div class="heading"><span>키워드</span>란 무엇일까?</div>
  
  <!-- 이미지 또는 영상 -->
  <div class="video-wrap">
    <video class="character-video" src="..." autoplay muted loop playsinline></video>
  </div>
  <!-- 또는 <img class="img-cut" src="..."> -->
  
  <div class="body-text">
    본문 텍스트입니다.<br>
    <strong class="text-highlight" style="color:#059669">강조 텍스트</strong>
  </div>
  <div class="highlight-box">핵심 요약 메시지</div>
  <div class="footnote">*각주</div>
</div>
```

**구성요소**:

| 요소 | 용도 | 크기 |
|------|------|------|
| `.heading` | 씬 제목 | `clamp(55px, 13.2vw, 86px)` |
| `.body-text` | 본문 설명 | `clamp(38px, 8.4vw, 55px)` |
| `.highlight-box` | 핵심 요약 (녹색 배경 박스) | `clamp(34px, 7.2vw, 48px)` |
| `.text-highlight` | 텍스트 내 밑줄 강조 | 애니메이션으로 배경 채움 |
| `.footnote` | 하단 각주 | `clamp(26px, 5.4vw, 36px)` |

---

### 3. 단계/메커니즘 씬

헤딩 + 캐릭터 이미지 + 번호 스텝 구조입니다.

```html
<div class="scene scene-3 extended" id="scene-3">
  <div class="heading">왜 OO를<br><span>'핵심 표현'</span>이라 부를까</div>
  <div class="char-area">
    <img class="char-cancer" src="..." alt="">
    <img class="char-nk" src="..." alt="">
  </div>
  <div class="mechanism-box">
    <div class="mech-step">
      <div class="step-num">1</div>
      <div class="step-text">첫 번째 단계 <strong class="text-highlight">강조</strong></div>
    </div>
    <div class="mech-step">
      <div class="step-num">2</div>
      <div class="step-text">두 번째 단계</div>
    </div>
    <div class="mech-step">
      <div class="step-num">3</div>
      <div class="step-text">세 번째 단계</div>
    </div>
  </div>
  <div class="important-note">하단 강조 메시지!</div>
</div>
```

---

### 4. 비교/카드 씬

카드 레이아웃으로 항목을 비교합니다.

```html
<div class="scene scene-4 extended" id="scene-4">
  <div class="heading">A vs B vs C</div>
  <div class="sub-question">차이점은?</div>
  <div class="cards-row">
    <div class="cell-card">
      <svg class="cell-visual" viewBox="0 0 64 64"><!-- SVG 아이콘 --></svg>
      <div class="cell-name">항목 A</div>
      <div class="cell-desc">설명</div>
    </div>
    <!-- 카드 2, 3 반복 -->
  </div>
  <div class="battle-area">
    <img class="battle-img" src="..." alt="">
  </div>
  <div class="bottom-note">비교 요약 메시지</div>
</div>
```

---

### 5. 경고/위험 씬

위험도 게이지 + 경고 메시지 구조입니다.

```html
<div class="scene scene-5 extended" id="scene-5">
  <img class="nk-dizzy" src="..." alt="">
  <div class="heading"><em>키워드</em>가<br>떨어지면 생기는 일</div>
  <div class="warning-content">
    <p>경고 본문 <strong class="text-highlight" style="color:#dc2626">위험 강조</strong></p>
  </div>
  <div class="danger-meter">
    <div class="danger-fill"></div>
  </div>
  <div class="meter-labels">
    <span>정상</span><span>관심</span><span>경계</span><span>이상</span>
  </div>
  <div class="question-prompt">전환 질문?</div>
  <div class="source">출처: ...</div>
</div>
```

**주의**: `danger-fill`의 width는 player.js의 `animateScene()`에서 setTimeout으로 제어합니다.

---

### 6. 표/데이터 씬

표 형태로 정보를 정리합니다.

```html
<div class="scene scene-6" id="scene-6">
  <div class="top-label">상단 라벨</div>
  <div class="heading">표 제목</div>
  <div class="level-table">
    <div class="level-row">
      <div class="level-label">구간명</div>
      <div class="level-detail"><span class="val">*수치</span>설명</div>
    </div>
    <!-- 행 반복 -->
  </div>
  <div class="table-note">하단 보충 설명</div>
</div>
```

---

### 7. 그리드/관리법 씬

2x2 또는 1x4 그리드로 항목을 나열합니다.

```html
<div class="scene scene-7 extended" id="scene-7">
  <div class="heading"><span>키워드</span>는<br>관리할 수 있을까?</div>
  <div class="manage-grid">
    <div class="manage-item">
      <div class="icon-wrap">
        <svg viewBox="0 0 48 48" width="46" height="46"><!-- 아이콘 --></svg>
      </div>
      <div class="label">항목명</div>
    </div>
    <!-- 항목 반복 (보통 4개) -->
  </div>
  <div class="closing-text">마무리 메시지</div>
</div>
```

---

### 8. 아웃트로 씬

CTA + 감성 메시지입니다.

```html
<div class="scene scene-8" id="scene-8">
  <div class="overlay"></div>
  <svg class="shield-illust" viewBox="0 0 180 200"><!-- 일러스트 --></svg>
  <div class="outro-heading">결론 첫 줄</div>
  <div class="outro-highlight">핵심 메시지</div>
  <div class="outro-body">상세 마무리 본문</div>
  <div class="outro-cta">행동 유도 문구!</div>
  <div class="brand">BRAND</div>
</div>
```

---

### 9. 브랜드 엔딩 씬

파티클 배경 + 로고입니다.

```html
<div class="scene scene-9" id="scene-9">
  <div class="particles" id="particles9"></div>
  <div class="badge">뱃지 텍스트</div>
  <div class="main-copy">메인 카피</div>
  <div class="sub-copy">서브 카피</div>
  <div class="divider"></div>
  <img class="brand-logo" src="../assets/images/로고/logo.png" alt="">
</div>
```

---

## 공통 UI 요소 (index.html 하단)

모든 영상에 포함되는 요소입니다. 씬 뒤에 배치합니다.

```html
<!-- 워터마크 -->
<div class="watermark">BRAND</div>

<!-- 자막 바 (player.js가 제어, 캡처 시 숨김) -->
<div class="subtitle-bar" style="display:none;">
  <div class="subtitle-text" id="subtitleText"></div>
</div>

<!-- 플레이어 컨트롤 (캡처 시 숨김) -->
<div class="controls">
  <div class="progress-bar" id="progressBar">
    <div class="progress-fill" id="progressFill"></div>
  </div>
  <div class="controls-row">
    <button class="btn-play" id="btnPlay">&#9654;</button>
    <div class="time-display">
      <span id="timeCurrent">0:00</span> / <span id="timeTotal">2:10</span>
    </div>
    <div class="scene-indicator" id="sceneDots"></div>
  </div>
</div>
```

**`timeTotal` 값을 총 영상 길이에 맞게 수정하세요** (예: 130초 = 2:10).
