# 텍스트 추출기 (고정확도 OCR)

Google Cloud Vision API를 사용한 고정확도 텍스트 인식 웹 애플리케이션입니다.

## 주요 기능

- 📸 이미지 업로드 (드래그 앤 드롭 지원)
- 🔍 Google Cloud Vision API를 사용한 고정확도 텍스트 인식
- 📋 Tesseract.js 폴백 옵션 (로컬 처리)
- 📋 추출된 텍스트 복사
- 💾 텍스트 파일 다운로드
- 🇰🇷 한국어 및 영어 지원

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. Google Cloud Vision API 설정

두 가지 방법 중 하나를 선택하세요:

#### 방법 1: 서비스 계정 키 파일 사용 (권장)

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Cloud Vision API 활성화
3. 서비스 계정 생성 및 키 다운로드
4. `google-credentials.json` 파일을 프로젝트 루트에 저장

#### 방법 2: API 키 사용

환경변수로 API 키 설정:

```bash
# Windows PowerShell
$env:GOOGLE_API_KEY="your-api-key-here"

# Windows CMD
set GOOGLE_API_KEY=your-api-key-here

# Linux/Mac
export GOOGLE_API_KEY="your-api-key-here"
```

또는 `.env` 파일 생성:

```
GOOGLE_API_KEY=your-api-key-here
```

### 3. 서버 실행

```bash
npm start
```

개발 모드 (자동 재시작):

```bash
npm run dev
```

### 4. 브라우저에서 접속

```
http://localhost:3000
```

## 사용 방법

1. 이미지를 드래그하거나 클릭하여 업로드합니다.
2. OCR 방법 선택:
   - **Google Cloud Vision API**: 고정확도 (인터넷 연결 필요)
   - **Tesseract.js**: 로컬 처리 (인터넷 불필요, 정확도 낮음)
3. "텍스트 추출하기" 버튼을 클릭합니다.
4. 추출된 텍스트를 복사하거나 다운로드합니다.

## 기술 스택

- **백엔드**: Node.js, Express
- **OCR 엔진**: Google Cloud Vision API, Tesseract.js
- **프론트엔드**: HTML5, CSS3, JavaScript (Vanilla)

## Google Cloud Vision API 비용

- 무료 티어: 월 1,000건까지 무료
- 이후: 이미지당 약 $1.50 (1,000건당)

자세한 가격 정보는 [Google Cloud Vision API 가격](https://cloud.google.com/vision/pricing)을 참조하세요.

## 문제 해결

### Google Cloud Vision API가 작동하지 않는 경우

- API 키 또는 서비스 계정 키가 올바르게 설정되었는지 확인
- Cloud Vision API가 활성화되었는지 확인
- 인터넷 연결 확인
- Tesseract.js 옵션을 선택하여 로컬 처리 사용

### Tesseract.js 인식률이 낮은 경우

- Google Cloud Vision API 사용 (더 높은 정확도)
- 이미지 품질 개선 (해상도, 명확도, 대비)
- 이미지 전처리 (회전 보정, 명암 조정)

## 라이선스

MIT
