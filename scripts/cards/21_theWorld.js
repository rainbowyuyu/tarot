import { setGoldStroke, drawSilhouette, noise } from '../cardUtils.js';

export function drawTheWorld(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：宇宙蓝天
    const bgGrad = ctx.createRadialGradient(cx, cy, 100, cx, cy, 600);
    bgGrad.addColorStop(0, '#87ceeb'); // 天空蓝
    bgGrad.addColorStop(1, '#000080'); // 深蓝
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 巨大的月桂花环 (Ouroboros 结构)
    const rx = 140;
    const ry = 200;

    ctx.save();
    ctx.translate(cx, cy);

    // 绘制花环上的绿叶 (循环生成)
    const leaves = 60;
    for(let i=0; i<leaves; i++) {
        const angle = (i / leaves) * Math.PI * 2 + time * 0.1; // 缓慢旋转
        const x = Math.cos(angle) * rx;
        const y = Math.sin(angle) * ry;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI/2);

        // 随机绿叶色
        ctx.fillStyle = (i % 2 === 0) ? '#228b22' : '#32cd32';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 25, 0, 0, Math.PI*2);
        ctx.fill();

        // 红色绑带 (上下两端)
        if (Math.abs(y) > ry - 20) {
            ctx.fillStyle = '#f00';
            ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }
    ctx.restore();

    // 3. 中心的舞者 (世界女神)
    const drawDancer = (c) => {
        // 动态舞姿
        c.beginPath();
        c.arc(cx, cy - 60, 20, 0, Math.PI*2); // 头
        c.moveTo(cx, cy - 40);
        c.lineTo(cx - 10, cy + 20); // 躯干

        // 左腿 (直立)
        c.moveTo(cx - 10, cy + 20);
        c.lineTo(cx - 15, cy + 80);

        // 右腿 (交叉弯曲 - 数字4形状)
        c.moveTo(cx - 10, cy + 20);
        c.lineTo(cx + 20, cy + 40);
        c.lineTo(cx + 5, cy + 70);

        // 权杖 (双手)
        c.moveTo(cx - 30, cy - 20); // 左手
        c.lineTo(cx - 30, cy + 20); // 左棒
        c.moveTo(cx + 30, cy - 20); // 右手
        c.lineTo(cx + 30, cy + 20); // 右棒

        // 紫色纱巾 (螺旋缠绕)
        c.moveTo(cx - 40, cy - 50);
        c.bezierCurveTo(cx + 60, cy, cx - 60, cy + 50, cx + 40, cy + 100);
    };

    // 绘制女神 (半透明剪影或实体)
    ctx.save();
    ctx.strokeStyle = '#f0e6d2'; // 肤色线条
    ctx.lineWidth = 3;
    drawDancer(ctx);
    ctx.stroke();

    // 纱巾填充
    ctx.strokeStyle = 'rgba(128, 0, 128, 0.5)';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy - 50);
    ctx.bezierCurveTo(cx + 60, cy, cx - 60, cy + 50, cx + 40, cy + 100);
    ctx.stroke();
    ctx.restore();

    // 4. 四角元素 (神兽头像)
    const drawCornerHead = (x, y, type) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(type, 0, 0); // 暂用文字代替复杂头像
        ctx.restore();
    };

    drawCornerHead(50, 50, "Man");
    drawCornerHead(width - 50, 50, "Eagle");
    drawCornerHead(50, height - 100, "Bull");
    drawCornerHead(width - 50, height - 100, "Lion");

    // 5. 光耀粒子 (完成感)
    for(let i=0; i<30; i++) {
        const r = Math.random() * 200;
        const theta = Math.random() * Math.PI * 2 + time;
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(px, py, Math.random()*2, 0, Math.PI*2);
        ctx.fill();
    }

    // 6. 标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE WORLD", cx, height - 50);
    ctx.fillText("XXI - Completion", cx, height - 25);
}