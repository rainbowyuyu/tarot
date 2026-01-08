import { setGoldStroke, drawSilhouette, noise } from '../cardUtils.js';

export function drawTheDevil(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：深渊地牢
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#000');
    bgGrad.addColorStop(1, '#221100'); // 暗棕
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 倒五角星 (Inverted Pentagram) - 位于恶魔头部上方
    ctx.save();
    ctx.translate(cx, cy - 180);
    setGoldStroke(ctx, width, height, 3);
    ctx.beginPath();
    const r = 40;
    // 简单的倒五星绘制
    for(let i=0; i<5; i++) {
        const ang = (i * 4 * Math.PI / 5) - Math.PI/2; // 调整起始角度使其倒置
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        if(i===0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#a00'; // 血红线条
    ctx.stroke();
    ctx.restore();

    // 3. 恶魔主体 (Baphomet 形象 - 蝙蝠翅膀)
    const drawDevil = (c) => {
        // 蹲坐姿势
        c.moveTo(cx, cy - 50); // 胸
        c.lineTo(cx - 40, cy);
        c.lineTo(cx - 60, cy + 50); // 腿
        c.lineTo(cx - 20, cy + 80); // 爪
        c.lineTo(cx + 20, cy + 80);
        c.lineTo(cx + 60, cy + 50);
        c.lineTo(cx + 40, cy);

        // 头 (羊角)
        c.moveTo(cx - 20, cy - 80);
        c.bezierCurveTo(cx - 60, cy - 120, cx - 40, cy - 150, cx - 10, cy - 100);
        c.lineTo(cx + 10, cy - 100);
        c.bezierCurveTo(cx + 40, cy - 150, cx + 60, cy - 120, cx + 20, cy - 80);
    };

    drawSilhouette(ctx, drawDevil, (c) => {
        c.fillStyle = '#333';
        c.fillRect(0,0,width,height);
        // 毛发质感
        c.fillStyle = '#111';
        for(let i=0; i<100; i++) {
            c.fillRect(cx - 50 + Math.random()*100, cy - 50 + Math.random()*130, 2, 5);
        }
    });

    // 蝙蝠翅膀 (深灰)
    ctx.save();
    ctx.translate(cx, cy - 60);
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(0,0); ctx.lineTo(-150, -50); ctx.quadraticCurveTo(-100, 50, -20, 20); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0,0); ctx.lineTo(150, -50); ctx.quadraticCurveTo(100, 50, 20, 20); ctx.fill();
    ctx.restore();

    // 4. 火炬 (左手持火 - 向下)
    const torchX = cx - 70;
    const torchY = cy + 20;
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(torchX, torchY, 10, 40);

    // 火焰粒子
    for(let i=0; i<10; i++) {
        const fy = torchY + 40 + Math.random()*20;
        const fx = torchX + 5 + (Math.random()-0.5)*10;
        ctx.fillStyle = `rgba(255, ${Math.random()*100}, 0, 0.8)`;
        ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI*2); ctx.fill();
    }

    // 5. 被锁链束缚的人 (亚当夏娃的堕落版)
    const stoneY = height - 150;
    // 黑石基座
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 50, stoneY, 100, 50);
    // 铁环
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, stoneY + 25, 10, 0, Math.PI*2); ctx.stroke();

    const drawChainedFigure = (x, hasTail) => {
        ctx.save();
        ctx.translate(x, height - 100);
        ctx.fillStyle = '#d8bfd8'; // 苍白肤色
        ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI*2); ctx.fill(); // 头
        ctx.fillRect(-8, -20, 16, 30); // 身

        // 锁链
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(cx - x, stoneY - (height - 100) + 25); ctx.stroke();

        // 尾巴/角 (象征兽性)
        if(hasTail) {
            ctx.strokeStyle = 'red';
            ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(20, 20); ctx.lineTo(25, 15); ctx.stroke();
        }
        ctx.restore();
    };

    drawChainedFigure(cx - 60, true); // 女 (有尾)
    drawChainedFigure(cx + 60, true); // 男

    // 6. 标签
    ctx.fillStyle = '#a00';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE DEVIL", cx, height - 60);
    ctx.fillStyle = '#666';
    ctx.font = 'italic 16px serif';
    ctx.fillText("XV - Bondage & Materialism", cx, height - 35);
}