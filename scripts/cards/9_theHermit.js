import { setGoldStroke, drawSilhouette, drawComplexStar, noise } from '../cardUtils.js';

export function drawTheHermit(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：极寒雪山之夜
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#050510'); // 极黑
    bgGrad.addColorStop(0.7, '#1a2a3a'); // 灰蓝山体
    bgGrad.addColorStop(1, '#eee'); // 雪地反光
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 远山 (Procedural Mountains)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, height);
    for(let x = 0; x <= width; x+=20) {
        const h = noise(x * 0.01, 10) * 100 + 300;
        ctx.lineTo(x, height - h);
    }
    ctx.lineTo(width, height);
    ctx.fillStyle = '#0b1116';
    ctx.fill();
    ctx.restore();

    // 3. 飘雪粒子系统
    ctx.save();
    for(let i=0; i<50; i++) {
        const seed = i * 132.1;
        // 使用时间偏移让雪花下落
        const y = (seed + time * 50) % height;
        const x = (Math.sin(y * 0.01 + seed) * 50 + seed * 10) % width;
        const size = (seed % 3) + 1;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();

    // 4. 隐士人物 (佝偻的老者)
    const drawHermit = (c) => {
        c.moveTo(cx + 20, height); // 袍底右
        c.lineTo(cx + 40, cy); // 背部
        c.quadraticCurveTo(cx + 30, cy - 80, cx, cy - 100); // 驼背
        c.arc(cx - 10, cy - 120, 25, 0, Math.PI*2); // 头（低垂）
        c.lineTo(cx - 40, cy - 80); // 颈前
        c.lineTo(cx - 60, cy + 20); // 手臂持灯
        c.lineTo(cx - 80, height); // 袍底左
        c.closePath();
    };

    drawSilhouette(ctx, drawHermit, (c) => {
        c.fillStyle = '#2c3e50'; // 灰袍
        c.fillRect(0, 0, width, height);

        // 袍子皱褶
        c.strokeStyle = 'rgba(0,0,0,0.5)';
        c.lineWidth = 2;
        for(let i=0; i<5; i++) {
            c.beginPath();
            c.moveTo(cx, cy - 50);
            c.quadraticCurveTo(cx - 20 - i*10, cy + 50, cx - 40 - i*15, height);
            c.stroke();
        }
    });

    // 5. 提灯与六芒星 (核心光源)
    const lanternX = cx - 60;
    const lanternY = cy + 20 + Math.sin(time * 2) * 2; // 手部微颤

    // 灯笼线
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - 50); // 肩膀附近
    ctx.lineTo(lanternX, lanternY - 20);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 灯笼光晕 (Bloom)
    const glow = ctx.createRadialGradient(lanternX, lanternY, 5, lanternX, lanternY, 150);
    glow.addColorStop(0, 'rgba(255, 255, 200, 1)');
    glow.addColorStop(0.2, 'rgba(255, 200, 50, 0.5)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.globalCompositeOperation = 'screen'; // 混合模式让光更亮
    ctx.beginPath(); ctx.arc(lanternX, lanternY, 150, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // 灯笼内的六芒星 (真理之光)
    drawComplexStar(ctx, lanternX, lanternY, 10, 6, time * 0.5);

    // 6. 手杖 (Staff)
    ctx.save();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 40, cy); // 另一只手
    ctx.lineTo(cx + 60, height);
    ctx.stroke();
    ctx.restore();

    // 7. 标签
    ctx.fillStyle = '#ddd';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE HERMIT", cx, height - 60);
    ctx.fillStyle = '#888';
    ctx.font = 'italic 16px serif';
    ctx.fillText("IX - Inner Guidance", cx, height - 35);
}