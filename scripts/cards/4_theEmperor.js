import { setGoldStroke, drawSilhouette, noise } from '../cardUtils.js';

export function drawTheEmperor(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：严酷的红岩山脉
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#8b0000'); // 深红
    bgGrad.addColorStop(0.5, '#cd5c5c'); // 印度红
    bgGrad.addColorStop(1, '#ffdab9'); // 桃色地平线
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 尖锐的山峰
    ctx.fillStyle = '#500';
    ctx.beginPath();
    ctx.moveTo(0, height);
    for(let x=0; x<=width; x+=20) {
        // 使用绝对值制造尖峰
        const h = Math.abs(noise(x * 0.02, 0)) * 200 + 100;
        ctx.lineTo(x, height - h - 100);
    }
    ctx.lineTo(width, height);
    ctx.fill();

    // 2. 立方体王座 (象征稳固)
    const chairW = 200;
    const chairH = 250;
    const chairX = cx - chairW/2;
    const chairY = cy - 50;

    ctx.save();
    ctx.fillStyle = '#696969'; // 石头灰
    ctx.fillRect(chairX, chairY, chairW, chairH);

    // 石头纹理
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(chairX, chairY, chairW, chairH);
    ctx.beginPath();
    ctx.moveTo(chairX + 20, chairY); ctx.lineTo(chairX + 20, chairY + chairH);
    ctx.moveTo(chairX + chairW - 20, chairY); ctx.lineTo(chairX + chairW - 20, chairY + chairH);
    ctx.stroke();

    // 扶手上的公羊头 (简化几何)
    const drawRamHead = (x, y, scaleX) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scaleX, 1);
        ctx.fillStyle = '#a00';
        // 头
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(20, -10); ctx.lineTo(20, 10); ctx.fill();
        // 角 (螺旋)
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(10, -15, 10, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
    };

    drawRamHead(chairX, chairY + 50, -1); // 左
    drawRamHead(chairX + chairW, chairY + 50, 1); // 右
    ctx.restore();

    // 3. 皇帝人物 (铠甲与长袍)
    const drawFigure = (c) => {
        c.moveTo(cx - 50, height - 50); // 脚
        c.lineTo(cx - 50, cy + 50); // 膝盖
        c.lineTo(cx - 70, cy + 50); // 坐姿臀部
        c.lineTo(cx - 60, cy - 80); // 肩
        c.arc(cx, cy - 100, 30, 0, Math.PI*2); // 头
        c.lineTo(cx + 60, cy - 80);
        c.lineTo(cx + 70, cy + 50);
        c.lineTo(cx + 50, cy + 50);
        c.lineTo(cx + 50, height - 50);
        c.closePath();
    };

    drawSilhouette(ctx, drawFigure, (c) => {
        // 铠甲质感
        c.fillStyle = '#708090'; // 蓝灰钢
        c.fillRect(0, 0, width, height);
        // 红色披风
        c.fillStyle = '#b22222';
        c.beginPath();
        c.moveTo(cx - 60, cy - 80);
        c.quadraticCurveTo(cx, cy, cx + 60, cy - 80);
        c.lineTo(cx + 80, height);
        c.lineTo(cx - 80, height);
        c.fill();
        // 漫长的白须
        c.fillStyle = '#fff';
        c.beginPath();
        c.moveTo(cx - 15, cy - 80);
        c.lineTo(cx + 15, cy - 80);
        c.lineTo(cx, cy - 20);
        c.fill();
    });

    // 4. 权杖 (Ankh 十字架 - 生命)
    ctx.save();
    ctx.translate(cx + 70, cy);
    setGoldStroke(ctx, width, height, 4);
    ctx.beginPath();
    ctx.moveTo(0, 40); ctx.lineTo(0, -20); // 杆
    ctx.moveTo(-10, -5); ctx.lineTo(10, -5); // 横
    ctx.beginPath(); ctx.ellipse(0, -25, 8, 12, 0, 0, Math.PI*2); // 圈
    ctx.stroke();
    ctx.restore();

    // 5. 金球 (Orb - 统治)
    ctx.save();
    ctx.translate(cx - 70, cy);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(0, 15); ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.stroke();
    ctx.restore();

    // 6. 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE EMPEROR", cx, height - 60);
    ctx.fillStyle = '#dca';
    ctx.font = 'italic 16px serif';
    ctx.fillText("IV - Authority & Structure", cx, height - 35);
}