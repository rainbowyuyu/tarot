// --- START OF FILE ui.js ---

import { STATE } from './globals.js';

// 获取 isMobile 状态 (简单的正则检查)
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
// 如果是移动端，只需要2步教程（滑动、点击），PC端需要3步（距离、光标、捏合）
const totalSteps = isMobile ? 2 : 3;
const TUTORIAL_SEEN_KEY = 'arcana_tutorial_seen_v2';

// 动态修改手机端的教程内容
function adjustTutorialForMobile() {
    if (!isMobile) return;

    // 隐藏第三个点 (因为手机端只有2步)
    if(ui.tutDots[2]) ui.tutDots[2].style.display = 'none';

    // 修改步骤1： 原 "距离" -> 改 "欢迎/滑动"
    const step1 = document.querySelector('.tutorial-step[data-step="1"]');
    if (step1) {
        // 清空原有的PC动画
        const stage = step1.querySelector('.demo-stage');
        stage.innerHTML = '<div class="mobile-swipe-hand"></div>'; // CSS定义的滑动动画

        step1.querySelector('h3').innerText = "1. 滑动浏览";
        step1.querySelector('p').innerHTML = "左右滑动屏幕，浏览命运牌阵。<br>卡牌会随你的指尖流动。";
    }

    // 修改步骤2： 原 "控制光标" -> 改 "点击选择"
    const step2 = document.querySelector('.tutorial-step[data-step="2"]');
    if (step2) {
        const stage = step2.querySelector('.demo-stage');
        stage.innerHTML = '<div class="tap-ring"></div><div class="mobile-tap-hand"></div>'; // 点击动画

        step2.querySelector('h3').innerText = "2. 点击选择";
        step2.querySelector('p').innerHTML = "当心意确定时，<b>点击卡牌</b>。<br>即可选定并揭示命运。";
    }

    // 隐藏步骤3 (PC的捏合)
    const step3 = document.querySelector('.tutorial-step[data-step="3"]');
    if (step3) {
        step3.remove(); // 直接从DOM移除
    }
}

// 在初始化时立即调用
adjustTutorialForMobile();


// 更新教程视图
function updateTutorial() {
    const steps = document.querySelectorAll('.tutorial-step'); // 重新获取，因为可能移除了

    // 切换 Step 显示
    steps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
    });
    // 切换 Dot 状态
    ui.tutDots.forEach((dot, index) => {
        if(index < totalSteps) {
            dot.classList.toggle('active', index === currentStep);
        }
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