# 텍스트 추출기 (고정확도 OCR)

Google Cloud Vision API를 사용한 고정확도 텍스트 인식 웹 애플리케이션입니다. 브라우저에서 직접 실행되며, 별도의 백엔드 서버 없이 동작하는 서버리스(Static) 아키텍처입니다.

## 주요 기능

- 📸 **이미지 업로드**: 드래그 앤 드롭 및 다중 이미지 업로드 지원
- 🔍 **고정확도 OCR**: Google Cloud Vision API를 사용하여 도서 스캔본 최적화 인식
- 🪄 **지능적 후처리**: 한국어 조사 및 문맥을 분석하여 쪼개진 문장을 매끄럽게 결합
- 📋 **맞춤법 교정**: 외부 API 연동을 통한 실시간 한국어 맞춤법 수정
- 📋 **결과 관리**: 추출된 텍스트 복사 및 텍스트 파일 다운로드 지원

## 설치 및 실행

이 프로젝트는 정적 파일(HTML/JS/CSS)로만 구성되어 있어 별도의 빌드 과정이 필요 없습니다.

### 1. 로컬에서 실행
1. 프로젝트를 다운로드합니다.
2. `index.html` 파일을 브라우저로 열거나, VS Code의 **Live Server** 확장 프로그램을 사용하여 실행합니다.

### 2. Google Cloud Vision API 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트를 생성합니다.
2. **Cloud Vision API**를 활성화합니다.
3. **사용자 인증 정보** 메뉴에서 **API 키**를 생성합니다.
4. 웹 UI의 설정 버튼을 클릭하여 생성한 API 키를 입력합니다. (키는 브라우저의 `localStorage`에 안전하게 보관됩니다.)

## Vercel 배포 방법

이 프로젝트는 Vercel에 최적화되어 있습니다.

1. GitHub 저장소에 코드를 푸시합니다.
2. Vercel에서 새로운 프로젝트를 생성하고 해당 저장소를 연결합니다.
3. 빌드 설정(Build Settings)은 기본값(None)으로 두면 자동으로 `index.html`을 서빙합니다.

## 기술 스택

- **OCR 엔진**: Google Cloud Vision API, Tesseract.js (폴백)
- **프론트엔드**: Vanilla JavaScript (ES6+), CSS3 (Flexbox/Grid), HTML5
- **외부 연동**: Speller Town API (한국어 맞춤법 교정)

## 라이선스

MIT License
