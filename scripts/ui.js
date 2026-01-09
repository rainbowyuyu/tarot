// --- START OF FILE ui.js ---

import { STATE } from './globals.js';

// 获取 isMobile 状态
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const ui = {
    // ... (保留原有的引用不变) ...
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

    tutSteps: document.querySelectorAll('.tutorial-step'),
    tutDots: document.querySelectorAll('.dot'),
    tutNextBtn: document.getElementById('tut-next'),
    tutSkipBtn: document.getElementById('tut-skip'),
    tutCheckbox: document.getElementById('tut-checkbox'),

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
const totalSteps = isMobile ? 2 : 3;
const TUTORIAL_SEEN_KEY = 'arcana_tutorial_seen_v2';

// --- 核心修改：针对移动端优化教程内容 ---
function adjustTutorialForMobile() {
    if (!isMobile) return;

    // 隐藏第三个导航点 (因为手机端只有2步)
    if(ui.tutDots[2]) ui.tutDots[2].style.display = 'none';

    // --- 修改步骤 1: 触控操作教学 ---
    const step1 = document.querySelector('.tutorial-step[data-step="1"]');
    if (step1) {
        const stage = step1.querySelector('.demo-stage');
        // 组合动画：先滑动，后点击
        stage.innerHTML = `
            <div class="mobile-swipe-hand" style="top:50%"></div>
            <div class="tap-ring" style="top:50%; animation-delay:1s"></div>
        `;

        step1.querySelector('h3').innerText = "1. 触控体验 (非完整版)";
        step1.querySelector('p').innerHTML = "左右滑动浏览，点击卡牌选择。<br><span style='color:#aaa; font-size:12px'>手机端不支持手势识别，仅为触屏演示。</span>";
    }

    // --- 修改步骤 2: PC端引流 ---
    const step2 = document.querySelector('.tutorial-step[data-step="2"]');
    if (step2) {
        const stage = step2.querySelector('.demo-stage');
        // 插入纯CSS绘制的电脑图标
        stage.innerHTML = `
            <div class="pc-monitor">
                <div class="screen-content"></div>
                <div class="cam-dot"></div>
            </div>
        `;

        step2.querySelector('h3').innerText = "2. 完整仪式请用电脑";
        step2.querySelector('p').innerHTML = "<b>Arcana Gestura</b> 核心在于手势交互。<br>请使用 <b style='color:var(--primary)'>PC浏览器 + 摄像头</b><br>体验真实的隔空御物魔法。";
    }

    // 移除步骤 3
    const step3 = document.querySelector('.tutorial-step[data-step="3"]');
    if (step3) {
        step3.remove();
    }
}

// 在初始化时立即调用
adjustTutorialForMobile();


// 更新教程视图 (保持不变)
function updateTutorial() {
    const steps = document.querySelectorAll('.tutorial-step');

    steps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
    });

    ui.tutDots.forEach((dot, index) => {
        if(index < totalSteps) {
            dot.classList.toggle('active', index === currentStep);
        }
    });

    if (currentStep === totalSteps - 1) {
        ui.tutNextBtn.textContent = "开始体验"; // 手机端改为“开始体验”
    } else {
        ui.tutNextBtn.textContent = "下一步";
    }
}

ui.tutNextBtn.addEventListener('click', () => {
    if (currentStep < totalSteps - 1) {
        currentStep++;
        updateTutorial();
    } else {
        closeTutorial();
    }
});

ui.tutSkipBtn.addEventListener('click', () => {
    closeTutorial();
});

function closeTutorial() {
    ui.helpModal.style.display = 'none';
    if (ui.tutCheckbox.checked) {
        localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    } else {
        localStorage.removeItem(TUTORIAL_SEEN_KEY);
    }
    currentStep = 0;
    updateTutorial();
}

ui.helpBtn.addEventListener('click', () => {
    currentStep = 0;
    const hasSeen = localStorage.getItem(TUTORIAL_SEEN_KEY);
    ui.tutCheckbox.checked = (hasSeen === 'true');
    updateTutorial();
    ui.helpModal.style.display = 'flex';
});

ui.closeHelp.addEventListener('click', () => ui.helpModal.style.display = 'none');

ui.checkAndShowTutorial = function() {
    const hasSeen = localStorage.getItem(TUTORIAL_SEEN_KEY);
    if (hasSeen !== 'true') {
        setTimeout(() => {
            currentStep = 0;
            ui.tutCheckbox.checked = false;
            updateTutorial();
            ui.helpModal.style.display = 'flex';
        }, 800);
    }
};

ui.startBtn.addEventListener('click', () => {
    ui.checkAndShowTutorial();
});

// 其他事件监听保持不变...
ui.settingsBtn.addEventListener('click', () => ui.settingsModal.style.display = 'flex');
ui.closeSettings.addEventListener('click', () => ui.settingsModal.style.display = 'none');
ui.privacyLink.addEventListener('click', (e) => { e.preventDefault(); ui.privacyModal.style.display = 'flex'; });
ui.closePrivacy.addEventListener('click', () => ui.privacyModal.style.display = 'none');
ui.tosLink.addEventListener('click', (e) => { e.preventDefault(); ui.tosModal.style.display = 'flex'; });
ui.closeTos.addEventListener('click', () => ui.tosModal.style.display = 'none');

window.addEventListener('click', (e) => {
    if (e.target === ui.settingsModal) ui.settingsModal.style.display = 'none';
    if (e.target === ui.privacyModal) ui.privacyModal.style.display = 'none';
    if (e.target === ui.tosModal) ui.tosModal.style.display = 'none';
});