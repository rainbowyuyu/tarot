import { STATE } from './globals.js';

export const ui = {
    guide: document.getElementById('guide-content'),
    progress: document.getElementById('progress-bar'),
    progCont: document.getElementById('progress-container'),
    result: document.getElementById('result-panel'),
    aiText: document.getElementById('ai-text'),
    revealCont: document.getElementById('card-reveal-container'),
    inputKey: document.getElementById('api-key-input'),
    loader: document.getElementById('loader'),
    spinner: document.querySelector('.spinner'),
    loaderText: document.querySelector('#loader p'),
    startBtn: document.getElementById('start-btn'),
    // 新增帮助元素
    helpBtn: document.getElementById('help-btn'),
    helpModal: document.getElementById('help-modal'),
    closeHelp: document.getElementById('close-help')
};

if (STATE.apiKey) ui.inputKey.value = STATE.apiKey;

ui.inputKey.addEventListener('change', (e) => {
    STATE.apiKey = e.target.value;
    localStorage.setItem('qwen_api_key', STATE.apiKey);
});

// 帮助系统逻辑
ui.helpBtn.addEventListener('click', () => {
    ui.helpModal.style.display = 'flex';
});

ui.closeHelp.addEventListener('click', () => {
    ui.helpModal.style.display = 'none';
});

// 点击遮罩关闭
ui.helpModal.addEventListener('click', (e) => {
    if (e.target === ui.helpModal) {
        ui.helpModal.style.display = 'none';
    }
});