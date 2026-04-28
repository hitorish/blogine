# 블로그 영상 제작 하네스

블로그 글 컨텐츠를 세로형(9:16) 숏폼 영상으로 변환하는 HTML+CSS 기반 제작 시스템입니다.

## 목차

- [아키텍처 개요](#아키텍처-개요)
- [빠른 시작 (새 영상 만들기)](#빠른-시작)
- [상세 가이드](#상세-가이드)
  - [1. 씬 구성 가이드](./scene-guide.md)
  - [2. 애니메이션 시스템](./animation-system.md)
  - [3. 플레이어 설정](./player-config.md)
  - [4. 에셋 준비](./asset-guide.md)
  - [5. 캡처 및 렌더링](./capture-render.md)
- [디자인 토큰](./design-tokens.md)

---

## 아키텍처 개요

```
블로그 글 → 씬 분할 → HTML/CSS 구현 → 브라우저 프리뷰 → Puppeteer 캡처 → FFmpeg MP4
```

### 핵심 구성요소

| 구성요소 | 역할 | 파일 |
|---------|------|------|
| **index.html** | 씬 레이아웃 + 콘텐츠 | `v{N}/index.html` |
| **common.css** | 공통 스타일 + 애니메이션 | `v{N}/css/common.css` |
| **scene-{N}.css** | 개별 씬 스타일 | `v{N}/css/scene-{N}.css` |
| **player.js** | 타이밍 + 씬 전환 + 오디오 | `v{N}/js/player.js` |
| **capture.js** | Puppeteer 녹화 + FFmpeg 변환 | `tools/capture.js` |
| **assets/** | 이미지, 오디오, 로고 | `assets/images/`, `assets/audio/` |

### 폴더 구조 (새 영상)

```
project/
├── v{N}/                    # 영상 버전 폴더
│   ├── index.html               # 메인 HTML (씬 레이아웃)
│   ├── css/
│   │   ├── common.css           # 공통 스타일 + 애니메이션
│   │   ├── scene-1.css          # 씬별 개별 스타일
│   │   ├── scene-2.css
│   │   └── ...
│   └── js/
│       └── player.js            # 플레이어 로직
├── assets/
│   ├── images/
│   │   ├── scene_{N}/           # 씬별 이미지
│   │   └── 로고/                # 브랜드 로고
│   └── audio/
│       ├── scene_{N}/           # 씬별 TTS 오디오 (.wav)
│       └── ...
├── tools/
│   └── capture.js               # 녹화 스크립트
└── output/                      # 최종 MP4 출력
```

---

## 빠른 시작

### 1. 블로그 글 분석 → 씬 분할

블로그 글을 7~9개 씬으로 분할합니다. 권장 구조:

| 순서 | 씬 유형 | 역할 | 권장 시간 |
|------|---------|------|----------|
| 1 | **인트로** | 타이틀 + 훅 | 6~10초 |
| 2~3 | **핵심 개념** | 주요 내용 설명 | 각 11~16초 |
| 4~5 | **심화/비교** | 상세 설명, 비교, 데이터 | 각 11~19초 |
| 6~7 | **실용 정보** | 검사, 관리법, 팁 등 | 각 12~18초 |
| 8 | **아웃트로** | CTA + 마무리 메시지 | 10~14초 |
| 9 | **브랜드** | 브랜드 로고 + 슬로건 | 8~10초 |

**총 영상 길이: 90~130초 권장**

### 2. 에셋 준비

```
assets/images/scene_{N}/   ← 씬별 이미지/영상 배치
assets/audio/scene_{N}/    ← 씬별 TTS .wav 파일
assets/images/로고/        ← 브랜드 로고
```

### 3. HTML 작성

v5를 복사 후 콘텐츠 교체:
```bash
cp -r v5 v{NEW}
```

### 4. 프리뷰 → 캡처

```bash
# 브라우저에서 index.html 열어 프리뷰
# 만족 시 캡처
node tools/capture.js
```

---

상세 내용은 각 가이드 문서를 참조하세요.
