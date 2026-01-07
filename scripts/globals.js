// --- 配置与常量 ---
export const CONFIG = {
    cardCount: 22,
    cardWidth: 2.6,
    cardHeight: 4.6,
    selectionThreshold: 0.5, // 捏合确认时间 (秒)
    cooldownTime: 1000,      // 冷却时间 (毫秒)
    deckRadius: 30,          // 牌组半径
    cameraSensX: 0.08,
    cameraSensY: 0.03,
    pinchDist: 0.06,         // 捏合触发阈值 (归一化距离)
    fistCompactness: 0.15    // 握拳判定阈值
};

// 资源路径 (全本地生成，留空即可)
export const ASSETS = {};

// 塔罗牌数据
export const TAROT_DATA = [
    "0. 愚者 (The Fool)", "I. 魔术师 (The Magician)", "II. 女祭司 (The High Priestess)",
    "III. 皇后 (The Empress)", "IV. 皇帝 (The Emperor)", "V. 教皇 (The Hierophant)",
    "VI. 恋人 (The Lovers)", "VII. 战车 (The Chariot)", "VIII. 力量 (The Strength)",
    "IX. 隐士 (The Hermit)", "X. 命运之轮 (Wheel of Fortune)", "XI. 正义 (Justice)",
    "XII. 倒吊人 (The Hanged Man)", "XIII. 死神 (Death)", "XIV. 节制 (Temperance)",
    "XV. 恶魔 (The Devil)", "XVI. 高塔 (The Tower)", "XVII. 星星 (The Star)",
    "XVIII. 月亮 (The Moon)", "XIX. 太阳 (The Sun)", "XX. 审判 (Judgement)",
    "XXI. 世界 (The World)"
];

// 全局状态
export const STATE = {
    phase: 'intro', // intro, selecting, revealing, result
    handDetected: false,
    cursor: { x: 0, y: 0, z: 0 },
    handPos: { x: 0, y: 0 },
    isPinching: false,
    pinchStartTime: 0,
    selectedCards: [],
    cooldown: 0,
    cameraOffset: { x: 0, y: 0 },
    apiKey: localStorage.getItem('qwen_api_key') || '',
    fistHoldStart: 0
};