// --- START OF FILE scene/materials.js ---

import { renderer, isMobile } from './core.js';
import { getDrawer } from '../cardRegistry.js';
import { setGoldStroke } from '../cardUtils.js';

// --- 全局变量用于卡背动画 ---
let backCanvas, backCtx, backTexture;
let backStaticCanvas; // 用于缓存静态背景
let particles = [];   // 魔法粒子系统

// 绘制圆角矩形 (辅助)
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
}

// 绘制尖角星 (辅助)
function drawStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
}

// --- 1. 初始化卡背 (只执行一次) ---
function initCardBack() {
    const width = 512;
    const height = 1024;

    // 主画布
    backCanvas = document.createElement('canvas');
    backCanvas.width = width;
    backCanvas.height = height;
    backCtx = backCanvas.getContext('2d');

    // 缓存画布 (绘制深层静态背景)
    backStaticCanvas = document.createElement('canvas');
    backStaticCanvas.width = width;
    backStaticCanvas.height = height;
    const sCtx = backStaticCanvas.getContext('2d');
    const cx = width / 2;
    const cy = height / 2;

    // --- 绘制静态宇宙背景 (Base Layer) ---
    const colors = {
        bgBase: '#090011',
        bgNebula1: '#1a0b2e',
    };

    // 基础填充
    sCtx.fillStyle = colors.bgBase;
    sCtx.fillRect(0, 0, width, height);

    // 基础星云 (静态层)
    sCtx.globalCompositeOperation = 'screen';
    const grad1 = sCtx.createRadialGradient(cx, 0, 100, cx, 300, 800);
    grad1.addColorStop(0, colors.bgNebula1);
    grad1.addColorStop(1, 'transparent');
    sCtx.fillStyle = grad1;
    sCtx.fillRect(0, 0, width, height);
    sCtx.globalCompositeOperation = 'source-over';

    // 远景微弱星星 (静态)
    for(let i=0; i<600; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const alpha = Math.random() * 0.3; // 很暗
        sCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        sCtx.fillRect(x, y, 1, 1);
    }

    // 初始化粒子系统 (无缝循环准备)
    for(let i=0; i<60; i++) {
        particles.push({
            // 基础属性
            baseAngle: Math.random() * Math.PI * 2,
            baseRadius: 20 + Math.random() * 150,
            speed: 0.2 + Math.random() * 0.5,
            size: 0.5 + Math.random() * 2,
            // 相位偏移，保证粒子不同时闪烁
            phase: Math.random() * Math.PI * 2,
            colorBase: Math.random() > 0.5 ? '200, 230, 255' : '255, 220, 150'
        });
    }

    // 创建纹理对象
    backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.encoding = THREE.sRGBEncoding;
    if (!isMobile) backTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    return backTexture;
}

