import { setGoldStroke, drawSilhouette, drawComplexStar } from '../cardUtils.js';

export function drawTheStar(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：清澈的夜空
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#000033'); // 深蓝
    bgGrad.addColorStop(1, '#191970'); // 午夜蓝
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 巨大的主星 (八角星)
    const starX = cx;
    const starY = 120;
    drawComplexStar(ctx, starX, starY, 60, 8, time * 0.2);

    // 3. 七颗小星 (七脉轮/七行星)
    for(let i=0; i<7; i++) {
        const angle = (i / 7) * Math.PI * 2 + time * 0.05;
        const r = 100;
        const sx = starX + Math.cos(angle) * r;
        const sy = starY + Math.sin(angle) * r;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        // 简单的四角星
        ctx.moveTo(sx, sy-10); ctx.lineTo(sx+2, sy); ctx.lineTo(sx, sy+10); ctx.lineTo(sx-2, sy);
        ctx.fill();
    }

    // 4. 裸体女神 (跪姿倒水)
    const drawGoddess = (c) => {
        // 跪姿
        c.moveTo(cx - 20, height - 100); // 膝盖
        c.lineTo(cx + 10, height - 120); // 臀部
        c.lineTo(cx, cy); // 背
        c.arc(cx + 10, cy - 20, 15, 0, Math.PI*2); // 头
        c.lineTo(cx + 20, cy);
        c.lineTo(cx + 40, height - 140); // 另一条腿
    };

    drawSilhouette(ctx, drawGoddess, (c) => {
        c.fillStyle = '#e6e6fa'; // 苍白光辉
        c.fillRect(0,0,width,height);
    });

    // 5. 两壶水 (生命之水)
    const jug1X = cx - 40; // 倒在水里
    const jug1Y = height - 120;
    const jug2X = cx + 50; // 倒在地上
    const jug2Y = height - 130;

    // 绘制水壶
    ctx.fillStyle = '#cd853f';
    ctx.beginPath(); ctx.arc(jug1X, jug1Y, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(jug2X, jug2Y, 10, 0, Math.PI*2); ctx.fill();

    // 6. 水池与大地
    // 右侧大地
    ctx.fillStyle = '#228b22';
    ctx.beginPath();
    ctx.moveTo(cx, height);
    ctx.quadraticCurveTo(width, height - 100, width, height);
    ctx.fill();

    // 左侧水池
    ctx.fillStyle = '#00bfff';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(cx, height);
    ctx.quadraticCurveTo(cx - 50, height - 100, 0, height - 80);
    ctx.fill();

    // 7. 倒水动画 (5股水流)
    ctx.strokeStyle = '#e0ffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -time * 20;

    // 水壶1 -> 水池 (激起涟漪)
    ctx.beginPath(); ctx.moveTo(jug1X - 10, jug1Y); ctx.lineTo(jug1X - 30, height - 50); ctx.stroke();
    // 涟漪
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.ellipse(jug1X - 30, height - 50, 20 + Math.sin(time)*5, 5, 0, 0, Math.PI*2); ctx.stroke();

    // 水壶2 -> 大地 (分成5支流)
    ctx.strokeStyle = '#e0ffff';
    ctx.beginPath(); ctx.moveTo(jug2X + 10, jug2Y); ctx.lineTo(jug2X + 30, height - 50); ctx.stroke();

    // 8. 树上的朱鹭 (Ibis - 托特神)
    ctx.save();
    ctx.translate(width - 60, height - 150);
    // 树
    ctx.fillStyle = '#006400';
    ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(10, 0); ctx.lineTo(-10, 10); ctx.fill();
    // 鸟
    ctx.fillStyle = '#ff6347';
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill(); // 身
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -5); ctx.stroke(); // 喙
    ctx.restore();

    // 9. 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE STAR", cx, height - 60);
    ctx.fillText("XVII - Hope & Inspiration", cx, height - 35);
}