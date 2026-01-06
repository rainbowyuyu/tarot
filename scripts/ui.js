import { STATE } from './globals.js';

export const ui = {
    // ... 原有的引用 ...
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
    helpBtn: document.getElementById('help-btn'),
    helpModal: document.getElementById('help-modal'),
    closeHelp: document.getElementById('close-help'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettings: document.getElementById('close-settings'),

    // --- 新增法律条款引用 ---
    privacyLink: document.getElementById('privacy-link'),
    tosLink: document.getElementById('tos-link'),
    privacyModal: document.getElementById('privacy-modal'),
    tosModal: document.getElementById('tos-modal'),
    closePrivacy: document.getElementById('close-privacy'),
    closeTos: document.getElementById('close-tos')
};

// ... 原有的 API Key 逻辑 ...
if (STATE.apiKey) ui.inputKey.value = STATE.apiKey;
ui.inputKey.addEventListener('change', (e) => {
    STATE.apiKey = e.target.value;
    localStorage.setItem('qwen_api_key', STATE.apiKey);
});

// ... 原有的帮助/设置逻辑 ...
ui.helpBtn.addEventListener('click', () => ui.helpModal.style.display = 'flex');
ui.closeHelp.addEventListener('click', () => ui.helpModal.style.display = 'none');
ui.settingsBtn.addEventListener('click', () => ui.settingsModal.style.display = 'flex');
ui.closeSettings.addEventListener('click', () => ui.settingsModal.style.display = 'none');

// --- 新增法律条款逻辑 ---

// 打开隐私协议
ui.privacyLink.addEventListener('click', (e) => {
    e.preventDefault(); // 阻止链接默认跳转
    ui.privacyModal.style.display = 'flex';
});

// 关闭隐私协议
ui.closePrivacy.addEventListener('click', () => {
    ui.privacyModal.style.display = 'none';
});

// 打开服务条款
ui.tosLink.addEventListener('click', (e) => {
    e.preventDefault();
    ui.tosModal.style.display = 'flex';
});

// 关闭服务条款
ui.closeTos.addEventListener('click', () => {
    ui.tosModal.style.display = 'none';
});

// 统一的点击遮罩关闭逻辑
window.addEventListener('click', (e) => {
    if (e.target === ui.helpModal) ui.helpModal.style.display = 'none';
    if (e.target === ui.settingsModal) ui.settingsModal.style.display = 'none';
    if (e.target === ui.privacyModal) ui.privacyModal.style.display = 'none';
    if (e.target === ui.tosModal) ui.tosModal.style.display = 'none';
});