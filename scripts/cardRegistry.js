// --- START OF FILE cardRegistry.js ---

import { drawTheFool } from './cards/0_theFool.js';
import { drawTheMagician } from './cards/1_theMagician.js';
import { drawTheHighPriestess } from './cards/2_theHighPriestess.js';
import { drawTheEmpress } from './cards/3_theEmpress.js';
import { drawTheEmperor } from './cards/4_theEmperor.js';
import { drawTheHierophant } from './cards/5_theHierophant.js';
import { drawTheLovers } from './cards/6_theLovers.js';
import { drawTheChariot } from './cards/7_theChariot.js';
import { drawTheStrength } from './cards/8_theStrength.js';
import { drawTheHermit } from './cards/9_theHermit.js';

import { drawWheelOfFortune } from './cards/10_wheelOfFortune.js';
import { drawJustice } from './cards/11_justice.js';
import { drawTheHangedMan } from './cards/12_theHangedMan.js';
import { drawDeath } from './cards/13_death.js';
import { drawTemperance } from './cards/14_temperance.js';
import { drawTheDevil } from './cards/15_theDevil.js';
import { drawTheTower } from './cards/16_theTower.js';
import { drawTheStar } from './cards/17_theStar.js';
import { drawTheMoon } from './cards/18_theMoon.js';
import { drawTheSun } from './cards/19_theSun.js';

import { drawJudgement } from './cards/20_judgement.js';
import { drawTheWorld } from './cards/21_theWorld.js';


// 默认绘制函数：用于所有尚未实现具体画面的卡牌
function drawDefault(ctx, width, height, time, name) {
    // 1. 深色神秘背景
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1a1a1a');
    grad.addColorStop(0.5, '#2c2c2c');
    grad.addColorStop(1, '#111');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. 动态的光晕中心
    const cx = width / 2;
    const cy = height / 2;
    const pulse = Math.sin(time * 2) * 0.1 + 1;

    const glow = ctx.createRadialGradient(cx, cy, 50 * pulse, cx, cy, 300);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 3. 文字显示
    ctx.fillStyle = '#f0e6d2';
    ctx.font = 'bold 40px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 简单的自动换行处理 (如果名字太长)
    const words = name.split(' ');
    if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(' '), cx, cy - 25);
        ctx.fillText(words.slice(2).join(' '), cx, cy + 25);
    } else {
        ctx.fillText(name.toUpperCase(), cx, cy);
    }

    ctx.font = 'italic 20px serif';
    ctx.fillStyle = '#888';
    ctx.fillText("Arcana Revealed", cx, height - 100);

    // 4. 简单的几何装饰
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 180, 0, Math.PI * 2);
    ctx.stroke();
}

const REGISTRY = {
    "0. 愚者 (The Fool)": drawTheFool,
    "I. 魔术师 (The Magician)": drawTheMagician,
    "II. 女祭司 (The High Priestess)": drawTheHighPriestess,
    "III. 皇后 (The Empress)": drawTheEmpress,
    "IV. 皇帝 (The Emperor)": drawTheEmperor,
    "V. 教皇 (The Hierophant)": drawTheHierophant,
    "VI. 恋人 (The Lovers)": drawTheLovers,
    "VII. 战车 (The Chariot)": drawTheChariot,
    "VIII. 力量 (The Strength)": drawTheStrength,
    "IX. 隐士 (The Hermit)": drawTheHermit,
    "X. 命运之轮 (Wheel of Fortune)": drawWheelOfFortune,
    "XI. 正义 (Justice)": drawJustice,
    "XII. 倒吊人 (The Hanged Man)": drawTheHangedMan,
    "XIII. 死神 (Death)": drawDeath,
    "XIV. 节制 (Temperance)": drawTemperance,
    "XV. 恶魔 (The Devil)": drawTheDevil,
    "XVI. 高塔 (The Tower)": drawTheTower,
    "XVII. 星星 (The Star)": drawTheStar,
    "XVIII. 月亮 (The Moon)": drawTheMoon,
    "XIX. 太阳 (The Sun)": drawTheSun,
    "XX. 审判 (Judgement)": drawJudgement,
    "XXI. 世界 (The World)": drawTheWorld,
};


export function getDrawer(cardName) {
    // 尝试精确匹配
    if (REGISTRY[cardName]) return REGISTRY[cardName];

    // 尝试模糊匹配 (比如 "The Fool (Reverse)" -> "The Fool")
    const key = Object.keys(REGISTRY).find(k => cardName.startsWith(k));
    if (key) return REGISTRY[key];

    // 如果都没找到，返回默认渲染器
    return (ctx, w, h, t) => drawDefault(ctx, w, h, t, cardName);
}