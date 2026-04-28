# Blogine — blog-to-video generator

블로그 콘텐츠를 9:16 세로형 숏폼 영상(HTML/CSS/JS)으로 변환하는 데모입니다.

데모 흐름: 사용자가 웹 UI에서 이미지+텍스트 업로드 → 백엔드가 `claude -p`로 이 파일을 읽어 새 영상 생성 → 결과 HTML을 iframe으로 재생.

## Project layout

| 경로 | 역할 |
|------|------|
| `template/` | 영상 생성용 정본 템플릿. **이걸 복사해서 시작** |
| `assets/images/`, `assets/audio/` | 템플릿에서 쓰는 샘플 에셋 (수정 금지) |
| `sessions/<id>/input/` | 사용자 입력 (생성 요청마다 1개) |
| `sessions/<id>/output/` | **당신이 만들어야 할 결과물** |
| `server.js`, `public/` | 데모 웹서버/프론트 |
| `docs/` | 템플릿 내부 구조 문서 (참고) |

## Video template

영상은 9개 씬, 총 ~90–130초.

| # | 유형 | 권장 시간 | 역할 |
|---|------|-----------|------|
| 1 | Intro | 6–10s | 타이틀 + 훅 |
| 2–3 | Core | 11–16s | 핵심 개념 |
| 4–5 | Detail | 11–19s | 비교/심화 |
| 6–7 | Practical | 12–18s | 팁/정보 |
| 8 | Outro | 10–14s | CTA |
| 9 | Brand | 8–10s | 브랜드 로고 |

영상 폴더 구성:
- `index.html` — 씬 마크업 (`<div class="scene scene-N">` × 9)
- `css/common.css` — 공통 스타일/애니메이션 (절대 변경 금지)
- `css/scene-N.css` — 씬별 스타일
- `js/player.js` — `SCENES` (타이밍), `SUBTITLES`, `SCENE_AUDIO` 배열 + 애니메이션 로직

## 생성 작업 (`sessions/<id>/output/` 만들기)

1. **시작**: `template/`를 통째로 `sessions/<id>/output/`으로 복사.
2. **입력 읽기**:
   - `sessions/<id>/input/content.txt` — 블로그 텍스트
   - `sessions/<id>/input/images/` — 업로드된 이미지 (`1.png`, `2.png`, …)
3. **`output/index.html` 갱신**:
   - 9개 씬 레이아웃 유지
   - 텍스트 콘텐츠를 새 블로그 내용으로 교체
   - `<img src="...">` 경로를 `../input/images/<n>.png` (또는 적절한 확장자)로 교체
   - 모든 이미지가 실제 존재하는 파일을 참조하는지 확인 — 없으면 그 위치엔 SVG/그래픽 요소로 대체
4. **`output/js/player.js` 갱신**:
   - `SUBTITLES` 배열 — 각 씬당 한 줄 자막
   - `SCENE_AUDIO` 배열 — **모든 항목을 `''` (빈 문자열) 로 설정**. 세션엔 TTS 오디오가 없음.
   - `SCENES` 타이밍 — 씬 길이 조정해 총 ~120초 유지
5. **`output/css/scene-N.css`** — 필요할 때만 손대고, `player.js`가 참조하는 클래스는 보존.
6. **마무리**: `sessions/<id>/output/.done` 파일에 `ok` 작성.

## Hard rules

- **절대** `template/`, `assets/`를 수정하지 말 것 (참고용)
- **절대** `capture.js`, `ffmpeg`, `puppeteer`를 호출하지 말 것 — 출력은 HTML
- `player.js`가 쿼리하는 클래스 이름(`.heading`, `.body-text`, `.text-highlight`, `.anim-fade-up`, `.delay-1` … `.delay-8`, `.scene`, `.active` 등)은 그대로 유지
- 새 외부 의존성/CDN 추가 금지
- 한국어로 콘텐츠 작성 (블로그 입력이 한국어라면)

## 참고: player.js가 기대하는 씬별 DOM

각 씬에 **반드시 있어야 하는** 요소가 player.js의 `animateScene()`에 하드코딩되어 있음. 새 영상도 template과 같은 DOM 구조 유지:

- Scene 1: `.bg-photo`, `.title-main`, `.subtitle`, `.line-accent`
- Scene 2: `.heading`, `.video-wrap` (없어도 OK), `.body-text`, `.highlight-box`, `.footnote`
- Scene 3: `.heading`, `.char-area`, `.mech-step` × 3, `.important-note`
- Scene 4: `.heading`, `.sub-question`, `.cell-card` × N, `.battle-area`, `.bottom-note`
- Scene 5: `.nk-dizzy` (선택), `.heading`, `.warning-content` × 2, `.danger-meter`, `.danger-fill`, `.meter-labels`, `.question-prompt`, `.source`
- Scene 6: `.top-label`, `.heading`, `.level-table`, `.level-row` × N, `.table-note`
- Scene 7: `.heading`, `.manage-item` × N, `.closing-text`
- Scene 8: `.shield-illust`, `.outro-heading`, `.outro-highlight`, `.outro-body`, `.outro-cta`, `.brand`
- Scene 9: `.badge`, `.main-copy`, `.sub-copy`, `.divider`, `.brand-logo`

내용을 바꿔도 이 DOM 구조와 클래스 이름은 그대로 두는 게 가장 안전함.
