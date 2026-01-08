import { renderer, isMobile } from './core.js';
import { TAROT_DATA } from '../globals.js';
import { getDrawer } from '../cardRegistry.js'; // 导入管理器
import { setGoldStroke } from '../cardUtils.js';

// --- 辅助绘图 ---

// 绘制圆角矩形
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

// 绘制复杂的尖角星（带内凹）
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

// --- 卡背纹理生成 (核心优化) ---
function createCardBackTexture() {
    const width = 512;
    const height = 1024;
    const cx = width / 2;
    const cy = height / 2;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // --- 1. 调色板 ---
    const colors = {
        bgBase: '#090011',    // 极深的紫黑
        bgNebula1: '#240b36', // 深紫
        bgNebula2: '#1a0b50', // 深蓝紫
        goldDark: '#8B5A2B',  // 古铜金
        goldMid: '#D4AF37',   // 标准金
        goldLight: '#FFECB3', // 高光金
        glow: 'rgba(255, 200, 100, 0.6)'
    };

    // --- 2. 绘制深邃宇宙背景 ---
    // 基础填充
    ctx.fillStyle = colors.bgBase;
    ctx.fillRect(0, 0, width, height);

    // 混合模式绘制星云 (增加层次感)
    ctx.globalCompositeOperation = 'screen';

    // 星云层 1 (上方)
    const grad1 = ctx.createRadialGradient(cx, 0, 100, cx, 300, 600);
    grad1.addColorStop(0, colors.bgNebula1);
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // 星云层 2 (中心)
    const grad2 = ctx.createRadialGradient(cx, cy, 50, cx, cy, 500);
    grad2.addColorStop(0, 'rgba(60, 20, 80, 0.4)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'source-over'; // 恢复默认

    // 绘制微小的背景星星 (增加噪点质感)
    for(let i=0; i<800; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const alpha = Math.random() * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(x, y, 1.5, 1.5);
    }


    // --- 3. 黄金笔触工具函数 ---
    // 创建金属渐变笔触
    function setGoldStyle(lineWidth = 2, isLight = false) {
        // 创建一个斜向的线性渐变，模拟金属反光
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colors.goldDark);
        gradient.addColorStop(0.3, colors.goldLight); // 高光点
        gradient.addColorStop(0.5, colors.goldMid);
        gradient.addColorStop(0.7, colors.goldLight); // 第二高光
        gradient.addColorStop(1, colors.goldDark);

        ctx.strokeStyle = gradient;
        ctx.fillStyle = gradient;
        ctx.lineWidth = lineWidth;

        // 添加辉光
        ctx.shadowBlur = isLight ? 15 : 5;
        ctx.shadowColor = colors.goldMid;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }


    // --- 4. 绘制精致边框 ---
    setGoldStyle(6); // 外粗框
    drawRoundedRect(ctx, 15, 15, width - 30, height - 30, 25);

    setGoldStyle(2); // 内细框
    drawRoundedRect(ctx, 30, 30, width - 60, height - 60, 15);

    // 边框装饰：角落的花纹 (Fleur-de-lis 风格简化)
    function drawOrnateCorner(x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        setGoldStyle(3);

        ctx.beginPath();
        // 中心线
        ctx.moveTo(0, 0);
        ctx.lineTo(25, 25);
        // 卷曲
        ctx.moveTo(0, 10);
        ctx.bezierCurveTo(15, 10, 20, 20, 10, 40);
        ctx.moveTo(10, 0);
        ctx.bezierCurveTo(10, 15, 20, 20, 40, 10);

        ctx.stroke();

        // 装饰点
        ctx.fillStyle = colors.goldLight;
        ctx.beginPath(); ctx.arc(18, 18, 3, 0, Math.PI*2); ctx.fill();

        ctx.restore();
    }

    const margin = 45;
    drawOrnateCorner(margin, margin, 0);
    drawOrnateCorner(width-margin, margin, Math.PI/2);
    drawOrnateCorner(width-margin, height-margin, Math.PI);
    drawOrnateCorner(margin, height-margin, -Math.PI/2);


    // --- 5. 绘制中央星盘 (The Zodiac Wheel) ---
    const wheelR = 150;

    // 5.1 星盘底色 (让复杂的线条在深色背景上更清晰)
    ctx.beginPath();
    ctx.arc(cx, cy, wheelR + 5, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(10, 5, 20, 0.8)';
    ctx.fill();

    // 5.2 同心圆环
    setGoldStyle(1);
    ctx.beginPath(); ctx.arc(cx, cy, wheelR, 0, Math.PI*2); ctx.stroke(); // 外圈
    setGoldStyle(3);
    ctx.beginPath(); ctx.arc(cx, cy, wheelR - 15, 0, Math.PI*2); ctx.stroke(); // 粗圈
    setGoldStyle(1);
    ctx.beginPath(); ctx.arc(cx, cy, wheelR - 20, 0, Math.PI*2); ctx.stroke(); // 内细圈
    ctx.beginPath(); ctx.arc(cx, cy, wheelR - 50, 0, Math.PI*2); ctx.stroke(); // 核心圈

    // 5.3 黄道十二宫格与装饰
    ctx.save();
    ctx.translate(cx, cy);
    const sectors = 12;

    for(let i=0; i<sectors; i++) {
        const angle = (Math.PI * 2 / sectors) * i;
        const nextAngle = (Math.PI * 2 / sectors) * (i + 1);
        const midAngle = angle + (Math.PI / sectors);

        // 宫格分割线
        setGoldStyle(1);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (wheelR - 50), Math.sin(angle) * (wheelR - 50));
        ctx.lineTo(Math.cos(angle) * wheelR, Math.sin(angle) * wheelR);
        ctx.stroke();

        // 在格子中间绘制神秘符号 (模拟星座符号)
        // 使用简单的几何图形组合来模拟古老符文
        const rSymbol = wheelR - 35;
        const sx = Math.cos(midAngle) * rSymbol;
        const sy = Math.sin(midAngle) * rSymbol;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(midAngle + Math.PI/2); // 旋转符号使其朝向圆心

        setGoldStyle(2);
        ctx.beginPath();
        // 随机生成一些简单的“符文”形状
        if (i % 3 === 0) {
            ctx.arc(0, 0, 6, 0, Math.PI*2); // 圆
        } else if (i % 3 === 1) {
            ctx.moveTo(0, -6); ctx.lineTo(-5, 4); ctx.lineTo(5, 4); ctx.closePath(); // 三角
        } else {
            ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); // 十字
        }
        ctx.stroke();
        ctx.restore();

        // 刻度线 (Ticks)
        const tickAngle = angle + (Math.PI / sectors / 2); // 每个格子中间的小刻度
        setGoldStyle(1);
        ctx.beginPath();
        ctx.moveTo(Math.cos(tickAngle) * (wheelR - 15), Math.sin(tickAngle) * (wheelR - 15));
        ctx.lineTo(Math.cos(tickAngle) * (wheelR - 20), Math.sin(tickAngle) * (wheelR - 20));
        ctx.stroke();
    }
    ctx.restore();


    // --- 6. 绘制中央八角星 (Radiant Star) ---
    ctx.save();

    // 6.1 星星背后的光晕 (Glow)
    const starGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
    starGlow.addColorStop(0, 'rgba(255, 236, 179, 0.8)'); // 亮白金
    starGlow.addColorStop(0.4, 'rgba(212, 175, 55, 0.4)'); // 金色
    starGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = starGlow;
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // 6.2 主体八角星 (实心填充)
    const starOuter = 90;
    const starInner = 35;

    // 使用径向渐变填充星星，制造立体感
    const starFill = ctx.createRadialGradient(cx, cy, 5, cx, cy, starOuter);
    starFill.addColorStop(0, '#FFFFFF'); // 核心极亮
    starFill.addColorStop(0.3, colors.goldLight);
    starFill.addColorStop(1, colors.goldDark);

    ctx.fillStyle = starFill;
    drawStarShape(ctx, cx, cy, 8, starOuter, starInner);
    ctx.fill();

    // 6.3 星星边框 (加强轮廓)
    setGoldStyle(2, true); // 开启高亮描边
    drawStarShape(ctx, cx, cy, 8, starOuter, starInner);
    ctx.stroke();

    // 6.4 十字炫光 (Lens Flare) - 关键的“高级感”来源
    ctx.globalCompositeOperation = 'screen'; // 叠加模式
    const flareLen = 180;
    const flareWidth = 3;

    const flareGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, flareLen);
    flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    flareGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
    flareGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flareGrad;

    // 竖向光束
    ctx.beginPath();
    ctx.moveTo(cx, cy - flareLen);
    ctx.quadraticCurveTo(cx + flareWidth, cy, cx, cy + flareLen);
    ctx.quadraticCurveTo(cx - flareWidth, cy, cx, cy - flareLen);
    ctx.fill();

    // 横向光束
    ctx.beginPath();
    ctx.moveTo(cx - flareLen, cy);
    ctx.quadraticCurveTo(cx, cy + flareWidth, cx + flareLen, cy);
    ctx.quadraticCurveTo(cx, cy - flareWidth, cx - flareLen, cy);
    ctx.fill();

    ctx.restore();


    // --- 7. 上下装饰结构 ---
    function drawMoonDecor(y, scaleY) {
        ctx.save();
        ctx.translate(cx, y);
        ctx.scale(1, scaleY);
        setGoldStyle(2);

        // 新月形状
        ctx.beginPath();
        ctx.arc(0, 0, 30, Math.PI, 0); // 半圆
        ctx.bezierCurveTo(0, -10, 0, -10, -30, 0); // 封闭
        ctx.stroke();

        // 悬挂的菱形
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, 40);
        ctx.stroke();

        ctx.fillStyle = colors.goldLight;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, 40); ctx.lineTo(8, 55); ctx.lineTo(0, 70); ctx.lineTo(-8, 55);
        ctx.fill();

        ctx.restore();
    }

    drawMoonDecor(170, 1);
    drawMoonDecor(height - 170, -1);


    // --- 8. 输出纹理 ---
    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = isMobile ? 1 : renderer.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;
    return tex;
}

