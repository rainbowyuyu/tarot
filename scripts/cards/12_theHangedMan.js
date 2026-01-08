import { setGoldStroke, drawSilhouette } from '../cardUtils.js';

export function drawTheHangedMan(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：中性灰蓝
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#d3d3d3');
    bgGrad.addColorStop(1, '#778899');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. T形十字架 (Tau Cross - 活木)
    const woodColor = '#8b4513';
    ctx.fillStyle = woodColor;

    // 竖桩
    ctx.fillRect(cx - 15, 50, 30, height - 100);
    // 横梁
    ctx.fillRect(cx - 100, 50, 200, 30);

    // 木纹质感
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1;
    for(let y=50; y<height-50; y+=20) {
        ctx.beginPath();
        ctx.moveTo(cx - 10, y);
        ctx.lineTo(cx + 10, y + 10);
        ctx.stroke();
    }

    // 绿叶 (象征生命)
    ctx.fillStyle = '#32cd32';
    for(let i=0; i<6; i++) {
        const lx = (i%2===0) ? cx - 15 : cx + 15;
        const ly = 100 + i * 80;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 10, 5, (i%2===0)?-0.5:0.5, 0, Math.PI*2);
        ctx.fill();
    }

    // 3. 倒吊人 (颠倒绘制)
    // 建议：直接倒着画，或者用 transform
    const drawMan = (c) => {
        // 右脚被绑
        c.moveTo(cx, 80);
        c.lineTo(cx + 10, 200); // 腿直

        // 左腿 (弯曲成4字)
        c.lineTo(cx - 40, 250); // 膝盖
        c.lineTo(cx + 20, 240); // 别在右腿后

        // 躯干 (倒置)
        c.moveTo(cx, 200);
        c.lineTo(cx, 350); // 腰到肩

        // 手臂 (背在身后/成三角形)
        c.lineTo(cx - 30, 300); // 肘
        c.lineTo(cx + 30, 300);
        c.lineTo(cx, 350);

        // 头 (最下面)
        c.arc(cx, 380, 25, 0, Math.PI*2);
    };

    drawSilhouette(ctx, drawMan, (c) => {
        c.fillStyle = '#4682b4'; // 蓝衣
        c.fillRect(0,0,width,height);
        // 红裤子
        c.fillStyle = '#cd5c5c';
        c.beginPath();
        c.moveTo(cx, 80); c.lineTo(cx+20, 200); c.lineTo(cx-20, 200); c.fill();
    });

    // 绳索
    ctx.strokeStyle = '#d2b48c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, 50); // 横梁中点
    ctx.lineTo(cx, 90); // 脚踝
    ctx.stroke();

    // 4. 头部光环 (觉悟)
    const haloY = 380;
    const haloGlow = ctx.createRadialGradient(cx, haloY, 20, cx, haloY, 80);
    haloGlow.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    haloGlow.addColorStop(1, 'rgba(255, 255, 0, 0)');
    ctx.fillStyle = haloGlow;
    ctx.beginPath();
    ctx.arc(cx, haloY, 80, 0, Math.PI*2);
    ctx.fill();

    // 动态光芒线条
    ctx.save();
    ctx.translate(cx, haloY);
    ctx.rotate(time);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    for(let i=0; i<12; i++) {
        ctx.rotate(Math.PI/6);
        ctx.beginPath();
        ctx.moveTo(30, 0); ctx.lineTo(60, 0);
        ctx.stroke();
    }
    ctx.restore();

    // 5. 标签
    ctx.fillStyle = '#222';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE HANGED MAN", cx, height - 60);
    ctx.fillText("XII - Sacrifice & Perspective", cx, height - 35);
}