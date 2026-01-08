import { setGoldStroke, drawSilhouette } from '../cardUtils.js';

export function drawTheHierophant(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：神圣殿堂
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#555'); // 灰色石墙
    bgGrad.addColorStop(1, '#222');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 两根巨大的石柱 (灰色)
    const drawPillar = (x) => {
        const pGrad = ctx.createLinearGradient(x-30, 0, x+30, 0);
        pGrad.addColorStop(0, '#333');
        pGrad.addColorStop(0.5, '#777');
        pGrad.addColorStop(1, '#333');
        ctx.fillStyle = pGrad;
        ctx.fillRect(x - 40, 50, 80, height - 100);
        // 柱头纹理
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        for(let y=50; y<height-50; y+=30) {
            ctx.beginPath(); ctx.moveTo(x-40, y); ctx.lineTo(x+40, y); ctx.stroke();
        }
    };
    drawPillar(80);
    drawPillar(width - 80);

    // 3. 教皇的三重冠 (Triregnum)
    const crownX = cx;
    const crownY = cy - 140;

    ctx.save();
    ctx.translate(crownX, crownY);
    ctx.fillStyle = '#ffd700'; // 金色
    // 三层结构
    for(let i=0; i<3; i++) {
        const y = i * 25;
        const w = 40 - i * 5;
        ctx.beginPath();
        ctx.ellipse(0, -y, w, 15, 0, Math.PI, 0); // 上半圆
        ctx.lineTo(w, -y + 20);
        ctx.ellipse(0, -y + 20, w, 5, 0, 0, Math.PI*2); // 底部
        ctx.fill();
        ctx.stroke();
    }
    // 顶部十字
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -60); ctx.lineTo(0, -80);
    ctx.moveTo(-10, -70); ctx.lineTo(10, -70);
    ctx.stroke();
    ctx.restore();

    // 4. 教皇人物 (红袍)
    const drawFigure = (c) => {
        c.moveTo(cx - 60, height - 100);
        c.lineTo(cx - 50, cy);
        c.lineTo(cx - 70, cy - 50); // 举起的手
        c.lineTo(cx - 40, cy - 80); // 肩
        c.arc(cx, cy - 100, 30, 0, Math.PI*2); // 头
        c.lineTo(cx + 40, cy - 80);
        c.lineTo(cx + 70, cy - 20); // 持杖的手
        c.lineTo(cx + 60, height - 100);
    };

    drawSilhouette(ctx, drawFigure, (c) => {
        c.fillStyle = '#b22222'; // 绯红长袍
        c.fillRect(0,0,width,height);
        // 白色中央条带
        c.fillStyle = '#fff';
        c.fillRect(cx - 15, cy - 80, 30, height);
        // 十字架图案
        c.strokeStyle = '#000';
        c.lineWidth = 2;
        for(let y=cy; y<height-100; y+=40) {
            c.beginPath();
            c.moveTo(cx, y-10); c.lineTo(cx, y+10);
            c.moveTo(cx-10, y); c.lineTo(cx+10, y);
            c.stroke();
        }
    });

    // 5. 三重十字权杖 (Papal Cross)
    ctx.save();
    ctx.translate(cx + 70, cy - 50);
    setGoldStroke(ctx, width, height, 4);
    ctx.beginPath();
    ctx.moveTo(0, 150); ctx.lineTo(0, -60); // 杆
    // 三横杠
    ctx.moveTo(-10, -50); ctx.lineTo(10, -50);
    ctx.moveTo(-15, -30); ctx.lineTo(15, -30);
    ctx.moveTo(-20, -10); ctx.lineTo(20, -10);
    ctx.stroke();
    ctx.restore();

    // 6. 交叉的金银钥匙 (Keys of Heaven)
    ctx.save();
    ctx.translate(cx, height - 120);
    ctx.rotate(Math.sin(time) * 0.05); // 轻微摆动

    // 金钥匙
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.fillRect(-5, -40, 10, 80); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -40, 15, 0, Math.PI*2); ctx.fill(); // 把手
    // 齿
    ctx.fillRect(0, 20, 15, 5); ctx.fillRect(0, 30, 15, 5);

    // 银钥匙
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath(); ctx.fillRect(-5, -40, 10, 80); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -40, 15, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(0, 20, 15, 5); ctx.fillRect(0, 30, 15, 5);
    ctx.restore();

    // 7. 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE HIEROPHANT", cx, height - 60);
    ctx.fillText("V - Tradition & Belief", cx, height - 35);
}