import { setGoldStroke, drawSilhouette, drawDynamicFog } from '../cardUtils.js';

export function drawTheMagician(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：炼金实验室氛围
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 600);
    bgGrad.addColorStop(0, '#4a192c'); // 玫瑰红核心
    bgGrad.addColorStop(1, '#1a0b0f'); // 深红黑边缘
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 动态魔法雾
    drawDynamicFog(ctx, width, height, time, '200, 50, 100');

    // 2. 无限符号 (Lemniscate) - 动态光流
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    // 动态虚线效果
    ctx.setLineDash([15, 10]);
    ctx.lineDashOffset = -time * 20;

    // 绘制 ∞
    ctx.moveTo(cx, cy - 180);
    ctx.bezierCurveTo(cx + 80, cy - 240, cx + 80, cy - 120, cx, cy - 180);
    ctx.bezierCurveTo(cx - 80, cy - 240, cx - 80, cy - 120, cx, cy - 180);
    ctx.stroke();
    ctx.restore();

    // 3. 魔术师 (庄严的剪影)
    const drawMage = (c) => {
        c.moveTo(cx - 60, height);
        c.lineTo(cx - 50, cy + 50); // 袍底
        c.lineTo(cx - 80, cy - 50); // 左臂举起
        c.lineTo(cx - 20, cy - 100); // 肩
        c.arc(cx, cy - 130, 30, 0, Math.PI*2); // 头
        c.lineTo(cx + 20, cy - 100);
        c.lineTo(cx + 80, cy + 20); // 右臂下指
        c.lineTo(cx + 60, height);
        c.closePath();
    };

    drawSilhouette(ctx, drawMage, (c) => {
        // 内部填充：复杂的几何纹理
        c.fillStyle = '#eee'; // 白袍
        c.fillRect(0,0,width,height);

        c.strokeStyle = 'rgba(200,0,0,0.3)';
        c.lineWidth = 1;
        // 绘制袍子上的符文网格
        for(let i=0; i<width; i+=20) {
            c.beginPath(); c.moveTo(i, 0); c.lineTo(i, height); c.stroke();
        }
        // 红色外袍
        c.fillStyle = '#8a0303';
        c.beginPath();
        c.moveTo(cx, cy-100); c.lineTo(cx+80, height); c.lineTo(cx-80, height); c.fill();
    });

    // 4. 四元素 (浮动动画)
    const floatY = Math.sin(time * 2) * 10;

    // 圣杯 (左上)
    ctx.fillStyle = '#gold';
    setGoldStroke(ctx, width, height, 3);
    ctx.beginPath(); ctx.arc(cx - 120, cy - 50 + floatY, 20, 0, Math.PI, false); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 120, cy - 30 + floatY); ctx.lineTo(cx - 120, cy + floatY); ctx.stroke();

    // 权杖 (右上 - 发光)
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx + 120, cy - 80 - floatY); ctx.lineTo(cx + 120, cy + 20 - floatY); ctx.stroke();
    // 权杖顶端光辉
    ctx.fillStyle = '#0f0';
    ctx.shadowColor = '#0f0'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(cx + 120, cy - 80 - floatY, 5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // 5. 桌子
    setGoldStroke(ctx, width, height, 4);
    ctx.beginPath();
    ctx.moveTo(cx - 100, cy + 100);
    ctx.lineTo(cx + 100, cy + 100);
    ctx.lineTo(cx + 80, cy + 250);
    ctx.lineTo(cx - 80, cy + 250);
    ctx.closePath();
    ctx.fillStyle = 'rgba(20, 10, 5, 0.8)';
    ctx.fill();
    ctx.stroke();

    // 6. 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE MAGICIAN", cx, height - 80);
}