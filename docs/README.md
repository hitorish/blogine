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
- [디자인 토큰](./design-tokens.md)

---

## 아키텍처 개요

```
블로그 글 + 이미지 → 마법사 UI → Claude Code → template/ 복사·수정 → HTML 재생
```

### 핵심 구성요소

| 구성요소 | 역할 | 파일 |
|---------|------|------|
| **index.html** | 씬 레이아웃 + 콘텐츠 | `template/index.html` |
| **common.css** | 공통 스타일 + 애니메이션 | `template/css/common.css` |
| **scene-{N}.css** | 개별 씬 스타일 | `template/css/scene-{N}.css` |
| **player.js** | 타이밍 + 씬 전환 + 오디오 | `template/js/player.js` |
| **server.js** | 데모 백엔드 (세션·생성 API) | `server.js` |
| **public/** | 데모 프론트엔드 (마법사 UI) | `public/` |
| **assets/** | 샘플 이미지/오디오 | `assets/images/`, `assets/audio/` |

### 폴더 구조

```
blogine/
├── server.js                    # Express 백엔드
├── public/                      # 마법사 UI
│   ├── index.html
│   ├── style.css
│   └── app.js
├── template/                    # 정본 영상 템플릿
│   ├── index.html               # 9-씬 레이아웃
│   ├── css/
│   │   ├── common.css           # 공통 스타일 + 애니메이션
│   │   └── scene-1.css … scene-9.css
│   └── js/
│       └── player.js            # 타이밍/씬 전환/오디오
├── assets/                      # 샘플 에셋 (NK세포 예시)
│   ├── images/
│   │   ├── scene_{N}/
│   │   └── 로고/
│   └── audio/
│       └── scene_{N}/           # TTS .wav
├── docs/                        # 문서
└── sessions/                    # 런타임 생성물 (gitignore)
    └── <id>/
        ├── input/               # 사용자 업로드
        └── output/              # 생성된 영상
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

### 3. 데모 실행

```bash
npm install
npm start                  # http://localhost:3000
```

브라우저에서 이미지 + 블로그 텍스트 업로드 → 백엔드가 `template/`을 복사·수정해서 `sessions/<id>/output/`을 생성 → iframe으로 재생.

---

상세 내용은 각 가이드 문서를 참조하세요.
