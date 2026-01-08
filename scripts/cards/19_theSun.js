import { setGoldStroke, drawSilhouette, drawComplexStar } from '../cardUtils.js';

export function drawTheSun(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：灿烂的阳光
    const bgGrad = ctx.createRadialGradient(cx, 100, 20, cx, 100, 600);
    bgGrad.addColorStop(0, '#ffffed'); // 极白黄
    bgGrad.addColorStop(0.3, '#ffd700'); // 金色
    bgGrad.addColorStop(1, '#ffa500'); // 橙黄
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 拟人化的太阳 (面带微笑)
    const sunY = 120;
    // 弯曲的光芒 (像波浪)
    ctx.save();
    ctx.translate(cx, sunY);
    ctx.rotate(time * 0.1);
    ctx.strokeStyle = '#ff8c00';
    ctx.lineWidth = 3;
    for(let i=0; i<21; i++) {
        ctx.rotate(Math.PI * 2 / 21);
        ctx.beginPath();
        // 直线光
        if(i%2===0) {
            ctx.moveTo(60, 0); ctx.lineTo(120, 0);
        } else {
            // 波浪光
            ctx.moveTo(60, 0);
            ctx.quadraticCurveTo(90, 20, 120, 0);
        }
        ctx.stroke();
    }
    // 太阳脸
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#d2691e'; // 五官
    ctx.beginPath(); ctx.arc(-20, -10, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(20, -10, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 20, 10, 0, Math.PI); ctx.stroke(); // 笑容
    ctx.restore();

    // 3. 灰墙 (Symbol of limitation being overcome)
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, cy + 50, width, 40);
    // 砖缝
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy+70); ctx.lineTo(width, cy+70); ctx.stroke();

    // 4. 向日葵 (从墙后探出)
    for(let i=0; i<4; i++) {
        const hx = 40 + i * 120;
        const hy = cy + 50;
        ctx.fillStyle = 'green';
        ctx.fillRect(hx-2, hy, 4, 40); // 茎
        // 花头
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(Math.sin(time + i)*0.2); // 摇摆
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(0, -20, 25, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#8b4513';
        ctx.beginPath(); ctx.arc(0, -20, 10, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    // 5. 骑马的孩子 (裸体 - 纯真)
    const drawChild = (c) => {
        // 马身
        c.moveTo(cx + 60, height - 50);
        c.quadraticCurveTo(cx, height - 150, cx - 60, height - 50);
        // 孩子
        c.moveTo(cx - 10, height - 140);
        c.lineTo(cx - 20, cy + 20); // 身体
        c.arc(cx, cy, 20, 0, Math.PI*2); // 头
        c.lineTo(cx + 20, cy + 20);
        // 伸开的双臂
        c.moveTo(cx - 20, cy + 20); c.lineTo(cx - 50, cy);
        c.moveTo(cx + 20, cy + 20); c.lineTo(cx + 50, cy - 20);
    };

    drawSilhouette(ctx, drawChild, (c) => {
        c.fillStyle = '#fff'; // 白马
        c.fillRect(0,0,width,height);
        // 孩子肤色
        c.fillStyle = '#ffe0bd';
        c.beginPath(); c.arc(cx, cy, 20, 0, Math.PI*2); c.fill();
    });

    // 6. 红色旗帜 (胜利)
    ctx.save();
    ctx.translate(cx - 60, cy - 40);
    // 旗杆
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 100); ctx.stroke();
    // 飘扬的大红旗
    ctx.fillStyle = '#ff4500';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const wave = Math.sin(time * 5) * 10;
    ctx.quadraticCurveTo(50, -20 + wave, 100, 10);
    ctx.quadraticCurveTo(50, 40 + wave, 0, 60);
    ctx.fill();
    ctx.restore();

    // 7. 标签
    ctx.fillStyle = '#d2691e';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE SUN", cx, height - 60);
    ctx.fillText("XIX - Joy & Success", cx, height - 35);
}