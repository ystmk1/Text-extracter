# Opticon / OCR

Google Cloud Vision API를 사용한 배치 OCR 텍스트 추출 웹앱. 여러 이미지를 한번에 업로드해 순서대로 텍스트를 추출하고, 화면에서 바로 수정 후 복사/다운로드할 수 있습니다.

## 주요 기능

- **배치 처리**: 여러 이미지를 한번에 업로드, 순차적으로 OCR 처리
- **고품질 인식**: Google Vision `DOCUMENT_TEXT_DETECTION` 모드 (밀집 텍스트·다국어·손글씨 우수)
- **언어 힌트**: 한국어/영어/일본어/중문/한영혼용 지원
- **순서 조정**: 목록에서 드래그로 이미지 순서 재배열
- **구분자 선택**: 이미지 간 연결 방식 5가지 (빈 줄, 줄바꿈, 마커, 파일명 헤더, 없음)
- **실시간 진행률**: 처리 중인 이미지, 성공/실패 상태 개별 표시
- **인라인 편집**: 추출된 텍스트를 바로 수정 후 복사/다운로드
- **입력 방식**: 드래그앤드롭, 파일 선택, 클립보드 붙여넣기 (`Ctrl+V`)

## 사전 준비

1. [Google Cloud Console](https://console.cloud.google.com/apis/library/vision.googleapis.com)에서 Vision API 활성화
2. [API 키 생성](https://console.cloud.google.com/apis/credentials)
3. (권장) API 키에 HTTP 리퍼러 제한 설정 (예: `http://localhost:5173/*`)

## 실행

```bash
# 의존성 설치
npm install

# 개발 서버 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

빌드 결과는 `dist/` 디렉토리에 생성됩니다. 정적 파일이라 그대로 웹서버에 올리거나, 심지어 `index.html`을 브라우저에서 바로 열어도 동작합니다.

## 프로젝트 구조

```
opticon-ocr/
├── src/
│   ├── index.html       # 진입점 HTML
│   ├── css/
│   │   └── styles.css   # 전체 스타일 (CSS 변수 기반 테마)
│   └── js/
│       ├── main.js      # 진입점 · 앱 초기화
│       ├── state.js     # 전역 상태 관리
│       ├── storage.js   # API 키 localStorage 저장
│       ├── ocr.js       # Google Vision API 호출
│       ├── imageList.js # 이미지 목록 렌더링 · DnD 재정렬
│       ├── upload.js    # 파일 업로드 · 드롭 · 붙여넣기
│       ├── extract.js   # 배치 추출 로직
│       ├── output.js    # 텍스트 조합 · 편집 · 복사/다운로드
│       └── ui.js        # 토스트 · 상태 표시 등 UI 유틸
├── public/              # 정적 파일 (필요시)
├── package.json
├── vite.config.js
└── README.md
```

## API 키 저장 방식

API 키는 **브라우저 `localStorage`에만 저장**되며 서버로 전송되지 않습니다. 키 값은 직접 Google Vision API로만 전송됩니다 (클라이언트 사이드 호출).

보안을 위해 Google Cloud Console에서 API 키에 다음 제한을 거는 것을 권장합니다:
- **애플리케이션 제한**: HTTP 리퍼러
- **API 제한**: Cloud Vision API만 허용

## 커스터마이징 가이드

- **테마 색상**: `src/css/styles.css` 상단 `:root` CSS 변수 수정
- **폰트**: `src/index.html` Google Fonts `<link>` 교체
- **구분자 추가**: `src/js/output.js`의 `combineText()` 함수 내 `switch` 블록 확장
- **언어 추가**: `src/index.html`의 `#langHint` `<select>` 옵션 추가
- **추출 모드 변경**: `src/js/ocr.js`의 `features[0].type`을 `TEXT_DETECTION`으로 변경 시 일반 텍스트 감지 모드

## 기술 스택

- Vanilla JavaScript (ES Modules) — 프레임워크 없음, 프로덕션 의존성 0개
- Vite — 개발 서버 및 빌드
- Google Cloud Vision REST API

## 라이선스

MIT
