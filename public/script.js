// DOM 요소 가져오기
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const fileList = document.getElementById('fileList');
const extractBtn = document.getElementById('extractBtn');
const resetBtn = document.getElementById('resetBtn');
const loadingSection = document.getElementById('loadingSection');
const loadingText = document.getElementById('loadingText');
const resultSection = document.getElementById('resultSection');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const fixBtn = document.getElementById('fixBtn');
const progressFill = document.getElementById('progressFill');
const methodBadge = document.getElementById('methodBadge');
const visionMode = document.getElementById('visionMode');
const visionLang = document.getElementById('visionLang');

let currentFiles = [];

// 파일 입력 클릭 이벤트
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 파일 선택 이벤트
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
        handleFiles(files);
    }
});

// 드래그 앤 드롭 이벤트
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) {
        handleFiles(files);
    } else {
        alert('이미지 파일만 업로드할 수 있습니다.');
    }
});

// 파일 처리 함수 (여러 장)
function handleFiles(files) {
    currentFiles = files;
    const reader = new FileReader();
    
    // 첫 번째 파일만 미리보기
    reader.onload = (e) => {
        previewImage.src = e.target.result;
    };
    reader.readAsDataURL(files[0]);

    // 파일 목록 표시
    fileList.innerHTML = files.map((f, idx) => `(${idx + 1}) ${f.name}`).join('<br>');

    previewSection.style.display = 'block';
    resultSection.style.display = 'none';
    loadingSection.style.display = 'none';
}

// 다시 선택 버튼
resetBtn.addEventListener('click', () => {
    currentFiles = [];
    fileInput.value = '';
    previewSection.style.display = 'none';
    resultSection.style.display = 'none';
    loadingSection.style.display = 'none';
});

// 텍스트 추출 버튼
extractBtn.addEventListener('click', async () => {
    if (!currentFiles.length) return;
    
    const selectedMethod = document.querySelector('input[name="ocrMethod"]:checked').value;
    
    // UI 업데이트
    previewSection.style.display = 'none';
    resultSection.style.display = 'none';
    loadingSection.style.display = 'block';
    progressFill.style.width = '0%';
    
    try {
        let combinedTexts = [];
        let method = '';

        for (let i = 0; i < currentFiles.length; i++) {
            const file = currentFiles[i];

            if (selectedMethod === 'google') {
                loadingText.textContent = `Google Cloud Vision API로 텍스트 추출 중... (${i + 1}/${currentFiles.length})`;
                progressFill.style.width = `${Math.round((i / currentFiles.length) * 100)}%`;
                
                const formData = new FormData();
                formData.append('image', file);
                formData.append('mode', visionMode.value);
                formData.append('lang', visionLang.value);
                
                try {
                    const response = await fetch('/api/ocr', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        combinedTexts.push(data.text || '');
                        method = data.method || 'Google Cloud Vision API';
                    } else {
                        const errorData = await response.json();
                        if (errorData.fallback) {
                            // Google API를 사용할 수 없으면 Tesseract.js로 폴백
                            const reason = errorData.reason || errorData.error || 'Google Vision API 사용 불가';
                            throw new Error('FALLBACK_TO_TESSERACT:' + reason);
                        }
                        throw new Error(errorData.error || '서버 오류');
                    }
                } catch (fetchError) {
                    if (fetchError.message.startsWith('FALLBACK_TO_TESSERACT')) {
                        const reason = fetchError.message.split(':')[1] || 'Google Vision API 사용 불가';
                        loadingText.textContent = `Google OCR 실패 (${reason}) → Tesseract.js로 전환 (${i + 1}/${currentFiles.length})`;
                        const result = await extractWithTesseract(file);
                        combinedTexts.push(result.text);
                        method = result.method;
                    } else {
                        throw fetchError;
                    }
                }
            } else {
                // Tesseract.js 사용
                loadingText.textContent = `Tesseract.js로 텍스트 추출 중... (${i + 1}/${currentFiles.length})`;
                const result = await extractWithTesseract(file);
                combinedTexts.push(result.text);
                method = result.method;
            }
        }

        // 후처리: 한국어 맞춤법에 근거한 줄바꿈 자동 수정
        let formatted = fixKoreanLineBreaks(combinedTexts.join('\n'));
        
        // 한국어만 선택했을 때 중간에 오는 알파벳 제거
        const selectedLang = document.getElementById('visionLang').value;
        if (selectedLang === 'ko') {
            formatted = removeMisrecognizedAlphabets(formatted);
        }

        // 결과 표시
        resultText.value = formatted || '텍스트를 찾을 수 없습니다.';
        methodBadge.textContent = `사용된 방법: ${method}`;
        loadingSection.style.display = 'none';
        resultSection.style.display = 'block';
        
    } catch (error) {
        console.error('OCR 오류:', error);
        alert('텍스트 추출 중 오류가 발생했습니다: ' + error.message);
        loadingSection.style.display = 'none';
        previewSection.style.display = 'block';
    }
});