// --- 2. 实时更新卡背 (每帧调用) ---
export function updateCardBack(time) {
    if (!backCtx || !backStaticCanvas) return;

    const width = 512;
    const height = 1024;
    const cx = width / 2;
    const cy = height / 2;

    // A. 恢复静态背景
    backCtx.drawImage(backStaticCanvas, 0, 0);

    // B. 动态星云层 (双层呼吸效果，避免单一频率的单调)
    const breath1 = (Math.sin(time * 0.8) * 0.5 + 0.5);
    const breath2 = (Math.cos(time * 0.5) * 0.5 + 0.5);

    const nebulaPulse = backCtx.createRadialGradient(cx, cy, 50, cx, cy, 700);
    nebulaPulse.addColorStop(0, `rgba(75, 0, 130, ${0.1 + breath1 * 0.05})`); // 深紫
    nebulaPulse.addColorStop(0.5, `rgba(0, 50, 150, ${0.05 + breath2 * 0.05})`); // 深蓝
    nebulaPulse.addColorStop(1, 'transparent');

    backCtx.globalCompositeOperation = 'screen';
    backCtx.fillStyle = nebulaPulse;
    backCtx.fillRect(0,0,width,height);
    backCtx.globalCompositeOperation = 'source-over';

    // C. 闪烁的近景星星 (使用 Sine 保证平滑过渡)
    for(let i=0; i<30; i++) {
        const x = (i * 123.45) % width;
        const y = (i * 678.90) % height;
        // 使用 time 产生平滑的明暗变化，而不是随机闪烁
        const twinkle = Math.sin(time * 2 + i) * 0.4 + 0.6;
        backCtx.fillStyle = `rgba(200, 220, 255, ${twinkle * 0.8})`;
        backCtx.beginPath();
        backCtx.arc(x, y, 1.5 * twinkle, 0, Math.PI*2);
        backCtx.fill();
    }

    // 调色板
    const colors = {
        goldDark: '#5e3206',
        goldMid: '#daa520',
        goldLight: '#fffacd', // 柠檬绸色
        goldHot: '#ffffe0'    // 极亮
    };

    // --- 高级流体黄金笔触 (无缝版) ---
    function setLiquidGoldStyle(lineWidth = 2, isLight = false) {
        // 使用正弦波控制高光位置，在画布范围内往复运动，避免 % width 造成的跳变
        const highlightPos = (Math.sin(time * 0.8) * 0.5 + 0.5) * width * 1.5 - width * 0.25;

        // 创建较大的渐变区域以覆盖整个路径
        const gradient = backCtx.createLinearGradient(highlightPos - 300, 0, highlightPos + 300, height);

        gradient.addColorStop(0.0, colors.goldDark);
        gradient.addColorStop(0.4, colors.goldMid);
        gradient.addColorStop(0.5, colors.goldHot); // 移动的高光带
        gradient.addColorStop(0.6, colors.goldMid);
        gradient.addColorStop(1.0, colors.goldDark);

        backCtx.strokeStyle = gradient;
        backCtx.fillStyle = gradient;
        backCtx.lineWidth = lineWidth;

        // 动态辉光 (呼吸)
        const pulse = (Math.sin(time * 2) + 1) * 0.5;
        backCtx.shadowBlur = isLight ? 10 + pulse * 10 : 5;
        backCtx.shadowColor = isLight ? colors.goldLight : colors.goldMid;
    }

    // D. 绘制边框
    setLiquidGoldStyle(8);
    drawRoundedRect(backCtx, 15, 15, width - 30, height - 30, 25);
    setLiquidGoldStyle(2);
    drawRoundedRect(backCtx, 30, 30, width - 60, height - 60, 15);

    // 边框装饰角落
    function drawOrnateCorner(x, y, angle) {
        backCtx.save();
        backCtx.translate(x, y);
        backCtx.rotate(angle);
        setLiquidGoldStyle(3);
        backCtx.beginPath();
        backCtx.moveTo(0, 0); backCtx.lineTo(35, 35);
        backCtx.moveTo(0, 10); backCtx.bezierCurveTo(20, 10, 25, 25, 10, 50);
        backCtx.moveTo(10, 0); backCtx.bezierCurveTo(10, 20, 25, 25, 50, 10);
        backCtx.stroke();

        // 装饰点 (柔和呼吸)
        backCtx.fillStyle = `rgba(255, 255, 224, ${Math.sin(time * 3) * 0.2 + 0.8})`;
        backCtx.beginPath(); backCtx.arc(22, 22, 3, 0, Math.PI*2); backCtx.fill();
        backCtx.restore();
    }

    const margin = 45;
    drawOrnateCorner(margin, margin, 0);
    drawOrnateCorner(width-margin, margin, Math.PI/2);
    drawOrnateCorner(width-margin, height-margin, Math.PI);
    drawOrnateCorner(margin, height-margin, -Math.PI/2);


    // E. 动态星盘 (Zodiac Wheel) - 恒速旋转 + 能量脉冲
    const wheelR = 150;

    // 背景遮罩
    backCtx.beginPath();
    backCtx.arc(cx, cy, wheelR + 5, 0, Math.PI*2);
    backCtx.fillStyle = 'rgba(5, 0, 10, 0.85)';
    backCtx.fill();

    backCtx.save();
    backCtx.translate(cx, cy);
    backCtx.rotate(time * 0.1); // 恒定旋转

    // 轮圈
    setLiquidGoldStyle(2);
    backCtx.beginPath(); backCtx.arc(0, 0, wheelR, 0, Math.PI*2); backCtx.stroke();
    setLiquidGoldStyle(4);
    backCtx.beginPath(); backCtx.arc(0, 0, wheelR - 15, 0, Math.PI*2); backCtx.stroke();

    // 宫格与符文
    const sectors = 12;
    for(let i=0; i<sectors; i++) {
        const angle = (Math.PI * 2 / sectors) * i;
        const midAngle = angle + (Math.PI / sectors);

        setLiquidGoldStyle(1);
        backCtx.beginPath();
        backCtx.moveTo(Math.cos(angle) * (wheelR - 50), Math.sin(angle) * (wheelR - 50));
        backCtx.lineTo(Math.cos(angle) * wheelR, Math.sin(angle) * wheelR);
        backCtx.stroke();

        // 符文
        const rSymbol = wheelR - 35;
        backCtx.save();
        backCtx.translate(Math.cos(midAngle) * rSymbol, Math.sin(midAngle) * rSymbol);
        backCtx.rotate(midAngle + Math.PI/2);

        // 符文流光逻辑 (依次点亮，形成跑马灯效果)
        const activeIndex = Math.floor((time * 4) % 12);
        const isActive = (i === activeIndex);
        const symbolAlpha = isActive ? 1.0 : 0.3;

        backCtx.strokeStyle = `rgba(255, 215, 0, ${symbolAlpha})`;
        backCtx.lineWidth = 2;
        backCtx.shadowBlur = isActive ? 15 : 0;
        backCtx.shadowColor = 'gold';

        backCtx.beginPath();
        if (i % 3 === 0) backCtx.arc(0, 0, 6, 0, Math.PI*2);
        else if (i % 3 === 1) { backCtx.moveTo(0, -6); backCtx.lineTo(-5, 4); backCtx.lineTo(5, 4); backCtx.closePath(); }
        else { backCtx.moveTo(0, -6); backCtx.lineTo(0, 6); backCtx.moveTo(-5, 0); backCtx.lineTo(5, 0); }
        backCtx.stroke();
        backCtx.restore();
    }
    backCtx.restore();

    // F. 魔法粒子系统 (无缝循环版)
    backCtx.globalCompositeOperation = 'screen';
    particles.forEach((p) => {
        // 使用时间作为偏移量，而不是修改状态，保证纯函数式的动画流畅性
        // 粒子沿螺旋线运动
        const t = time * p.speed + p.phase;

        // 半径周期性变化 (从外向内螺旋)
        const radiusCycle = (t % 1); // 0 -> 1
        const currentRadius = p.baseRadius * (1 - radiusCycle); // 大 -> 小

        // 角度随时间增加
        const currentAngle = p.baseAngle + t;

        // 透明度：两头淡入淡出，中间亮
        // 使用正弦波的一半 (0 -> 1 -> 0)
        const alpha = Math.sin(radiusCycle * Math.PI) * 0.8;

        const px = cx + Math.cos(currentAngle) * currentRadius;
        const py = cy + Math.sin(currentAngle) * currentRadius;

        backCtx.fillStyle = `rgba(${p.colorBase}, ${alpha})`;
        backCtx.beginPath();
        backCtx.arc(px, py, p.size, 0, Math.PI*2);
        backCtx.fill();
    });
    backCtx.globalCompositeOperation = 'source-over';


    // G. 中央八角星 - 能量激波 (柔和版)
    backCtx.save();
    backCtx.translate(cx, cy);
    const starPulse = 1 + Math.sin(time * 1.5) * 0.03;
    backCtx.scale(starPulse, starPulse);

    // 能量激波环 (无限向外扩散)
    // 使用模运算产生周期，但控制透明度在边界为0
    const wavePeriod = 2.0; // 2秒一波
    const waveProgress = (time % wavePeriod) / wavePeriod;
    const shockwaveR = waveProgress * 160;
    const shockAlpha = Math.sin((1 - waveProgress) * Math.PI / 2); // 1 -> 0 非线性衰减

    if(shockAlpha > 0.01) {
        backCtx.beginPath();
        backCtx.arc(0, 0, shockwaveR, 0, Math.PI*2);
        backCtx.strokeStyle = `rgba(255, 255, 200, ${shockAlpha * 0.4})`;
        backCtx.lineWidth = 2 * (1-waveProgress); // 越来越细
        backCtx.stroke();
    }

    // 星星光晕
    const starGlow = backCtx.createRadialGradient(0, 0, 5, 0, 0, 130);
    starGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    starGlow.addColorStop(0.3, 'rgba(255, 215, 0, 0.5)');
    starGlow.addColorStop(1, 'transparent');
    backCtx.fillStyle = starGlow;
    backCtx.globalCompositeOperation = 'screen';
    backCtx.beginPath(); backCtx.arc(0, 0, 130, 0, Math.PI*2); backCtx.fill();
    backCtx.globalCompositeOperation = 'source-over';

    // 星星本体
    const starOuter = 90;
    const starInner = 35;
    const starFill = backCtx.createRadialGradient(0, 0, 5, 0, 0, starOuter);
    starFill.addColorStop(0, '#FFFFFF');
    starFill.addColorStop(0.2, '#fffacd');
    starFill.addColorStop(1, '#b8860b');
    backCtx.fillStyle = starFill;
    drawStarShape(backCtx, 0, 0, 8, starOuter, starInner);
    backCtx.fill();

    setLiquidGoldStyle(3, true);
    drawStarShape(backCtx, 0, 0, 8, starOuter, starInner);
    backCtx.stroke();

    // 炫光 (Lens Flare) - 恒速旋转
    backCtx.rotate(-time * 0.2);
    backCtx.globalCompositeOperation = 'screen';
    const flareLen = 200 + Math.sin(time * 3) * 15; // 长度微动
    const flareWidth = 2;

    backCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    backCtx.beginPath();
    backCtx.moveTo(0, -flareLen);
    backCtx.quadraticCurveTo(flareWidth, 0, 0, flareLen);
    backCtx.quadraticCurveTo(-flareWidth, 0, 0, -flareLen);
    backCtx.fill();

    backCtx.beginPath();
    backCtx.moveTo(-flareLen, 0);
    backCtx.quadraticCurveTo(0, flareWidth, flareLen, 0);
    backCtx.quadraticCurveTo(0, -flareWidth, -flareLen, 0);
    backCtx.fill();

    // 中心高光点
    backCtx.fillStyle = '#fff';
    backCtx.beginPath(); backCtx.arc(0,0,6,0,Math.PI*2); backCtx.fill();

    backCtx.restore();

    // H. 上下装饰
    function drawMoonDecor(y, scaleY) {
        backCtx.save();
        backCtx.translate(cx, y);
        backCtx.scale(1, scaleY);
        setLiquidGoldStyle(3);
        backCtx.beginPath();
        backCtx.arc(0, 0, 30, Math.PI, 0);
        backCtx.bezierCurveTo(0, -10, 0, -10, -30, 0);
        backCtx.stroke();

        backCtx.beginPath(); backCtx.moveTo(0, 0); backCtx.lineTo(0, 40); backCtx.stroke();

        // 宝石
        backCtx.fillStyle = `rgba(100, 200, 255, 0.8)`;
        backCtx.shadowColor = 'cyan';
        backCtx.shadowBlur = 10;
        backCtx.beginPath();
        backCtx.moveTo(0, 40); backCtx.lineTo(8, 55); backCtx.lineTo(0, 70); backCtx.lineTo(-8, 55);
        backCtx.fill();
        backCtx.restore();
    }
    drawMoonDecor(170, 1);
    drawMoonDecor(height - 170, -1);

    if(backTexture) backTexture.needsUpdate = true;
}

