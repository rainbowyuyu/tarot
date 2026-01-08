import { setGoldStroke, drawSilhouette, drawDynamicFog } from '../cardUtils.js';

export function drawTheMoon(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：夜色
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#000033');
    bgGrad.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 月亮 (三重身：满月+新月+人脸)
    ctx.save();
    ctx.translate(cx, 120);

    // 外部光晕
    ctx.shadowColor = '#ffffaa';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; // 重置

    // 内部人脸 (闭眼沉睡)
    ctx.fillStyle = '#eec';
    ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI*2); ctx.fill();

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    // 眼睛
    ctx.beginPath(); ctx.arc(-15, -5, 8, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(15, -5, 8, 0, Math.PI); ctx.stroke();
    // 鼻子
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-5, 15); ctx.lineTo(0, 15); ctx.stroke();
    // 嘴
    ctx.beginPath(); ctx.arc(0, 25, 5, 0, Math.PI); ctx.stroke();

    // 16道光芒 (Yods 滴落)
    for(let i=0; i<16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const len = (i % 2 === 0) ? 20 : 10;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle)*55, Math.sin(angle)*55);
        ctx.lineTo(Math.cos(angle)*(55+len), Math.sin(angle)*(55+len));
        ctx.strokeStyle = '#ffd700';
        ctx.stroke();
    }
    ctx.restore();

    // 3. 滴落的露珠 (Yods)
    for(let i=0; i<8; i++) {
        const x = cx + (Math.sin(i)*60);
        const y = 200 + (time * 50 + i * 40) % 200;
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x+3, y+5, x, y+10);
        ctx.quadraticCurveTo(x-3, y+5, x, y);
        ctx.fill();
    }

    // 4. 双塔
    ctx.fillStyle = '#444';
    ctx.fillRect(20, cy, 60, height - cy); // 左塔
    ctx.fillRect(width - 80, cy, 60, height - cy); // 右塔
    // 塔窗
    ctx.fillStyle = '#000';
    ctx.fillRect(40, cy + 20, 20, 40);
    ctx.fillRect(width - 60, cy + 20, 20, 40);

    // 5. 蜿蜒的小径
    ctx.beginPath();
    ctx.moveTo(cx, height);
    ctx.bezierCurveTo(cx + 50, height - 50, cx - 50, cy + 100, cx, cy + 50);
    ctx.strokeStyle = '#cda';
    ctx.lineWidth = 20;
    ctx.stroke();

    // 6. 池塘与龙虾 (潜意识恐惧)
    ctx.fillStyle = '#004488';
    ctx.fillRect(0, height - 120, width, 120);
    // 波纹
    ctx.strokeStyle = '#4488cc';
    ctx.lineWidth = 1;
    for(let x=0; x<width; x+=20) {
        ctx.beginPath();
        ctx.moveTo(x, height - 100);
        ctx.lineTo(x + 10, height - 100 + Math.sin(x + time*5)*5);
        ctx.stroke();
    }

    // 龙虾 (简化)
    ctx.save();
    ctx.translate(cx, height - 80);
    ctx.fillStyle = '#800080'; // 紫色龙虾
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 30, 0, 0, Math.PI*2);
    ctx.fill();
    // 钳子
    ctx.beginPath(); ctx.moveTo(-15, -20); ctx.lineTo(-30, -40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, -20); ctx.lineTo(30, -40); ctx.stroke();
    ctx.restore();

    // 7. 狼与狗 (野性与驯化)
    const drawBeast = (x, color, scaleX) => {
        ctx.save();
        ctx.translate(x, cy + 150);
        ctx.scale(scaleX, 1);
        ctx.fillStyle = color;
        ctx.beginPath();
        // 昂头长啸
        ctx.moveTo(0, 0);
        ctx.lineTo(10, -30); // 脖子
        ctx.lineTo(20, -40); // 嘴
        ctx.lineTo(15, -50); // 耳
        ctx.lineTo(0, -30); // 后脑
        ctx.lineTo(-20, 0); // 背
        ctx.lineTo(0, 20); // 腿
        ctx.fill();
        ctx.restore();
    };

    drawBeast(cx - 80, '#888', 1); // 狼
    drawBeast(cx + 80, '#ccc', -1); // 狗

    // 8. 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE MOON", cx, height - 40);
}