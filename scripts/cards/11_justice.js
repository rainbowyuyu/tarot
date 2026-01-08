import { setGoldStroke, drawSilhouette } from '../cardUtils.js';

export function drawJustice(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：紫色帷幕 (象征智慧)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#4b0082'); // 靛青
    bgGrad.addColorStop(1, '#800080'); // 紫色
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 帷幕褶皱
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 3;
    for(let i=0; i<width; i+=40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.quadraticCurveTo(i + 20, cy, i, height);
        ctx.stroke();
    }

    // 2. 正义女神 (红袍坐像)
    const drawFigure = (c) => {
        c.moveTo(cx - 60, height - 50); // 袍底
        c.lineTo(cx - 50, cy + 50);
        c.lineTo(cx - 80, cy - 20); // 举天平的手
        c.lineTo(cx - 40, cy - 80); // 肩
        c.arc(cx, cy - 100, 28, 0, Math.PI*2); // 头
        c.lineTo(cx + 40, cy - 80);
        c.lineTo(cx + 80, cy - 20); // 举剑的手
        c.lineTo(cx + 50, cy + 50);
        c.lineTo(cx + 60, height - 50);
    };

    drawSilhouette(ctx, drawFigure, (c) => {
        c.fillStyle = '#dc143c'; // 鲜红
        c.fillRect(0,0,width,height);
        // 绿色披肩 (扣子)
        c.fillStyle = '#228b22';
        c.beginPath();
        c.moveTo(cx - 40, cy - 80);
        c.quadraticCurveTo(cx, cy - 40, cx + 40, cy - 80);
        c.lineTo(cx, cy - 60);
        c.fill();
        // 金色方形扣
        c.fillStyle = 'gold';
        c.fillRect(cx - 10, cy - 65, 20, 20);
    });

    // 3. 宝剑 (右手 - 垂直向上)
    ctx.save();
    ctx.translate(cx + 80, cy - 100);
    setGoldStroke(ctx, width, height, 4);
    // 剑身
    ctx.beginPath();
    ctx.moveTo(0, 80); ctx.lineTo(0, -100);
    ctx.stroke();
    // 护手
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
    // 剑光
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(0, -100); ctx.stroke();
    ctx.restore();

    // 4. 天平 (左手 - 动态平衡)
    const scaleX = cx - 80;
    const scaleY = cy - 80;

    ctx.save();
    ctx.translate(scaleX, scaleY);
    // 提钮
    ctx.fillStyle = 'gold';
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();

    // 横杆 (随时间摆动)
    const sway = Math.sin(time) * 0.1;
    ctx.rotate(sway);

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.stroke();

    // 两个秤盘
    const drawPan = (x) => {
        ctx.save();
        ctx.translate(x, 0);
        ctx.rotate(-sway); // 保持盘子水平
        // 绳索
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-10, 30);
        ctx.moveTo(0, 0); ctx.lineTo(10, 30);
        ctx.stroke();
        // 盘子
        ctx.fillStyle = '#gold';
        ctx.beginPath();
        ctx.arc(0, 30, 12, 0, Math.PI, false);
        ctx.fill();
        ctx.restore();
    };

    drawPan(-40);
    drawPan(40);
    ctx.restore();

    // 5. 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("JUSTICE", cx, height - 60);
    ctx.fillText("XI - Truth & Law", cx, height - 35);
}