// --- 卡面 Canvas 生成 (UI/Texture共用) ---
export function updateCanvasContent(ctx, width, height, name, time) {
    // 1. 清除画布
    ctx.clearRect(0, 0, width, height);

    // 2. 绘制底色
    ctx.fillStyle = '#f3e5d0';
    ctx.fillRect(0, 0, width, height);

    // 3. 绘制具体卡牌内容 (带裁剪)
    const drawer = getDrawer(name);

    ctx.save();
    ctx.beginPath();
    ctx.rect(40, 40, width - 80, height - 80);
    ctx.clip();

    // 执行具体绘制
    drawer(ctx, width, height, time);
    ctx.restore();

    // 4. 绘制统一的华丽金边
    setGoldStroke(ctx, width, height, 15);
    drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 20);

    setGoldStroke(ctx, width, height, 5);
    drawRoundedRect(ctx, 35, 35, width - 70, height - 70, 10);
}

// 用于结果页生成静态/动态 Canvas
export function createCardCanvas(name, time = 0) {
    const width = 512;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    updateCanvasContent(ctx, width, height, name, time);
    return canvas;
}

// 3D 卡牌正面材质
export function getCardFrontMaterial(name) {
    const canvas = createCardCanvas(name, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    if (!isMobile) tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.5,
        metalness: 0.1,
        emissive: 0x000000
    });

    mat.userData = {
        cardName: name,
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        texture: tex
    };
    return mat;
}

// --- 导出统一材质 ---

// 1. 动态卡背材质
export const cardBackMat = new THREE.MeshStandardMaterial({
    map: initCardBack(),
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.7,
    emissive: 0x221144,
    emissiveIntensity: 0.1
});

// 2. 卡身
export const cardBodyMat = new THREE.MeshStandardMaterial({
    color: 0xccaa44, roughness: 0.2, metalness: 0.9, emissive: 0x221100, emissiveIntensity: 0.2
});

// 3. 卡面底座 (未翻开前)
export const cardFrontBaseMat = new THREE.MeshStandardMaterial({
    color: 0x111111, roughness: 0.5, metalness: 0.1
});


// --- 动画更新接口 ---

// 更新卡面 (正面)
export function animateCardFace(material, time) {
    if (!material || !material.userData || !material.userData.ctx) return;
    const { cardName, canvas, ctx, texture } = material.userData;
    updateCanvasContent(ctx, canvas.width, canvas.height, cardName, time);
    texture.needsUpdate = true;
}

// 更新所有材质 (包括卡背)
export function updateCardMaterials(time) {
    updateCardBack(time);
}