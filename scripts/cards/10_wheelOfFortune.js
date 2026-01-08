import { setGoldStroke, drawSilhouette } from '../cardUtils.js';

export function drawWheelOfFortune(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2 - 50;
    const radius = 120;

    // 1. 背景：流转的云气
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 500);
    bgGrad.addColorStop(0, '#3a506b'); // 蓝
    bgGrad.addColorStop(1, '#0b132b'); // 深蓝
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 命运之轮 (主体)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.3); // 轮子持续缓慢转动

    // 外圈
    setGoldStroke(ctx, width, height, 8);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI*2);
    ctx.fillStyle = '#cd7f32'; // 铜色背景
    ctx.fill();
    ctx.stroke();

    // 内圈
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.7, 0, Math.PI*2);
    ctx.stroke();

    // 辐条 (8根)
    for(let i=0; i<8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, radius);
        ctx.stroke();
    }

    // 文字 T-A-R-O
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const letters = ['T', 'A', 'R', 'O'];
    for(let i=0; i<4; i++) {
        ctx.save();
        // 放置在主要方位
        const angle = i * (Math.PI/2);
        ctx.rotate(angle);
        ctx.translate(0, -radius + 20); // 移到边缘内侧
        ctx.rotate(-angle); // 修正文字方向
        ctx.fillText(letters[i], 0, 0);
        ctx.restore();
    }

    // 炼金符号 (简化)
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#000';
    const symbols = ['☿', '🜍', '🜔', '🜁']; // 水银, 硫磺, 盐, 水
    for(let i=0; i<4; i++) {
        ctx.save();
        const angle = i * (Math.PI/2) + (Math.PI/4);
        ctx.rotate(angle);
        ctx.translate(0, -radius * 0.5);
        ctx.rotate(-angle);
        ctx.fillText(symbols[i], 0, 0);
        ctx.restore();
    }
    ctx.restore(); // 结束轮子旋转

    // 3. 守护兽 (斯芬克斯 - 顶部)
    ctx.save();
    ctx.translate(cx, cy - radius - 40);
    ctx.fillStyle = '#4682b4'; // 蓝色斯芬克斯
    ctx.beginPath();
    ctx.moveTo(-30, 40); // 脚
    ctx.lineTo(-20, 0); // 蹲坐
    ctx.lineTo(20, 0);
    ctx.lineTo(30, 40);
    ctx.arc(0, -20, 15, 0, Math.PI*2); // 头
    ctx.fill();
    // 宝剑
    setGoldStroke(ctx, width, height, 2);
    ctx.beginPath(); ctx.moveTo(-20, 10); ctx.lineTo(20, -30); ctx.stroke();
    ctx.restore();

    // 4. 阿努比斯 (右下 - 上升)
    ctx.save();
    ctx.translate(cx + radius + 20, cy + radius);
    ctx.fillStyle = '#b22222'; // 红色
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 30, 0.2, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // 5. 蛇 (左下 - 下降)
    ctx.save();
    ctx.translate(cx - radius - 20, cy + radius);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(10, -20);
    ctx.bezierCurveTo(-20, 0, 20, 20, -10, 40);
    ctx.stroke();
    ctx.restore();

    // 6. 四角云层与书本 (四使徒)
    const drawCorner = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI*2);
        ctx.fill();
        // 书本
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 15, y - 10, 30, 20);
    };

    drawCorner(40, 40, 'rgba(255,255,255,0.2)'); // 天使
    drawCorner(width-40, 40, 'rgba(255,200,100,0.2)'); // 鹰
    drawCorner(40, height-150, 'rgba(200,100,100,0.2)'); // 牛
    drawCorner(width-40, height-150, 'rgba(200,200,50,0.2)'); // 狮

    // 7. 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("WHEEL OF FORTUNE", cx, height - 80);
    ctx.font = 'italic 16px serif';
    ctx.fillText("X - Cycles & Destiny", cx, height - 55);
}