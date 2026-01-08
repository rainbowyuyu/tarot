import { setGoldStroke, drawSilhouette, drawDynamicFog } from '../cardUtils.js';

export function drawTheLovers(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：明媚的伊甸园
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#87ceeb');
    bgGrad.addColorStop(1, '#e0f7fa');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 巨大的太阳 (在天使身后)
    ctx.save();
    ctx.translate(cx, cy - 150);
    ctx.rotate(time * 0.1);
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffa500';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    // 太阳本体
    ctx.arc(0, 0, 80, 0, Math.PI*2);
    ctx.fill();
    // 光芒
    ctx.strokeStyle = '#ffa500';
    ctx.lineWidth = 2;
    for(let i=0; i<24; i++) {
        ctx.rotate(Math.PI * 2 / 24);
        ctx.beginPath();
        ctx.moveTo(90, 0); ctx.lineTo(150, 0);
        ctx.stroke();
    }
    ctx.restore();

    // 3. 大天使拉斐尔 (紫色羽翼)
    const drawAngel = (c) => {
        // 头部
        c.arc(cx, cy - 200, 30, 0, Math.PI*2);
        // 身体
        c.moveTo(cx, cy - 170);
        c.lineTo(cx - 40, cy - 100);
        c.lineTo(cx + 40, cy - 100);
        c.closePath();
    };

    drawSilhouette(ctx, drawAngel, (c) => {
        c.fillStyle = '#e6e6fa'; // 薰衣草色袍
        c.fillRect(0,0,width,height);
    });

    // 天使翅膀 (独立绘制，半透明)
    ctx.save();
    ctx.translate(cx, cy - 180);
    ctx.fillStyle = 'rgba(147, 112, 219, 0.6)'; // 紫色半透明
    const wingBeat = Math.sin(time * 2) * 0.1;
    // 左翼
    ctx.save();
    ctx.rotate(-0.2 + wingBeat);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-150, -100, -180, 50);
    ctx.quadraticCurveTo(-100, 20, 0, 50);
    ctx.fill();
    ctx.restore();
    // 右翼
    ctx.save();
    ctx.rotate(0.2 - wingBeat);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(150, -100, 180, 50);
    ctx.quadraticCurveTo(100, 20, 0, 50);
    ctx.fill();
    ctx.restore();
    ctx.restore();

    // 4. 两座山 (背景)
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(cx - 100, height - 150);
    ctx.lineTo(cx, height - 300); // 尖峰
    ctx.lineTo(cx + 100, height - 150);
    ctx.fill();

    // 5. 地面
    ctx.fillStyle = '#228b22';
    ctx.beginPath();
    ctx.ellipse(cx, height, width, 150, 0, 0, Math.PI*2);
    ctx.fill();

    // 6. 恋人 (亚当与夏娃 - 剪影)
    const drawHuman = (x, isMale) => {
        ctx.save();
        ctx.translate(x, height - 120);
        ctx.fillStyle = '#ffe0bd'; // 肤色
        ctx.beginPath();
        ctx.arc(0, -50, 15, 0, Math.PI*2); // 头
        ctx.fillRect(-10, -35, 20, 40); // 躯干
        // 腿
        ctx.moveTo(-8, 5); ctx.lineTo(-8, 40);
        ctx.moveTo(8, 5); ctx.lineTo(8, 40);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    };

    drawHuman(cx - 80, false); // 女 (左)
    drawHuman(cx + 80, true); // 男 (右)

    // 7. 智慧之树与蛇 (左侧)
    ctx.save();
    ctx.translate(cx - 120, height - 200);
    // 树干
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(0, 100); ctx.lineTo(0, -50); ctx.stroke();
    // 树冠
    ctx.fillStyle = '#006400';
    ctx.beginPath(); ctx.arc(0, -60, 40, 0, Math.PI*2); ctx.fill();
    // 果实
    ctx.fillStyle = 'red';
    ctx.beginPath(); ctx.arc(-10, -50, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(15, -70, 5, 0, Math.PI*2); ctx.fill();
    // 蛇
    ctx.strokeStyle = '#32cd32';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    for(let i=0; i<20; i++) {
        ctx.lineTo(Math.sin(i)*15, 50 - i*5);
    }
    ctx.stroke();
    ctx.restore();

    // 8. 生命之树 (右侧 - 火焰)
    ctx.save();
    ctx.translate(cx + 120, height - 200);
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(0, 100); ctx.lineTo(0, -50); ctx.stroke();
    // 火焰叶子
    for(let i=0; i<12; i++) {
        const fa = (i / 12) * Math.PI * 2;
        const fx = Math.cos(fa) * 30;
        const fy = Math.sin(fa) * 30 - 60;
        ctx.fillStyle = (i%2===0) ? 'orange' : 'red';
        ctx.beginPath();
        ctx.arc(fx, fy, 8 + Math.sin(time*10 + i)*2, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();

    // 9. 标签
    ctx.fillStyle = '#333';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE LOVERS", cx, height - 60);
    ctx.fillText("VI - Harmony & Choice", cx, height - 35);
}