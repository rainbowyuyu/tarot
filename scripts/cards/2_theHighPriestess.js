import { setGoldStroke, drawSilhouette, drawDynamicFog, noise } from '../cardUtils.js';

export function drawTheHighPriestess(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：深邃的潜意识蓝
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#000022'); // 深夜
    bgGrad.addColorStop(0.5, '#1a1a4a'); // 靛蓝
    bgGrad.addColorStop(1, '#2a2a6a'); // 浅蓝
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 动态迷雾 (代表神秘面纱)
    drawDynamicFog(ctx, width, height, time, '100, 150, 255');

    // 2. 两根柱子 (B & J)
    const drawPillar = (x, color, label) => {
        ctx.save();
        // 柱身
        const pillarGrad = ctx.createLinearGradient(x - 20, 0, x + 20, 0);
        pillarGrad.addColorStop(0, '#111');
        pillarGrad.addColorStop(0.5, color);
        pillarGrad.addColorStop(1, '#111');
        ctx.fillStyle = pillarGrad;
        ctx.fillRect(x - 30, 100, 60, height - 200);

        // 柱头装饰 (莲花状)
        ctx.beginPath();
        ctx.moveTo(x - 40, 100);
        ctx.quadraticCurveTo(x, 140, x + 40, 100);
        ctx.lineTo(x + 40, 80);
        ctx.quadraticCurveTo(x, 120, x - 40, 80);
        ctx.fillStyle = color;
        ctx.fill();

        // 刻字
        ctx.fillStyle = (label === 'B') ? '#fff' : '#000';
        ctx.font = 'bold 40px serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, 250);
        ctx.restore();
    };

    drawPillar(cx - 120, '#333', 'B'); // Boaz (黑)
    drawPillar(cx + 120, '#ddd', 'J'); // Jachin (白)

    // 3. 帷幕 (Pomegranates 帷幕)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 120, 120);
    // 帷幕随风轻微摆动
    for (let x = cx - 120; x <= cx + 120; x += 10) {
        let yOffset = Math.sin(x * 0.05 + time) * 5;
        ctx.lineTo(x, 120 + yOffset);
    }
    ctx.lineTo(cx + 120, height - 150);
    ctx.lineTo(cx - 120, height - 150);
    ctx.closePath();

    // 帷幕纹理
    const curtainPat = ctx.createPattern(createPomegranatePattern(), 'repeat');
    ctx.fillStyle = curtainPat || '#3a0b3e'; // Fallback
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.restore();

    // 4. 女祭司人物 (剪影)
    const drawPriestess = (c) => {
        // 头冠 (月亮盈亏)
        c.beginPath();
        c.arc(cx, cy - 160, 15, 0, Math.PI * 2); // 满月
        c.moveTo(cx - 25, cy - 160);
        c.arc(cx - 25, cy - 160, 10, -Math.PI/2, Math.PI/2); // 盈
        c.moveTo(cx + 25, cy - 160);
        c.arc(cx + 25, cy - 160, 10, Math.PI/2, -Math.PI/2); // 亏

        // 身体
        c.moveTo(cx - 40, cy - 120); // 肩
        c.lineTo(cx - 60, height - 100); // 裙摆左
        c.lineTo(cx + 60, height - 100); // 裙摆右
        c.lineTo(cx + 40, cy - 120); // 肩右
        c.lineTo(cx + 20, cy - 140); // 颈
        c.arc(cx, cy - 160, 25, 0, Math.PI*2); // 头
        c.closePath();
    };

    drawSilhouette(ctx, drawPriestess, (c) => {
        // 内部宇宙流动
        c.fillStyle = '#00a';
        c.fillRect(0,0,width,height);

        // 十字架 (胸口)
        c.strokeStyle = '#fff';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(cx, cy - 100); c.lineTo(cx, cy - 60);
        c.moveTo(cx - 15, cy - 80); c.lineTo(cx + 15, cy - 80);
        c.stroke();

        // 手持卷轴 (TORA)
        c.fillStyle = '#fff';
        c.fillRect(cx - 30, cy, 60, 20);
        c.fillStyle = '#000';
        c.font = '10px serif';
        c.fillText("TORA", cx, cy + 14);
    });

    // 5. 脚下的新月
    ctx.save();
    ctx.translate(cx, height - 120);
    ctx.rotate(-0.2);
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI, false);
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.restore();

    // 6. 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE HIGH PRIESTESS", cx, height - 60);
    ctx.font = 'italic 16px serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText("II - Intuition & Mystery", cx, height - 35);
}

// 辅助：生成帷幕纹理的小Canvas
function createPomegranatePattern() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 40;
    pCanvas.height = 40;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = '#2a0b2e'; // 底色
    pCtx.fillRect(0,0,40,40);
    // 果实
    pCtx.fillStyle = '#8a0303';
    pCtx.beginPath(); pCtx.arc(20, 20, 8, 0, Math.PI*2); pCtx.fill();
    // 棕榈叶
    pCtx.strokeStyle = '#050';
    pCtx.beginPath(); pCtx.moveTo(20,20); pCtx.lineTo(10, 10); pCtx.stroke();
    pCtx.beginPath(); pCtx.moveTo(20,20); pCtx.lineTo(30, 10); pCtx.stroke();
    return pCanvas;
}