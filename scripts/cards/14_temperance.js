import { setGoldStroke, drawSilhouette, drawDynamicFog } from '../cardUtils.js';

export function drawTemperance(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：清晨的池塘边
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#f0fff0'); // 蜜瓜色
    bgGrad.addColorStop(1, '#87cefa'); // 天蓝
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 远山与太阳
    ctx.fillStyle = '#ffffed'; // 苍白太阳
    ctx.beginPath(); ctx.arc(width/3, height/2, 40, 0, Math.PI*2); ctx.fill();
    // 皇冠状的山路
    ctx.fillStyle = '#deb887';
    ctx.beginPath();
    ctx.moveTo(width/3 - 50, height/2 + 50);
    ctx.lineTo(width/3, height/2 - 20); // 顶
    ctx.lineTo(width/3 + 50, height/2 + 50);
    ctx.fill();

    // 2. 天使主体
    const drawAngel = (c) => {
        c.moveTo(cx - 40, height - 50);
        c.lineTo(cx - 50, cy);
        c.lineTo(cx - 80, cy - 30); // 持杯手1
        c.lineTo(cx - 30, cy - 100); // 肩
        c.arc(cx, cy - 120, 30, 0, Math.PI*2); // 头
        c.lineTo(cx + 30, cy - 100);
        c.lineTo(cx + 80, cy + 30); // 持杯手2
        c.lineTo(cx + 50, cy);
        c.lineTo(cx + 40, height - 50);
    };

    drawSilhouette(ctx, drawAngel, (c) => {
        c.fillStyle = '#fff';
        c.fillRect(0,0,width,height);
        // 胸口三角形 (火元素)
        c.fillStyle = '#ff8c00';
        c.beginPath();
        c.moveTo(cx - 15, cy - 90);
        c.lineTo(cx + 15, cy - 90);
        c.lineTo(cx, cy - 65);
        c.fill();
        c.stroke();
        // 额头太阳符号
        c.fillStyle = 'gold';
        c.beginPath(); c.arc(cx, cy - 125, 5, 0, Math.PI*2); c.fill();
    });

    // 红色翅膀 (天使)
    ctx.save();
    ctx.translate(cx, cy - 100);
    ctx.fillStyle = 'rgba(220, 20, 60, 0.7)';
    // 左翼
    ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(-150, -100, -120, 100); ctx.lineTo(-40, 20); ctx.fill();
    // 右翼
    ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(150, -100, 120, 100); ctx.lineTo(40, 20); ctx.fill();
    ctx.restore();

    // 3. 圣杯与水的流动 (核心)
    const cup1X = cx - 80;
    const cup1Y = cy - 30;
    const cup2X = cx + 80;
    const cup2Y = cy + 30;

    // 绘制两个金杯
    const drawCup = (x, y) => {
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.moveTo(x - 15, y - 20); ctx.lineTo(x + 15, y - 20);
        ctx.lineTo(x + 10, y + 20); ctx.lineTo(x - 10, y + 20);
        ctx.fill();
    };
    drawCup(cup1X, cup1Y);
    drawCup(cup2X, cup2Y);

    // 魔法水流 (反重力或斜向流动)
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.8)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // 动态波浪线
    ctx.beginPath();
    ctx.moveTo(cup1X + 10, cup1Y); // 从上杯流出

    // 模拟液体的动态控制点
    const midX = (cup1X + cup2X) / 2;
    const midY = (cup1Y + cup2Y) / 2 + Math.sin(time * 3) * 10;

    ctx.quadraticCurveTo(midX, midY, cup2X - 10, cup2Y); // 流入下杯
    ctx.stroke();

    // 粒子效果
    ctx.fillStyle = '#fff';
    for(let i=0; i<5; i++) {
        const t = (time + i * 0.2) % 1;
        const lx = (1-t)*(1-t)*(cup1X+10) + 2*(1-t)*t*midX + t*t*(cup2X-10);
        const ly = (1-t)*(1-t)*cup1Y + 2*(1-t)*t*midY + t*t*cup2Y;
        ctx.beginPath(); ctx.arc(lx, ly, 2, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // 4. 水边的鸢尾花 (Iris)
    ctx.save();
    ctx.translate(cx + 100, height - 120);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(0, -20); ctx.stroke(); // 茎
    // 花瓣
    ctx.fillStyle = 'purple';
    ctx.beginPath(); ctx.ellipse(0, -20, 10, 15, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // 5. 标签
    ctx.fillStyle = '#222';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("TEMPERANCE", cx, height - 60);
    ctx.fillText("XIV - Balance & Alchemy", cx, height - 35);
}