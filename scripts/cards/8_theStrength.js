import { setGoldStroke, drawSilhouette, drawDynamicFog } from '../cardUtils.js';

export function drawTheStrength(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：宁静的金色原野
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#fffacd'); // 柠檬绸
    bgGrad.addColorStop(1, '#90ee90'); // 浅绿
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 远山 (柔和)
    ctx.fillStyle = '#8fbc8f';
    ctx.beginPath();
    ctx.moveTo(0, height - 200);
    ctx.quadraticCurveTo(width/2, height - 300, width, height - 200);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // 2. 无限符号 (头顶)
    ctx.save();
    ctx.translate(cx, cy - 180);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    // 动态光流效果
    ctx.setLineDash([20, 10]);
    ctx.lineDashOffset = time * 20;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(40, -30, 40, 30, 0, 0);
    ctx.bezierCurveTo(-40, -30, -40, 30, 0, 0);
    ctx.stroke();
    ctx.restore();

    // 3. 女子 (白衣)
    const drawWoman = (c) => {
        c.moveTo(cx - 20, height - 100);
        c.lineTo(cx - 30, cy); // 身体
        c.arc(cx, cy - 100, 25, 0, Math.PI*2); // 头
        c.lineTo(cx + 40, cy + 20); // 手伸向狮子
        c.lineTo(cx + 30, height - 100);
    };

    drawSilhouette(ctx, drawWoman, (c) => {
        c.fillStyle = '#fff';
        c.fillRect(0,0,width,height);
        // 花环腰带
        c.strokeStyle = 'green';
        c.lineWidth = 5;
        c.beginPath(); c.moveTo(cx-25, cy+50); c.lineTo(cx+25, cy+60); c.stroke();
        // 头发
        c.fillStyle = '#deb887';
        c.beginPath(); c.arc(cx, cy-100, 26, 0, Math.PI*2); c.fill();
    });

    // 4. 狮子 (红色/橙色)
    const lionX = cx + 60;
    const lionY = height - 150;

    ctx.save();
    // 鬃毛 (粒子毛发效果)
    ctx.fillStyle = '#cd853f';
    for(let i=0; i<50; i++) {
        const ang = (i/50)*Math.PI*2;
        const r = 40 + Math.random()*10;
        const lx = lionX + Math.cos(ang)*r;
        const ly = lionY + Math.sin(ang)*r;
        ctx.beginPath();
        ctx.moveTo(lionX, lionY);
        ctx.lineTo(lx, ly);
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 狮头主体
    ctx.fillStyle = '#f4a460';
    ctx.beginPath();
    ctx.arc(lionX, lionY, 35, 0, Math.PI*2);
    ctx.fill();

    // 眼睛 (闭合，温顺)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lionX - 15, lionY - 5); ctx.lineTo(lionX - 5, lionY - 5);
    ctx.moveTo(lionX + 5, lionY - 5); ctx.lineTo(lionX + 15, lionY - 5);
    ctx.stroke();

    // 舌头 (舔手)
    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.ellipse(lionX - 10, lionY + 15, 5, 8, 0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // 5. 互动：女子的手轻抚狮子
    ctx.fillStyle = '#ffe0bd';
    ctx.beginPath();
    ctx.ellipse(lionX, lionY - 35, 10, 5, 0, 0, Math.PI*2);
    ctx.fill();

    // 6. 标签
    ctx.fillStyle = '#222';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("STRENGTH", cx, height - 60);
    ctx.fillStyle = '#555';
    ctx.font = 'italic 16px serif';
    ctx.fillText("VIII - Courage & Compassion", cx, height - 35);
}