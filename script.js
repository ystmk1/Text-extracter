// DOM 요소 가져오기
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const fileListEl = document.getElementById('fileList');
const extractBtn = document.getElementById('extractBtn');
const resetBtn = document.getElementById('resetBtn');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const progressFill = document.getElementById('progressFill');
const loadingText = document.getElementById('loadingText');
const methodBadge = document.getElementById('methodBadge');

// API Key UI 요소
const apiKeyInput = document.getElementById('apiKey');
const geminiApiKeyInput = document.getElementById('geminiApiKey'); // 29차 추가
const radioGoogle = document.querySelector('input[value="google"]');
const radioTesseract = document.querySelector('input[value="tesseract"]');
const googleVisionConfig = document.getElementById('googleVisionConfig');
const visionMode = document.getElementById('visionMode');
const visionLang = document.getElementById('visionLang');
const postProcessMode = document.getElementById('postProcessMode');
const fixBtn = document.getElementById('fixBtn');
const spellerBtn = document.getElementById('spellerBtn');
const spellerRevertBtn = document.getElementById('spellerRevertBtn');

let currentFiles = [];
let spellOriginalText = null;

// 초기화: API Key를 localStorage에서 불러오기
const savedKey = localStorage.getItem('google_vision_api_key');
if (savedKey) apiKeyInput.value = savedKey;

const savedGeminiKey = localStorage.getItem('google_gemini_api_key'); // 29차 추가
if (savedGeminiKey) geminiApiKeyInput.value = savedGeminiKey;

// API Key 입력 시 자동 저장
apiKeyInput.addEventListener('change', (e) => {
    const val = e.target.value.trim();
    if (val) localStorage.setItem('google_vision_api_key', val);
    else localStorage.removeItem('google_vision_api_key');
});

geminiApiKeyInput.addEventListener('change', (e) => { // 29차 추가
    const val = e.target.value.trim();
    if (val) localStorage.setItem('google_gemini_api_key', val);
    else localStorage.removeItem('google_gemini_api_key');
});

// 라디오 전환에 따른 설정 UI 표시/숨김
function updateConfigUI() {
    if (radioGoogle.checked) {
        googleVisionConfig.style.display = 'block';
    } else {
        googleVisionConfig.style.display = 'none';
    }
}
radioGoogle.addEventListener('change', updateConfigUI);
radioTesseract.addEventListener('change', updateConfigUI);
updateConfigUI(); // 초기 상태 반영

// 파일 입력 클릭 이벤트
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 파일 선택 이벤트
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
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
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    
    if (files.length > 0) {
        handleFiles(files);
    } else {
        alert('이미지 파일만 업로드할 수 있습니다.');
    }
});

// 파일 처리 함수
function handleFiles(files) {
    if (!files || files.length === 0) return;
    currentFiles = Array.from(files);
    renderFileList();
    showPreview(currentFiles[0]);
    previewSection.style.display = 'block';
    resultSection.style.display = 'none';
    loadingSection.style.display = 'none';
}

function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => { previewImage.src = e.target.result; };
    reader.readAsDataURL(file);
}

let dragSrcIndex = null;

function renderFileList() {
    fileListEl.innerHTML = '';

    if (currentFiles.length <= 1) {
        fileListEl.style.display = 'none';
        return;
    }

    fileListEl.style.display = 'block';

    currentFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.draggable = true;
        item.dataset.index = index;

        item.innerHTML = `
            <span class="file-drag-handle" title="드래그로 순서 변경">⠿</span>
            <span class="file-item-name">${index + 1}. ${file.name}</span>
            <div class="file-order-btns">
                <button class="order-btn" data-dir="up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button class="order-btn" data-dir="down" data-index="${index}" ${index === currentFiles.length - 1 ? 'disabled' : ''}>↓</button>
            </div>`;

        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('order-btn')) return;
            fileListEl.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            showPreview(currentFiles[index]);
        });

        item.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                if (btn.dataset.dir === 'up' && idx > 0) {
                    [currentFiles[idx - 1], currentFiles[idx]] = [currentFiles[idx], currentFiles[idx - 1]];
                } else if (btn.dataset.dir === 'down' && idx < currentFiles.length - 1) {
                    [currentFiles[idx], currentFiles[idx + 1]] = [currentFiles[idx + 1], currentFiles[idx]];
                }
                renderFileList();
            });
        });

        item.addEventListener('dragstart', (e) => {
            dragSrcIndex = index;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
        item.addEventListener('dragover', (e) => { e.preventDefault(); item.classList.add('drag-over'); });
        item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            const toIndex = index;
            if (dragSrcIndex !== null && dragSrcIndex !== toIndex) {
                const moved = currentFiles.splice(dragSrcIndex, 1)[0];
                currentFiles.splice(toIndex, 0, moved);
                renderFileList();
            }
            dragSrcIndex = null;
        });

        fileListEl.appendChild(item);
    });

    fileListEl.querySelector('.file-item').classList.add('active');
}

