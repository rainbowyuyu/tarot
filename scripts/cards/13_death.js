import { setGoldStroke, drawSilhouette, drawDynamicFog, noise } from '../cardUtils.js';

export function drawDeath(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：末日黄昏
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1a1a1a'); // 黑
    grad.addColorStop(0.6, '#2c3e50'); // 灰蓝
    grad.addColorStop(1, '#4a192c'); // 血红地平线
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. 远处的双塔 (太阳升起)
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 150, cy + 50, 40, 200);
    ctx.fillRect(cx + 110, cy + 50, 40, 200);

    // 金色朝阳 (永生的希望)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy + 200, 60, Math.PI, 0);
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.restore();

    // 3. 死神骑士 (剪影)
    const drawRider = (c) => {
        // 马头
        c.moveTo(cx - 80, cy - 20);
        c.quadraticCurveTo(cx - 100, cy - 80, cx - 60, cy - 100);
        c.lineTo(cx - 40, cy - 50);
        // 骑士身躯
        c.lineTo(cx, cy - 80); // 肩
        c.arc(cx + 20, cy - 100, 25, 0, Math.PI*2); // 头骨
        c.lineTo(cx + 60, cy - 20); // 背
        c.lineTo(cx + 80, cy + 150); // 马尾
        c.lineTo(cx - 100, cy + 150); // 马腿
        c.closePath();
    };

    drawSilhouette(ctx, drawRider, (c) => {
        // 黑色盔甲
        c.fillStyle = '#111';
        c.fillRect(0, 0, width, height);
        // 骨骼细节 (白色线条)
        c.strokeStyle = '#ddd';
        c.lineWidth = 2;
        // 肋骨
        for(let i=0; i<5; i++) {
            c.beginPath();
            c.arc(cx + 10, cy - 50 + i*10, 15, -0.5, 3.5);
            c.stroke();
        }
        // 马的眼睛 (红光)
        c.fillStyle = '#f00';
        c.shadowColor = '#f00'; c.shadowBlur = 10;
        c.beginPath(); c.arc(cx - 70, cy - 70, 3, 0, Math.PI*2); c.fill();
    });

    // 4. 死神旗帜 (随风飘动)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx + 40, cy - 80); // 旗杆手握处
    ctx.lineTo(cx + 40, cy - 250); // 旗杆顶

    // 旗面 (正弦波动态)
    for(let y = cy - 240; y < cy - 100; y+=5) {
        const xOffset = Math.sin(y * 0.05 + time * 3) * 10;
        ctx.lineTo(cx + 140 + xOffset, y);
    }
    ctx.lineTo(cx + 40, cy - 100);
    ctx.fillStyle = '#000';
    ctx.fill();

    // 旗帜上的白玫瑰 (Mystic Rose)
    ctx.translate(cx + 90, cy - 170);
    ctx.rotate(time); // 缓慢旋转
    ctx.beginPath();
    for(let i=0; i<5; i++) {
        ctx.rotate(Math.PI*2/5);
        ctx.moveTo(0,0);
        ctx.quadraticCurveTo(15, -20, 30, 0);
        ctx.quadraticCurveTo(15, 20, 0, 0);
    }
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();

    // 5. 地面的尸体 (国王 - 象征权力的终结)
    ctx.save();
    ctx.translate(cx, height - 100);
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.ellipse(0, 0, 80, 20, 0, 0, Math.PI*2);
    ctx.fill();
    // 掉落的王冠
    setGoldStroke(ctx, width, height, 2);
    ctx.beginPath();
    ctx.moveTo(-60, 10); ctx.lineTo(-50, -10); ctx.lineTo(-40, 10);
    ctx.stroke();
    ctx.restore();

    // 6. 标签
    ctx.fillStyle = '#eee';
    ctx.font = 'bold 30px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("DEATH", cx, height - 50);
}