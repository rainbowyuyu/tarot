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

    // --- 教程相关引用 (新增 checkbox) ---
    tutSteps: document.querySelectorAll('.tutorial-step'),
    tutDots: document.querySelectorAll('.dot'),
    tutNextBtn: document.getElementById('tut-next'),
    tutSkipBtn: document.getElementById('tut-skip'),
    tutCheckbox: document.getElementById('tut-checkbox'),

    // 法律条款引用保持不变...
    privacyLink: document.getElementById('privacy-link'),
    tosLink: document.getElementById('tos-link'),
    privacyModal: document.getElementById('privacy-modal'),
    tosModal: document.getElementById('tos-modal'),
    closePrivacy: document.getElementById('close-privacy'),
    closeTos: document.getElementById('close-tos')
};

// --- API Key 逻辑 (保持不变) ---
if (STATE.apiKey) ui.inputKey.value = STATE.apiKey;
ui.inputKey.addEventListener('change', (e) => {
    STATE.apiKey = e.target.value;
    localStorage.setItem('qwen_api_key', STATE.apiKey);
});

// --- 教程/帮助逻辑 ---

let currentStep = 0;
const totalSteps = ui.tutSteps.length;
const TUTORIAL_SEEN_KEY = 'arcana_tutorial_seen_v2'; // 使用个新 Key 防止旧缓存干扰

// 更新教程视图
function updateTutorial() {
    // 切换 Step 显示
    ui.tutSteps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
    });
    // 切换 Dot 状态
    ui.tutDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentStep);
    });
    // 改变按钮文字
    if (currentStep === totalSteps - 1) {
        ui.tutNextBtn.textContent = "开始仪式";
    } else {
        ui.tutNextBtn.textContent = "下一步";
    }
}

// 下一步按钮点击
ui.tutNextBtn.addEventListener('click', () => {
    if (currentStep < totalSteps - 1) {
        currentStep++;
        updateTutorial();
    } else {
        // 完成教程
        closeTutorial();
    }
});

// 跳过按钮点击
ui.tutSkipBtn.addEventListener('click', () => {
    closeTutorial();
});

// 关闭教程并处理 "不再提示" 逻辑
function closeTutorial() {
    ui.helpModal.style.display = 'none';

    // 检查复选框状态
    if (ui.tutCheckbox.checked) {
        // 如果勾选，标记为已读，下次不自动显示
        localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    } else {
        // 如果未勾选，清除标记，下次重新进入时还会自动显示
        // 这允许用户“后悔”并重新启用引导
        localStorage.removeItem(TUTORIAL_SEEN_KEY);
    }

    currentStep = 0;
    updateTutorial();
}

// 手动点击顶部 "?" 按钮打开帮助
ui.helpBtn.addEventListener('click', () => {
    currentStep = 0;

    // 打开时，读取当前状态并同步给复选框
    // 如果之前设置过“不再提示”，则复选框默认应该是勾选的
    const hasSeen = localStorage.getItem(TUTORIAL_SEEN_KEY);
    ui.tutCheckbox.checked = (hasSeen === 'true');

    updateTutorial();
    ui.helpModal.style.display = 'flex';
});

ui.closeHelp.addEventListener('click', () => ui.helpModal.style.display = 'none');

// --- 关键修改：Start 按钮后的检查逻辑 ---

// 1. 定义检查函数
ui.checkAndShowTutorial = function() {
    const hasSeen = localStorage.getItem(TUTORIAL_SEEN_KEY);

    // 只有当 localStorage 中没有标记为 "true" 时，才自动弹窗
    if (hasSeen !== 'true') {
        // 设置一个延时，等待 Loader 动画消失后再弹出，体验更好
        setTimeout(() => {
            currentStep = 0;
            // 自动弹出时，默认复选框是不勾选的，强迫用户主动确认“不再提示”
            ui.tutCheckbox.checked = false;
            updateTutorial();
            ui.helpModal.style.display = 'flex';
        }, 800); // 800ms 延时，确保主界面加载动画已完成
    }
};

// 2. 将检查绑定到 Start 按钮的点击事件上
// 当用户点击 Loading 页面的“点击开启仪式”时触发
ui.startBtn.addEventListener('click', () => {
    // 调用检查逻辑
    ui.checkAndShowTutorial();
});


// --- 设置逻辑 (保持不变) ---
ui.settingsBtn.addEventListener('click', () => ui.settingsModal.style.display = 'flex');
ui.closeSettings.addEventListener('click', () => ui.settingsModal.style.display = 'none');

// --- 法律条款逻辑 (保持不变) ---
ui.privacyLink.addEventListener('click', (e) => { e.preventDefault(); ui.privacyModal.style.display = 'flex'; });
ui.closePrivacy.addEventListener('click', () => ui.privacyModal.style.display = 'none');
ui.tosLink.addEventListener('click', (e) => { e.preventDefault(); ui.tosModal.style.display = 'flex'; });
ui.closeTos.addEventListener('click', () => ui.tosModal.style.display = 'none');

// 统一点击遮罩关闭
window.addEventListener('click', (e) => {
    if (e.target === ui.settingsModal) ui.settingsModal.style.display = 'none';
    if (e.target === ui.privacyModal) ui.privacyModal.style.display = 'none';
    if (e.target === ui.tosModal) ui.tosModal.style.display = 'none';
    // 注意：Help Modal 这里不自动关闭，避免误触，需要用户明确点击跳过/开始
});