// 다시 선택 버튼
resetBtn.addEventListener('click', () => {
    currentFiles = [];
    fileInput.value = '';
    previewSection.style.display = 'none';
    resultSection.style.display = 'none';
    loadingSection.style.display = 'none';
    resetSpellerState();
});

// Base64 유틸리티
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64Str = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
            resolve(base64Str);
        };
        reader.onerror = error => reject(error);
    });
}

// 책 후처리 (줄바꿈 정리) 함수
function processBookText(text, mode, targetPageNum = null) {
    if (mode === 'off' || !text) return text;

    // 1. 조사/어미 리스트 (의존 명사 '수', '것' 등은 제외하여 오결합 방지)
    const suffixList = [
        "은", "는", "이", "가", "을", "를", "의", "에", "에서", "에게", "로", "으로", "와", "과", "도", "만", 
        "까지", "마저", "조차", "부터", "이나", "나", "라도", "다", "고", "며", "면", "니", "지", "게", "어", "아", 
        "던", "었", "았", "겠", "십", "습", "운", "음", "기", "할", "한", "하는", "하", "된", "될",
        "스럽", "스러운", "로운", "롭", "리", "리를", "라", "라며", "였", "였던", "였으", 
        "었던", "았단", "웠던", "겠으", "다며", "다고", "라는", "다는", "이랄", "이냐", "냐며",
        "서", "진", "온", "예요", "어지는", "어요", "각", "요", "해질", "이다",
        "단하여", "동차의", "었다", "차",
        "이의", "했다", "해지기", "거든",
        "아야",
        "랑이를", "스러웠다", "동안을", "가로를",
        "히는", "겠다",
        "구먼요", "점에", "움에",
        "이야", "실한", "이라", "었잖아",
        "온다", "인가",
        "밖", "밖을",
        "지요", 
        "갈수", "될",
        "없이", "게", "다시", "등짝에", "흔적이",
        "셨습니다", "름도", "닥에",
        "종의", "러운", "쳐져", "구이자",
        "졌고", "품의", "입니다",
        "카타", "드를", "늘게", "만일",
        "가?", "합니까", "갤",
        "마리를", "서랍에서",
        "좇아", "가다가는", "없이", "되니까", // 29차 분석 케이스 (소설 표현)
        "안일", "만스럽", "무런", "미를", "어오는", "아왔다", "람들은", "질밖에"
    ];
    const suffixPattern = suffixList.join('|');
    const suffixRegex = new RegExp(`^(${suffixPattern})`);

    // 2. 노이즈 제거
    text = text.replace(/[·.．…‥・]{2,}/g, '...');
    text = text.replace(/[\u4e00-\u9fa5]+/g, '');
    
    // 2-3. [연속 숫자 기반] 페이지 번호 처리 (삭제가 아닌 구분자로 활용)
    if (targetPageNum !== null) {
        // 단어 사이에 페이지 번호가 박힌 경우 -> 구분자로 변경하여 흐름 분리
        const midPageRegex = new RegExp(`([가-힣])\\s*${targetPageNum}\\s*([가-힣])`, 'g');
        text = text.replace(midPageRegex, `$1\n\n${targetPageNum}p.\n\n$2`);
        
        // 줄 시작/끝의 페이지 번호 -> 포맷팅 및 개행 추가
        const edgePageRegex = new RegExp(`(^|\\n)\\s*${targetPageNum}\\s*(\\n|$)`, 'g');
        text = text.replace(edgePageRegex, `$1\n\n${targetPageNum}p.\n\n$2`);
    }

    // 2-4. 대화문 및 지문 강제 분리 (가독성 향상)
    // 2-4-1. 대화문 종료 후 바로 지문이 오는 경우: "...말이야."조니워커는 -> "...말이야."\n\n조니워커는
    text = text.replace(/([.!?]["”’'’])([가-힣])/g, '$1\n\n$2');
    
    // 2-4-2. 지문 종료 후 바로 대화문이 오는 경우: ...들이댔다. "탕!" -> ...들이댔다.\n\n"탕!"
    text = text.replace(/([.!?])\s*(["“「『'‘])/g, '$1\n\n$2');
    
    // 2-4-3. 대화문과 대화문이 붙어 있는 경우: ...건가요?""그렇지 -> ...건가요?"\n\n"그렇지
    text = text.replace(/(["”’'’])\s*(["“「『'‘])/g, '$1\n\n$2');

    // 2-5. 기타 고정 노이즈 제거
    text = text.replace(/(?:\n|^)\d+\s*[・·]\s*/g, '\n');
    text = text.replace(/(?:\n|^)\d+\s+([가-힣A-Za-z“"「『'‘])/g, '\n$1');
    text = text.replace(/(?<=\n|^)[가-힣]\s+([“"「『'‘])/g, '$1');
    text = text.replace(/([“"「『'‘])\s+/g, '$1');
    text = text.replace(/([A-Za-z])\s+([은는이가을를의에])/g, '$1$2');
    text = text.replace(/을유행/g, '');

    // 3. 내부 공백 수정 (단어 사이의 오공백 제거 - 보수적 적용)
    const internalFixRegex = new RegExp(`([가-힣])\\s+(${suffixPattern})(?=[\\s.,!?"'”’]|$)`, 'g');
    text = text.replace(internalFixRegex, '$1$2');

    let lines = text.split(/\r?\n/);
    let result = '';
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let trimmed = line.trim();
        if (trimmed === '') { 
            if (!result.endsWith('\n\n')) result += '\n\n'; 
            continue; 
        }

        // 페이지 구분자(p.)가 포함된 줄은 절대 합치지 않음
        const isPageMarker = /^\d+p\.$/.test(trimmed);
        const isTerminator = /[.!?]['"”’'’]?$/.test(trimmed);
        const hasHyphen = /-$/.test(trimmed);

        let nextTrimmed = '';
        if (i < lines.length - 1) nextTrimmed = lines[i+1].trim();
        const isNextDialogue = /^[“"「『'‘]/.test(nextTrimmed);
        const isCurrentDialogue = /^[“"「『'‘]/.test(trimmed);
        const isNextPageMarker = /^\d+p\.$/.test(nextTrimmed);

        if (hasHyphen && nextTrimmed !== '' && /^[a-zA-Z]/.test(nextTrimmed)) {
            result += trimmed.slice(0, -1);
        } else {
            result += trimmed;
        }

        if (i < lines.length - 1) {
            if (nextTrimmed === '') {
                result += '\n';
            } else if (isCurrentDialogue || isNextDialogue || isPageMarker || isNextPageMarker) {
                // 페이지 구분자나 대화문 전후는 무조건 문단 분리
                result += '\n\n';
            } else if (isTerminator) {
                result += ' '; 
            } else {
                if (hasHyphen && /^[a-zA-Z]/.test(nextTrimmed)) {
                } else if (mode === 'concat') {
                } else if (mode === 'space') {
                    result += ' ';
                } else if (mode === 'smart') {
                    if (suffixRegex.test(nextTrimmed)) {
                    } else {
                        result += ' ';
                    }
                }
            }
        }
    }
    
    result = result.replace(/\n{3,}/g, '\n\n');
    result = result.replace(/[ ]{2,}/g, ' ');
    return result.trim();
}

// 텍스트 추출 버튼 로직
extractBtn.addEventListener('click', async () => {
    if (!currentFiles || currentFiles.length === 0) return;
    if (radioGoogle.checked && !apiKeyInput.value.trim()) {
        alert('Google Vision API 키를 입력해주세요!');
        apiKeyInput.focus();
        return;
    }
    
    previewSection.style.display = 'none';
    resultSection.style.display = 'none';
    loadingSection.style.display = 'block';
    progressFill.style.width = '0%';
    loadingText.textContent = '텍스트 추출 시작...';
    
    try {
        let processedPageTexts = [];
        let lastDetectedPageNum = null;
        const totalFiles = currentFiles.length;

        for (let i = 0; i < totalFiles; i++) {
            const file = currentFiles[i];
            let extractedText = '';
            const fileProgressText = totalFiles > 1 ? `(${i+1}/${totalFiles})` : '';

            if (radioGoogle.checked) {
                progressFill.style.width = '20%';
                loadingText.textContent = `Google Vision 요청 중... ${fileProgressText}`;
                
                const apiKey = apiKeyInput.value.trim();
                const base64Img = await getBase64(file);
                const isDocument = visionMode.value === 'DOCUMENT_TEXT_DETECTION';
                const reqBody = {
                    requests: [{
                        image: { content: base64Img },
                        features: [{ type: isDocument ? 'DOCUMENT_TEXT_DETECTION' : 'TEXT_DETECTION' }],
                        imageContext: { languageHints: visionLang.value.split('+') }
                    }]
                };

                const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                });
                if (!response.ok) throw new Error(`Google API 오류: ${response.status}`);
                const data = await response.json();
                if (data.responses && data.responses[0].fullTextAnnotation) {
                    extractedText = data.responses[0].fullTextAnnotation.text;
                    methodBadge.textContent = 'Google Cloud Vision API';
                    methodBadge.style.color = 'var(--success)';
                } else {
                    throw new Error('텍스트를 감지하지 못했습니다.');
                }
            } else {
                methodBadge.textContent = 'Tesseract.js (로컬)';
                methodBadge.style.color = 'var(--ink-dim)';
                const { data: { text } } = await Tesseract.recognize(
                    file, visionLang.value === 'ko' ? 'kor' : 'eng',
                    { logger: m => {
                        if (m.status === 'recognizing text') {
                            const p = Math.round(m.progress * 100);
                            progressFill.style.width = p + '%';
                            loadingText.textContent = `분석 중... ${fileProgressText} (${p}%)`;
                        }
                    }}
                );
                extractedText = text;
            }

            // ── 지능형 페이지 번호 감지 및 연속성 체크 ──
            let lines = extractedText.split('\n').map(l => l.trim()).filter(l => l !== '');
            let confirmedPageNum = null;
            let isJump = false;
            
            if (lines.length > 0) {
                let topNumMatch = lines[0].match(/^\d+$/);
                let bottomNumMatch = lines[lines.length - 1].match(/^\d+$/);
                let candidates = [];
                if (topNumMatch) candidates.push(parseInt(topNumMatch[0]));
                if (bottomNumMatch) candidates.push(parseInt(bottomNumMatch[0]));

                for (let num of candidates) {
                    if (lastDetectedPageNum === null) {
                        lastDetectedPageNum = num;
                        confirmedPageNum = num;
                        break;
                    } else if (num === lastDetectedPageNum + 1) {
                        lastDetectedPageNum = num;
                        confirmedPageNum = num;
                        isJump = false;
                        break;
                    } else {
                        // 페이지가 비연속적으로 튄 경우
                        lastDetectedPageNum = num;
                        confirmedPageNum = num;
                        isJump = true; 
                        break;
                    }
                }
            }

            // 각 페이지별로 후처리 적용
            let pageProcessed = processBookText(extractedText, postProcessMode.value, confirmedPageNum);
            
            // 만약 이전 페이지와 비연속적이라면 구분선 강조 및 이전 파편과 거리 두기
            if (isJump && processedPageTexts.length > 0) {
                processedPageTexts.push('\n\n[...내용 생략...]\n\n'); 
            }
            processedPageTexts.push(pageProcessed);
            
            progressFill.style.width = Math.round(((i + 1) / totalFiles) * 100) + '%';
            loadingText.textContent = `처리 완료 ${fileProgressText}`;
        }

        resultText.value = processedPageTexts.join('\n\n').trim() || '텍스트를 찾을 수 없습니다.';
        loadingSection.style.display = 'none';
        resultSection.style.display = 'block';
        
    } catch (error) {
        console.error('OCR 오류:', error);
        alert(error.message || '오류가 발생했습니다.');
        loadingSection.style.display = 'none';
        previewSection.style.display = 'block';
    }
});

// 수동 수정 버튼
fixBtn.addEventListener('click', () => {
    let text = resultText.value;
    if (!text) return;
    resultText.value = processBookText(text, postProcessMode.value);
    const originalText = fixBtn.textContent;
    fixBtn.textContent = '✓ 정리완료!';
    setTimeout(() => { fixBtn.textContent = originalText; }, 1500);
});

// 복사/다운로드/맞춤법 로직 (기존과 동일)
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(resultText.value).then(() => {
        const t = copyBtn.textContent; copyBtn.textContent = '✓ 복사됨!';
        setTimeout(() => { copyBtn.textContent = t; }, 2000);
    });
});

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

function resetSpellerState() {
    spellOriginalText = null;
    spellerBtn.textContent = '맞춤법';
    spellerBtn.disabled = false;
    spellerRevertBtn.style.display = 'none';
}

function splitIntoChunks(text, maxLen = 1000) {
    const chunks = [];
    let offset = 0;
    while (offset < text.length) {
        if (offset + maxLen >= text.length) {
            chunks.push({ text: text.slice(offset), offset });
            break;
        }
        let splitAt = text.lastIndexOf('\n', offset + maxLen);
        if (splitAt <= offset) splitAt = text.lastIndexOf(' ', offset + maxLen);
        if (splitAt <= offset) splitAt = offset + maxLen - 1;
        chunks.push({ text: text.slice(offset, splitAt + 1), offset });
        offset = splitAt + 1;
    }
    return chunks;
}

async function fetchSpeller(chunkText) {
    const WAIT_SEC = 62;
    while (true) {
        const res = await fetch('https://speller.town', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: chunkText })
        });
        if (res.status === 429) {
            for (let s = WAIT_SEC; s > 0; s--) {
                spellerBtn.textContent = `한도 도달 — ${s}초 대기 중...`;
                await new Promise(r => setTimeout(r, 1000));
            }
            continue;
        }
        if (!res.ok) throw new Error(`맞춤법 API 오류: ${res.status}`);
        return await res.json();
    }
}

let currentGeminiKeyIndex = 0; // API 키 로테이션용 인덱스

async function processWithGemini(text) {
    const rawKeys = geminiApiKeyInput.value.trim();
    if (!rawKeys) return null;

    // 줄바꿈으로 키 분리 및 유효한 키만 필터링
    const geminiKeys = rawKeys.split(/\n/).map(k => k.trim()).filter(k => k !== "");
    if (geminiKeys.length === 0) return null;

    const MODEL = "gemini-1.5-flash";
    
    let retryCount = 0;
    while (retryCount < geminiKeys.length + 1) {
        // 인덱스가 범위를 벗어나면 처음으로 순환
        if (currentGeminiKeyIndex >= geminiKeys.length) currentGeminiKeyIndex = 0;
        
        const currentKey = geminiKeys[currentGeminiKeyIndex];
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${currentKey}`;

        const prompt = `As a professional book editor, clean up the following OCR-extracted Korean text.
Rules:
1. Fix all typos, spacing, and punctuation based on context. (e.g., "단 한 가지", "일을 하는", "의자 위에")
2. Remove "Phantom Quotes": OCR often adds a leading quote (") to narration lines incorrectly. Remove them if the line is a descriptive sentence.
3. Restore "Missing Closing Quotes": Ensure every dialogue starts and ends with a quote (").
4. Merge lines that belong to the same paragraph naturally.
5. Separate dialogues from narration with double newlines. 
6. Correct OCR artifacts (broken characters, noise).
7. Preserve the original literary tone and meaning.
8. Keep page markers like "256p." as clear headers at the top of their respective sections.
9. Output ONLY the refined Korean text without any explanation.

Text to refine:
${text}`;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.1, topP: 0.95 }
                })
            });

            if (res.status === 429) { 
                // 할당량 초과 시: 다음 키가 있다면 즉시 교체하여 재시도
                if (geminiKeys.length > 1 && retryCount < geminiKeys.length - 1) {
                    currentGeminiKeyIndex++;
                    retryCount++;
                    spellerBtn.textContent = `키 교체 중... (${currentGeminiKeyIndex + 1}번 키)`;
                    continue; 
                } else {
                    // 모든 키를 다 써봤다면 대기 후 다시 처음부터 시도
                    for (let s = 10; s > 0; s--) {
                        spellerBtn.textContent = `모든 키 한도 도달 - ${s}초 대기 중...`;
                        await new Promise(r => setTimeout(r, 1000));
                    }
                    currentGeminiKeyIndex = 0;
                    retryCount = 0;
                    continue;
                }
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Gemini API 오류: ${errorData.error.message || res.status}`);
            }

            const data = await res.json();
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text.trim();
            }
            throw new Error('AI 응답을 받지 못했습니다.');

        } catch (e) {
            console.error("Gemini 요청 실패:", e);
            throw e;
        }
    }
}

spellerBtn.addEventListener('click', async () => {
    const text = resultText.value;
    if (!text.trim()) return;

    const geminiKey = geminiApiKeyInput.value.trim();
    
    // AI 지능형 가공 모드 (Gemini Key가 있을 때) - 실시간 청크 처리
    if (geminiKey) {
        spellerBtn.disabled = true;
        spellOriginalText = text;
        
        // 1. 문단 단위로 쪼개기 (\n\n 기준)
        const paragraphs = text.split(/\n\n+/);
        const chunks = [];
        let currentChunk = "";

        // 약 500자 단위로 묶어서 API 요청 횟수 최적화
        for (const p of paragraphs) {
            if ((currentChunk.length + p.length) > 500 && currentChunk !== "") {
                chunks.push(currentChunk);
                currentChunk = p;
            } else {
                currentChunk = currentChunk === "" ? p : currentChunk + "\n\n" + p;
            }
        }
        if (currentChunk) chunks.push(currentChunk);

        try {
            let finalResult = [];
            resultText.value = ""; // 실시간 업데이트를 위해 초기화
            
            for (let i = 0; i < chunks.length; i++) {
                spellerBtn.textContent = `AI 가공 중... (${i + 1}/${chunks.length})`;
                const refinedChunk = await processWithGemini(chunks[i]);
                
                if (refinedChunk) {
                    finalResult.push(refinedChunk);
                    // 실시간으로 텍스트박스 업데이트
                    resultText.value = finalResult.join("\n\n");
                    resultText.scrollTop = resultText.scrollHeight; // 최하단으로 스크롤
                } else {
                    finalResult.push(chunks[i]); // 실패 시 원본 유지
                }
            }

            spellerBtn.textContent = 'AI 가공 완료 ✓';
            spellerRevertBtn.style.display = 'inline-block';
            setTimeout(() => { 
                spellerBtn.textContent = 'AI 재가공'; 
                spellerBtn.disabled = false; 
            }, 2000);
        } catch (e) {
            alert(e.message);
            spellerBtn.textContent = '맞춤법';
            spellerBtn.disabled = false;
        }
        return;
    }

    // 일반 맞춤법 검사 모드 (기본) - 기존 로직 유지
    spellerBtn.disabled = true;
    spellerBtn.textContent = '교정 중...';
    try {
        const chunks = splitIntoChunks(text);
        const allSuggestions = [];
        for (let i = 0; i < chunks.length; i++) {
            spellerBtn.textContent = `교정 중... (${i + 1}/${chunks.length})`;
            const data = await fetchSpeller(chunks[i].text);
            for (const s of data.suggestions) {
                allSuggestions.push({ ...s, start: s.start + chunks[i].offset, end: s.end + chunks[i].offset });
            }
        }
        if (allSuggestions.length === 0) {
            spellerBtn.textContent = '이상 없음 ✓';
            setTimeout(() => { spellerBtn.textContent = '맞춤법'; spellerBtn.disabled = false; }, 2000);
            return;
        }
        spellOriginalText = text;
        const sorted = allSuggestions.sort((a, b) => b.start - a.start);
        let result = text;
        for (const s of sorted) {
            result = result.slice(0, s.start) + s.candidates[0] + result.slice(s.end);
        }
        resultText.value = result;
        spellerBtn.textContent = `${allSuggestions.length}건 교정됨`;
        spellerRevertBtn.style.display = 'inline-block';
        setTimeout(() => { spellerBtn.disabled = false; }, 2000);
    } catch (e) {
        alert(e.message || '맞춤법 교정 중 오류가 발생했습니다.');
        spellerBtn.textContent = '맞춤법';
        spellerBtn.disabled = false;
    }
});

spellerRevertBtn.addEventListener('click', () => {
    if (spellOriginalText !== null) {
        resultText.value = spellOriginalText;
        resetSpellerState();
    }
});
