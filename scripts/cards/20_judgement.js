import { setGoldStroke, drawSilhouette, drawDynamicFog } from '../cardUtils.js';

export function drawJudgement(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：清冷的审判日天空
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#87ceeb');
    bgGrad.addColorStop(1, '#f0f8ff'); // 冰雪白
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 远处的冰山
    ctx.fillStyle = '#b0c4de';
    ctx.beginPath();
    ctx.moveTo(0, height - 150);
    ctx.lineTo(100, height - 250);
    ctx.lineTo(200, height - 150);
    ctx.fill();

    // 2. 天使加百列 (云端)
    const drawAngel = (c) => {
        c.moveTo(cx, cy - 80);
        c.lineTo(cx - 40, cy - 150); // 翅膀根
        c.arc(cx, cy - 180, 25, 0, Math.PI*2); // 头
        c.lineTo(cx + 40, cy - 150);
    };

    drawSilhouette(ctx, drawAngel, (c) => {
        c.fillStyle = '#4682b4'; // 蓝肤/蓝衣
        c.fillRect(0,0,width,height);
        // 红十字旗帜 (挂在号角上)
        c.fillStyle = '#fff';
        c.fillRect(cx - 10, cy - 130, 20, 20);
        c.strokeStyle = 'red';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(cx, cy-130); c.lineTo(cx, cy-110);
        c.moveTo(cx-10, cy-120); c.lineTo(cx+10, cy-120);
        c.stroke();
    });

    // 巨大的红色翅膀
    ctx.save();
    ctx.translate(cx, cy - 150);
    ctx.fillStyle = 'rgba(178, 34, 34, 0.8)';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(-150, -80, -100, 50); ctx.lineTo(-20, 20); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(150, -80, 100, 50); ctx.lineTo(20, 20); ctx.fill();
    ctx.restore();

    // 3. 金色号角与声波
    ctx.save();
    ctx.translate(cx + 20, cy - 160);
    ctx.rotate(0.5); // 向下吹
    // 号角
    const trumpetGrad = ctx.createLinearGradient(0,0,60,0);
    trumpetGrad.addColorStop(0, 'gold'); trumpetGrad.addColorStop(1, '#daa520');
    ctx.fillStyle = trumpetGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(60, -15); ctx.lineTo(60, 15); ctx.fill();

    // 声波 (同心圆弧)
    ctx.strokeStyle = 'gold';
    ctx.lineWidth = 2;
    for(let i=0; i<5; i++) {
        const r = 70 + i * 20 + (time * 50)%20;
        ctx.beginPath();
        ctx.arc(0, 0, r, -0.5, 0.5);
        ctx.stroke();
    }
    ctx.restore();

    // 4. 复活的人群 (灰色皮肤，举起双手)
    const drawRisen = (x, y, scale) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        // 棺材
        ctx.fillStyle = '#708090';
        ctx.fillRect(-20, 0, 40, 30);
        // 人
        ctx.fillStyle = '#d3d3d3'; // 苍白
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(-10, -30); // 身
        ctx.arc(0, -40, 10, 0, Math.PI*2); // 头
        ctx.moveTo(10, 0); ctx.lineTo(10, -30);
        // 举手
        ctx.strokeStyle = '#d3d3d3';
        ctx.lineWidth = 4;
        ctx.moveTo(-10, -25); ctx.lineTo(-20, -50);
        ctx.moveTo(10, -25); ctx.lineTo(20, -50);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    };

    drawRisen(cx, height - 100, 1); // 男 (中)
    drawRisen(cx - 80, height - 120, 0.8); // 女 (左)
    drawRisen(cx + 80, height - 120, 0.8); // 孩童 (右)

    // 5. 动态水面 (下方)
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(0, height - 50, width, 50);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=20) {
        ctx.beginPath();
        ctx.moveTo(i, height - 40);
        ctx.lineTo(i + 10, height - 40 + Math.sin(i + time)*5);
        ctx.stroke();
    }

    // 6. 标签
    ctx.fillStyle = '#000';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("JUDGEMENT", cx, height - 60);
    ctx.fillText("XX - Awakening", cx, height - 35);
}