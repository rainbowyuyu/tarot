import { setGoldStroke, drawSilhouette } from '../cardUtils.js';

export function drawTheChariot(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：金色辉煌的城市
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#ffd700'); // 金色天空
    bgGrad.addColorStop(1, '#f0e68c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 城市剪影
    ctx.fillStyle = '#b8860b';
    ctx.beginPath();
    for(let x=0; x<width; x+=30) {
        const h = Math.random() * 50 + 50;
        ctx.rect(x, cy - 50 - h, 30, h);
    }
    ctx.fill();

    // 河流
    ctx.fillStyle = '#4682b4';
    ctx.fillRect(0, cy - 50, width, 50);

    // 2. 战车主体 (立方体)
    const cartW = 160;
    const cartH = 140;
    const cartX = cx - cartW/2;
    const cartY = cy;

    ctx.fillStyle = '#8b8b83'; // 石质
    ctx.fillRect(cartX, cartY, cartW, cartH);
    // 战车纹理
    setGoldStroke(ctx, width, height, 3);
    ctx.strokeRect(cartX, cartY, cartW, cartH);

    // 翅膀圆盘符号 (Winged Disk)
    ctx.save();
    ctx.translate(cx, cartY + 40);
    ctx.fillStyle = '#1e90ff'; // 蓝色翅膀
    ctx.beginPath();
    ctx.moveTo(-40, -10); ctx.quadraticCurveTo(-20, -20, 0, 0);
    ctx.quadraticCurveTo(20, -20, 40, -10);
    ctx.lineTo(0, 20);
    ctx.fill();
    ctx.fillStyle = '#ffd700'; // 太阳圆盘
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // 3. 星空顶棚
    ctx.save();
    ctx.fillStyle = '#000080'; // 深蓝布料
    ctx.beginPath();
    ctx.moveTo(cartX, cartY);
    ctx.lineTo(cartX, cartY - 100); // 左柱
    ctx.lineTo(cartX + cartW, cartY - 100); // 右柱
    ctx.lineTo(cartX + cartW, cartY);
    ctx.lineTo(cartX, cartY);
    // 顶棚弧线
    ctx.moveTo(cartX, cartY - 100);
    ctx.quadraticCurveTo(cx, cartY - 140, cartX + cartW, cartY - 100);
    ctx.fill();

    // 星星装饰
    ctx.fillStyle = '#fff';
    for(let i=0; i<15; i++) {
        const sx = cx + (Math.random()-0.5) * cartW;
        const sy = cartY - 120 + (Math.random()-0.5) * 30;
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // 4. 战车御者
    const drawDriver = (c) => {
        c.moveTo(cx - 30, cartY);
        c.lineTo(cx - 30, cartY - 80); // 身体
        c.arc(cx, cartY - 100, 25, 0, Math.PI*2); // 头
        c.lineTo(cx + 30, cartY - 80);
        c.lineTo(cx + 30, cartY);
    };

    drawSilhouette(ctx, drawDriver, (c) => {
        // 盔甲
        c.fillStyle = '#708090';
        c.fillRect(0,0,width,height);
        // 肩上的月牙
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(cx - 35, cartY - 90, 8, 0, Math.PI*2); c.fill();
        c.beginPath(); c.arc(cx + 35, cartY - 90, 8, 0, Math.PI*2); c.fill();
        // 星冠
        c.strokeStyle = '#ffd700';
        c.beginPath(); c.moveTo(cx - 25, cartY - 120); c.lineTo(cx + 25, cartY - 120); c.stroke();
    });

    // 5. 斯芬克斯 (黑白双兽)
    const drawSphinx = (x, y, isBlack) => {
        ctx.save();
        ctx.translate(x, y);
        // 身体 (卧姿)
        ctx.fillStyle = isBlack ? '#111' : '#eee';
        ctx.beginPath();
        ctx.ellipse(0, 20, 30, 15, 0, 0, Math.PI*2);
        ctx.fill();
        // 头部 (人面)
        ctx.fillStyle = '#d2b48c'; // 肤色
        ctx.beginPath();
        ctx.arc(0, -10, 15, 0, Math.PI*2);
        ctx.fill();
        // 头巾 (法老风格)
        ctx.strokeStyle = isBlack ? '#333' : '#aaa';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-15, -10); ctx.quadraticCurveTo(0, -30, 15, -10);
        ctx.stroke();

        ctx.strokeStyle = isBlack ? '#fff' : '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-15, 35, 30, 2); // 爪子线
        ctx.restore();
    };

    drawSphinx(cx - 50, height - 120, true); // 黑
    drawSphinx(cx + 50, height - 120, false); // 白

    // 6. 标签
    ctx.fillStyle = '#000';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE CHARIOT", cx, height - 60);
    ctx.fillText("VII - Willpower", cx, height - 35);
}