// --- 卡面 Canvas 生成 (保持原样或微调) ---
// --- 新的卡面生成逻辑 ---
export function createCardCanvas(name, time = 0) {
    const width = 512;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. 绘制边框 (通用)
    ctx.fillStyle = '#f3e5d0'; // 羊皮纸底色
    ctx.fillRect(0, 0, width, height);

    // 2. 调用具体的卡牌绘制逻辑
    const drawer = getDrawer(name);

    // 创建一个裁剪区域用于绘制卡面内容 (不覆盖边框)
    ctx.save();
    ctx.beginPath();
    ctx.rect(40, 40, width - 80, height - 80);
    ctx.clip();

    // 执行绘制 (传入 time)
    drawer(ctx, width, height, time);
    ctx.restore();

    // 3. 绘制统一的华丽金边
    setGoldStroke(ctx, width, height, 15);
    drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 20);
    setGoldStroke(ctx, width, height, 5);
    drawRoundedRect(ctx, 35, 35, width - 70, height - 70, 10);

    return canvas;
}

export function getCardFrontMaterial(name) {
    // 初始生成 (time = 0)
    const canvas = createCardCanvas(name, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = isMobile ? 1 : renderer.capabilities.getMaxAnisotropy();

    const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.5,
        metalness: 0.1
    });

    // 将 canvas 和 name 存入 userData，以便后续更新动画
    mat.userData.cardName = name;
    mat.userData.canvas = canvas;
    mat.userData.ctx = canvas.getContext('2d');
    mat.userData.texture = tex;

    return mat;
}

