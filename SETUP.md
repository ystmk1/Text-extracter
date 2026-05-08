# 설정 가이드

## Google Cloud Vision API 설정 방법

### 방법 1: 서비스 계정 키 파일 사용 (권장)

1. **Google Cloud 프로젝트 생성**
   - [Google Cloud Console](https://console.cloud.google.com/) 접속
   - 새 프로젝트 생성 또는 기존 프로젝트 선택

2. **Cloud Vision API 활성화**
   - 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 선택
   - "Cloud Vision API" 검색 후 활성화

3. **서비스 계정 생성**
   - "API 및 서비스" > "사용자 인증 정보" 선택
   - "사용자 인증 정보 만들기" > "서비스 계정" 선택
   - 서비스 계정 이름 입력 후 생성

4. **키 파일 다운로드**
   - 생성된 서비스 계정 클릭
   - "키" 탭으로 이동
   - "키 추가" > "새 키 만들기" 선택
   - JSON 형식 선택 후 생성
   - 다운로드된 JSON 파일을 프로젝트 루트에 `google-credentials.json`으로 저장

5. **서비스 계정에 역할 부여**
   - 서비스 계정 편집 화면에서
   - "역할"에 "Cloud Vision API 사용자" 또는 "편집자" 추가

### 방법 2: API 키 사용 (간단하지만 제한적)

1. **API 키 생성**
   - Google Cloud Console에서 "API 및 서비스" > "사용자 인증 정보" 선택
   - "사용자 인증 정보 만들기" > "API 키" 선택
   - 생성된 API 키 복사

2. **환경변수 설정**

   **Windows PowerShell:**
   ```powershell
   $env:GOOGLE_API_KEY="여기에-API-키-입력"
   ```

   **Windows CMD:**
   ```cmd
   set GOOGLE_API_KEY=여기에-API-키-입력
   ```

   **Linux/Mac:**
   ```bash
   export GOOGLE_API_KEY="여기에-API-키-입력"
   ```

   또는 `.env` 파일 생성:
   ```
   GOOGLE_API_KEY=여기에-API-키-입력
   ```

3. **API 키 제한 설정 (보안 권장)**
   - 생성된 API 키 클릭
   - "애플리케이션 제한사항"에서 "HTTP 리퍼러(웹사이트)" 선택
   - "API 제한사항"에서 "Cloud Vision API"만 선택

## 비용 정보

- **무료 티어**: 월 1,000건까지 무료
- **이후 요금**: 이미지당 약 $1.50 (1,000건당)
- 자세한 가격: [Google Cloud Vision API 가격](https://cloud.google.com/vision/pricing)

## 문제 해결

### "API 키가 유효하지 않습니다" 오류

- API 키가 올바르게 입력되었는지 확인
- Cloud Vision API가 활성화되었는지 확인
- API 키 제한 설정 확인

### "권한이 없습니다" 오류 (서비스 계정 사용 시)

- 서비스 계정에 적절한 역할이 부여되었는지 확인
- Cloud Vision API가 활성화되었는지 확인

### Google API를 사용할 수 없는 경우

- Tesseract.js 옵션을 선택하여 로컬 처리 사용
- 인터넷 연결 확인
- 방화벽 설정 확인

