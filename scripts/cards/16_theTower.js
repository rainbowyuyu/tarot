import { setGoldStroke, drawSilhouette, noise } from '../cardUtils.js';

export function drawTheTower(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：惊雷黑夜
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#000');
    bgGrad.addColorStop(0.8, '#1a0505'); // 暗红
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 悬崖基座
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, height - 100);
    ctx.quadraticCurveTo(cx, height - 150, 0, height - 100);
    ctx.fill();

    // 3. 高塔主体 (灰色砖石)
    const towerW = 100;
    const towerH = 300;
    const towerX = cx - towerW/2;
    const towerY = cy - 100;

    ctx.save();
    ctx.fillStyle = '#555';
    ctx.fillRect(towerX, towerY, towerW, towerH);

    // 砖块纹理
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for(let y = towerY; y < towerY + towerH; y += 20) {
        ctx.beginPath();
        ctx.moveTo(towerX, y);
        ctx.lineTo(towerX + towerW, y);
        ctx.stroke();
        // 竖线 (交错)
        const offset = (y % 40 === 0) ? 0 : 10;
        for(let x = towerX + offset; x < towerX + towerW; x+=20) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y+20); ctx.stroke();
        }
    }
    ctx.restore();

    // 4. 闪电 (核心视觉 - 动态)
    ctx.save();
    ctx.beginPath();
    let lx = width;
    let ly = 0;
    ctx.moveTo(lx, ly);

    // 生成锯齿状闪电路径
    const segments = 10;
    for(let i=0; i<segments; i++) {
        lx = width - (width/2) * (i/segments) + (Math.random()-0.5)*40;
        ly = (cy - 120) * (i/segments) + (Math.random()-0.5)*20;
        ctx.lineTo(lx, ly);
    }
    // 击中塔顶
    ctx.lineTo(cx + 20, towerY + 20);

    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 20 + Math.sin(time*20)*10; // 闪烁
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // 5. 爆炸与皇冠被击飞
    ctx.save();
    ctx.translate(cx, towerY);
    // 皇冠
    ctx.rotate(time * 2); // 旋转飞出
    ctx.translate(0, -50 - time * 50); // 向上飞
    setGoldStroke(ctx, width, height, 3);
    ctx.beginPath();
    ctx.moveTo(-20, 0); ctx.lineTo(-10, -20); ctx.lineTo(0, 0); ctx.lineTo(10, -20); ctx.lineTo(20, 0);
    ctx.closePath();
    ctx.fillStyle = '#gold';
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 火焰粒子 (从塔顶冒出)
    for(let i=0; i<20; i++) {
        const fx = cx + (Math.random()-0.5)*80;
        const fy = towerY + (Math.random())*50;
        const size = Math.random() * 10;
        ctx.fillStyle = `rgba(255, ${Math.random()*100}, 0, ${Math.random()})`;
        ctx.beginPath();
        ctx.arc(fx, fy - (time*100 + i*20)%100, size, 0, Math.PI*2);
        ctx.fill();
    }

    // 6. 坠落的人 (剪影)
    const drawFallingMan = (x, y, scale) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.rotate(time + x); // 旋转下落
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, -10, 5, 0, Math.PI*2); // 头
        ctx.fillRect(-5, 0, 10, 15); // 身
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-15, -10); ctx.stroke(); // 手
        ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(15, -10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-3, 15); ctx.lineTo(-10, 25); ctx.stroke(); // 腿
        ctx.beginPath(); ctx.moveTo(3, 15); ctx.lineTo(10, 25); ctx.stroke();
        ctx.restore();
    };

    const dropY = (time * 150) % (height - 200) + 200;
    drawFallingMan(cx - 60, dropY, 1);
    drawFallingMan(cx + 60, dropY - 100, -1); // 镜像

    // 7. 尤德 (Yod) 火雨 (上帝的恩典/毁灭)
    for(let i=0; i<10; i++) {
        const yodX = (i * 50) % width;
        const yodY = (time * 80 + i * 30) % height;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.ellipse(yodX, yodY, 3, 6, 0, 0, Math.PI*2);
        ctx.fill();
    }

    // 8. 标签
    ctx.fillStyle = '#eee';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE TOWER", cx, height - 60);
    ctx.fillStyle = '#c0392b';
    ctx.font = 'italic 16px serif';
    ctx.fillText("XVI - Sudden Change", cx, height - 35);
}