// 导出材质
export const cardBackMat = new THREE.MeshStandardMaterial({
    map: createCardBackTexture(),
    color: 0xffffff,
    roughness: 0.3, // 降低粗糙度，让光泽更明显
    metalness: 0.7, // 提高金属感
    emissive: 0x221144, // 微弱的紫色自发光
    emissiveIntensity: 0.1
});

export const cardBodyMat = new THREE.MeshStandardMaterial({
    color: 0xccaa44,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x221100,
    emissiveIntensity: 0.2
});

export const cardFrontBaseMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.5,
    metalness: 0.1
});

// --- 动画更新逻辑 ---
// 警告：不要对所有卡牌调用此函数！只对“特写”状态的卡牌调用！
export function animateCardFace(material, time) {
    if (!material.userData.ctx) return;

    const { cardName, canvas, ctx, texture } = material.userData;
    const width = canvas.width;
    const height = canvas.height;

    // 清空并重绘
    ctx.clearRect(0, 0, width, height);

    // 重新生成 Canvas 内容
    // 注意：这里我们重新运行 createCardCanvas 的逻辑，但为了性能最好提取出来
    // 简便起见，这里直接复用绘图逻辑

    // 1. 底色
    ctx.fillStyle = '#f3e5d0';
    ctx.fillRect(0, 0, width, height);

    // 2. 内容
    const drawer = getDrawer(cardName);
    ctx.save();
    ctx.beginPath();
    ctx.rect(40, 40, width - 80, height - 80);
    ctx.clip();
    drawer(ctx, width, height, time);
    ctx.restore();

    // 3. 边框
    setGoldStroke(ctx, width, height, 15);
    drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 20);
    setGoldStroke(ctx, width, height, 5);
    drawRoundedRect(ctx, 35, 35, width - 70, height - 70, 10);

    // 标记纹理更新
    texture.needsUpdate = true;
}

export function updateCardMaterials(time) {
    if (cardBackMat.userData.shader) {
        cardBackMat.userData.shader.uniforms.uTime.value = time;
    }
}