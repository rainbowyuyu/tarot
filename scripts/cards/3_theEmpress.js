import { setGoldStroke, drawSilhouette, drawDynamicFog, noise } from '../cardUtils.js';

export function drawTheEmpress(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：生机勃勃的森林与晨光
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#87ceeb'); // 天空蓝
    bgGrad.addColorStop(0.5, '#90ee90'); // 嫩绿
    bgGrad.addColorStop(1, '#228b22'); // 深林绿
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 动态光斑 (阳光透过树叶)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
    for(let i=0; i<20; i++) {
        const x = (Math.sin(i * 123 + time * 0.5) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 321 + time * 0.3) * 0.5 + 0.5) * (height/2);
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 30 + 10, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();

    // 2. 远处的瀑布 (动态线条)
    const waterfallX = width - 100;
    const waterfallY = 150;
    const waterfallH = 300;

    ctx.save();
    // 岩石基座
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(waterfallX - 40, waterfallY);
    ctx.lineTo(waterfallX + 40, waterfallY);
    ctx.lineTo(waterfallX + 60, waterfallY + waterfallH);
    ctx.lineTo(waterfallX - 60, waterfallY + waterfallH);
    ctx.fill();

    // 水流
    ctx.beginPath();
    ctx.rect(waterfallX - 30, waterfallY, 60, waterfallH);
    ctx.clip();

    ctx.strokeStyle = 'rgba(200, 240, 255, 0.8)';
    ctx.lineWidth = 2;
    for(let i=0; i<10; i++) {
        const offset = (time * 100 + i * 30) % waterfallH;
        ctx.beginPath();
        ctx.moveTo(waterfallX - 25 + i*5, waterfallY);
        // 加一点扰动模拟水花
        for(let y=0; y<waterfallH; y+=20) {
            ctx.lineTo(waterfallX - 25 + i*5 + Math.sin(y*0.1 + time)*2, waterfallY + y);
        }
        ctx.stroke();
    }
    ctx.restore();

    // 3. 摇曳的麦田 (前景)
    ctx.save();
    const wheatY = height - 150;
    for(let x = 0; x < width; x += 8) {
        // 使用噪声生成麦穗高度
        const h = noise(x * 0.05, 0) * 50 + 80;
        // 风的动态
        const wind = Math.sin(x * 0.02 + time * 2) * 10;

        // 麦杆
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.quadraticCurveTo(x + wind, height - h/2, x + wind * 2, height - h);

        const wheatColor = ctx.createLinearGradient(0, height, 0, height - h);
        wheatColor.addColorStop(0, '#daa520'); // 金色
        wheatColor.addColorStop(1, '#ffdf80'); // 亮黄
        ctx.strokeStyle = wheatColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 麦粒头
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.ellipse(x + wind * 2, height - h, 3, 6, wind * 0.05, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();

    // 4. 皇后人物 (丰满、坐姿)
    const drawFigure = (c) => {
        // 宽松的长袍
        c.moveTo(cx - 60, height - 100);
        c.quadraticCurveTo(cx - 80, cy + 50, cx - 40, cy); // 臀部/背部
        c.lineTo(cx - 30, cy - 60); // 肩
        c.arc(cx, cy - 80, 25, Math.PI, 3*Math.PI); // 头
        c.lineTo(cx + 30, cy - 60);
        c.quadraticCurveTo(cx + 60, cy, cx + 50, cy + 50); // 胸/腹
        c.lineTo(cx + 80, height - 100); // 腿/裙摆
        c.closePath();
    };

    drawSilhouette(ctx, drawFigure, (c) => {
        // 衣服上的石榴花纹 pattern
        c.fillStyle = '#fff0f5'; // 浅粉底色
        c.fillRect(0,0,width,height);

        c.fillStyle = '#c71585'; // 紫红图案
        for(let i=0; i<10; i++) {
            const rx = (i * 932) % width;
            const ry = (i * 321) % height;
            c.beginPath();
            c.arc(rx, ry, 5, 0, Math.PI*2);
            c.fill();
        }
    });

    // 5. 金星盾牌 (爱之符号)
    ctx.save();
    ctx.translate(cx + 60, height - 140);
    // 心形盾牌
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.bezierCurveTo(20, -10, 40, 20, 0, 50);
    ctx.bezierCurveTo(-40, 20, -20, -10, 0, 20);
    ctx.fillStyle = '#b8860b'; // 暗金
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // 金星符号 ♀
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 25, 8, 0, Math.PI*2);
    ctx.moveTo(0, 33); ctx.lineTo(0, 45);
    ctx.moveTo(-5, 39); ctx.lineTo(5, 39);
    ctx.stroke();
    ctx.restore();

    // 6. 十二星皇冠
    ctx.fillStyle = '#fff';
    for(let i=0; i<12; i++) {
        const ang = (i / 12) * Math.PI + Math.PI; // 半圆拱形
        const r = 40;
        const sx = cx + Math.cos(ang) * r;
        const sy = cy - 90 + Math.sin(ang) * r * 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI*2);
        ctx.fill();
    }

    // 7. 标签
    ctx.fillStyle = '#224';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE EMPRESS", cx, height - 60);
    ctx.fillStyle = '#557';
    ctx.font = 'italic 16px serif';
    ctx.fillText("III - Fertility & Nature", cx, height - 35);
}