// Tesseract.js를 사용한 텍스트 추출
async function extractWithTesseract(fileToUse = null) {
    progressFill.style.width = '10%';
    
    const { data: { text } } = await Tesseract.recognize(
        fileToUse || currentFiles[0],
        'kor+eng', // 한국어와 영어 지원
        {
            logger: (m) => {
                // 진행률 업데이트
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 100);
                    progressFill.style.width = Math.max(10, progress) + '%';
                }
            }
        }
    );
    
    progressFill.style.width = '100%';
    
    return {
        text: text.trim() || '텍스트를 찾을 수 없습니다.',
        method: 'Tesseract.js'
    };
}

// 빈 줄만 제거하고 줄바꿈은 유지
function formatKoreanParagraphs(rawText) {
    if (!rawText) return '';

    return rawText
        .split(/\r?\n/)                    // 줄 기준 분리
        .map(line => line.replace(/\s+$/, '').trim()) // 줄 끝 공백 제거 후 trim
        .filter(Boolean)                    // 빈 줄만 제거 (줄바꿈은 유지)
        .join('\n')                         // 줄바꿈으로 다시 연결
        .replace(/\n{3,}/g, '\n\n')         // 연속된 빈 줄은 최대 2개로 제한
        .trim();
}

// 한국어 텍스트에서 오류로 인식된 알파벳 제거
// 한글 사이에 있는 단독 알파벳이나 짧은 알파벳 조합 제거
function removeMisrecognizedAlphabets(text) {
    if (!text) return '';
    
    // 한글 사이에 있는 단독 알파벳 (1-2글자) 제거
    // 예: "이것은 A 테스트" → "이것은 테스트"
    // 단, 숫자와 함께 있는 경우는 유지 (예: "A4", "B2")
    return text
        .replace(/([가-힣\s])([A-Za-z]{1,2})([가-힣\s])/g, (match, before, alphabet, after) => {
            // 숫자와 함께 있으면 유지
            if (/\d/.test(match)) return match;
            // 한글 사이에 있는 단독 알파벳만 제거
            return before + after;
        })
        // 줄 시작이나 끝에 있는 단독 알파벳 제거
        .replace(/^[A-Za-z]{1,2}\s+/gm, '')
        .replace(/\s+[A-Za-z]{1,2}$/gm, '')
        // 중복 공백 정리
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// 한국어 줄바꿈 오류 자동 수정 (문맥 기반, 한국어 맞춤법 근거)
function fixKoreanLineBreaks(text) {
    if (!text) return '';
    
    let fixed = text;
    
    // 1. 출판사 정보 및 불필요한 줄 제거
    fixed = fixed
        .replace(/^KYOBO\s*$/gmi, '')
        .replace(/^eBook\s*$/gmi, '')
        .replace(/^\d{10,}\s*$/gm, '') // 10자리 이상 숫자만 있는 줄
        .replace(/^[A-Z]{2,}\s*$/gm, '') // 대문자만 있는 줄 (2글자 이상)
        .trim();
    
    // 2. 말따옴표 처리
    // 먼저 "~라고 말했다" 같은 서술형 따옴표를 임시로 보호 (줄바꿈 추가하지 않음)
    fixed = fixed.replace(/("[^"]*")\s*라고\s*(말했다|했다|했다\.|했다,)/g, 'TEMP_QUOTE_SERVE$1TEMP_QUOTE_SERVE$2');
    
    // 말따옴표가 있는 대사는 앞뒤로 줄바꿈 추가
    // 패턴: 문장 + 줄바꿈 + 따옴표 대사 + 줄바꿈 + 문장
    // 단, "~라고 말했다" 패턴은 제외
    fixed = fixed.replace(/([가-힣.!?…])\s*\n\s*("[^"]*"[!?.]?)\s*\n\s*([가-힣])/g, (match, before, quote, after) => {
        // "~라고 말했다" 패턴이 아니면 줄바꿈 추가
        if (!after.match(/^라고\s*(말했다|했다)/)) {
            return `${before}\n\n${quote}\n\n${after}`;
        }
        return match;
    });
    
    // 3. 문맥 기반 줄바꿈 수정
    // 줄을 분리해서 처리
    const lines = fixed.split(/\r?\n/);
    const result = [];
    
    // 확장된 조사/어미 목록 (한국어 맞춤법 근거)
    const particles = [
        '의', '을', '를', '에', '에서', '에게', '한테', '께', '께서',
        '와', '과', '로', '으로', '도', '만', '까지', '부터', '부터는',
        '이', '가', '은', '는', '도', '라도', '만큼', '처럼', '같이',
        '보다', '에게서', '한테서', '께서', '에서부터', '까지도'
    ];
    
    const endings = [
        '을까', '는지', '는데', '는다', '는다고', '는다면', '다', '요', '죠', '네', '까', '나',
        '습니다', '습니까', '세요', '시다', '시죠', '시네', '시까', '시나',
        '어요', '아요', '어야', '아야', '어서', '아서', '어도', '아도',
        '었어', '았어', '었어요', '았어요', '었습니다', '았습니다',
        '겠어', '겠어요', '겠습니다', '겠죠', '겠네', '겠나',
        '을래', '을게', '을까요', '을래요', '을게요'
    ];
    
    // 조사/어미로 끝나는지 확인하는 함수
    function endsWithParticleOrEnding(line) {
        // 공백 제거 후 확인
        const trimmed = line.replace(/\s+$/, '');
        
        // 조사 확인 (뒤에서부터 긴 것부터)
        for (const p of particles.sort((a, b) => b.length - a.length)) {
            if (trimmed.endsWith(p)) {
                return true;
            }
        }
        
        // 어미 확인 (뒤에서부터 긴 것부터)
        for (const e of endings.sort((a, b) => b.length - a.length)) {
            if (trimmed.endsWith(e)) {
                return true;
            }
        }
        
        return false;
    }
    
    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i].trim();
        const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
        
        if (!currentLine) {
            // 빈 줄은 그대로 유지 (문단 구분)
            result.push('');
            continue;
        }
        
        // 현재 줄이 문장 끝으로 끝나는 경우 (., !, ?, …, ,)
        if (/[.!?…]$/.test(currentLine)) {
            result.push(currentLine);
            // 문장 끝 뒤에 빈 줄이 있으면 유지 (문단 구분)
            if (!nextLine && i < lines.length - 1) {
                result.push('');
            }
            continue;
        }
        
        // 다음 줄이 없으면 현재 줄만 추가
        if (!nextLine) {
            result.push(currentLine);
            continue;
        }
        
        // 현재 줄 끝과 다음 줄 시작 분석
        const currentEnd = currentLine.replace(/\s+$/, '').slice(-1);
        const nextStart = nextLine[0] || '';
        
        // 한글 단어가 줄바꿈으로 나뉜 경우 판단
        const isKoreanCharEnd = /[가-힣]$/.test(currentLine.replace(/\s+$/, ''));
        const isKoreanCharStart = /^[가-힣]/.test(nextLine);
        
        // 숫자나 특수문자로 끝나거나 시작하는 경우는 유지
        const endsWithNumberOrSpecial = /[\d\w\.,;:!?…\)\]\}]$/.test(currentLine.replace(/\s+$/, ''));
        const startsWithNumberOrSpecial = /^[\d\w\.,;:!?…\(\[\{]/.test(nextLine);
        
        // 한글 단어가 줄바꿈으로 나뉜 경우 (예: "어\n두웠다")
        // 조건:
        // 1. 현재 줄 끝이 한글로 끝나고 다음 줄 시작이 한글로 시작
        // 2. 현재 줄 끝이 조사/어미가 아님
        // 3. 숫자나 특수문자로 끝나지 않음
        if (isKoreanCharEnd && isKoreanCharStart && 
            !endsWithParticleOrEnding(currentLine) && 
            !endsWithNumberOrSpecial && 
            !startsWithNumberOrSpecial) {
            
            // 현재 줄 끝 공백 제거 후 다음 줄과 공백 없이 붙이기 (한글 단어가 나뉜 경우)
            result.push(currentLine.replace(/\s+$/, '') + nextLine);
            i++; // 다음 줄을 이미 처리했으므로 건너뛰기
        } else {
            // 완전한 단어들 사이의 줄바꿈 (예: "공단 쪽으로\n난 길은")
            // 띄어쓰기 유지
            result.push(currentLine);
        }
    }
    
    fixed = result.join('\n');
    
    // 4. 서술형 따옴표 복원
    fixed = fixed.replace(/TEMP_QUOTE_SERVE/g, '');
    
    // 5. 중복 공백 정리
    fixed = fixed.replace(/[ \t]{2,}/g, ' ');
    
    // 6. 줄 끝 공백 제거
    fixed = fixed.replace(/[ \t]+$/gm, '');
    
    // 7. 연속된 빈 줄은 최대 2개로 제한
    fixed = fixed.replace(/\n{3,}/g, '\n\n');
    
    return fixed.trim();
}

// 자동 수정 버튼
fixBtn.addEventListener('click', () => {
    const originalText = resultText.value;
    const fixedText = fixKoreanLineBreaks(originalText);
    resultText.value = fixedText;
    
    // 피드백 제공
    const originalTextBtn = fixBtn.textContent;
    fixBtn.textContent = '✓ 수정 완료!';
    fixBtn.style.background = '#4caf50';
    
    setTimeout(() => {
        fixBtn.textContent = originalTextBtn;
        fixBtn.style.background = '';
    }, 2000);
});

// 복사 버튼
copyBtn.addEventListener('click', () => {
    resultText.select();
    document.execCommand('copy');
    
    // 피드백 제공
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ 복사됨!';
    copyBtn.style.background = '#4caf50';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
    }, 2000);
});

// 다운로드 버튼
downloadBtn.addEventListener('click', () => {
    const text = resultText.value;
    if (!text) return;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_text_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

