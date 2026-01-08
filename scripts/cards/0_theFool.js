import { setGoldStroke, drawComplexStar, drawSilhouette, drawDynamicFog, noise } from '../cardUtils.js';

export function drawTheFool(ctx, width, height, time) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. 背景：动态黎明天空
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#fccb90'); // 黎明金
    skyGrad.addColorStop(0.5, '#d57eeb'); // 紫霞
    skyGrad.addColorStop(1, '#e6dee9'); // 白昼
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 动态雾气
    drawDynamicFog(ctx, width, height, time, '255, 200, 100');

    // 2. 巨大的动态太阳 (右上角)
    drawComplexStar(ctx, width - 80, 150, 90, 12, time);

    // 3. 悬崖 (Procedural Cliff) - 使用噪声生成不规则地形
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 10) {
        // 复杂的悬崖边缘
        let yNoise = noise(x * 0.01, 0) * 50 + noise(x * 0.05, 0) * 20;
        // 悬崖走势：从左下稍微上升，然后在右侧急剧下降
        let slope = (x < cx) ? height - 200 - x * 0.2 : height - 300 + Math.pow((x - cx) * 0.08, 2);
        ctx.lineTo(x, slope + yNoise);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    // 悬崖填充：深色岩石质感
    const cliffGrad = ctx.createLinearGradient(0, height/2, 0, height);
    cliffGrad.addColorStop(0, '#2c3e50');
    cliffGrad.addColorStop(1, '#000000');
    ctx.fillStyle = cliffGrad;
    ctx.fill();

    // 悬崖边缘高光
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 4. 愚者人物 (动态剪影)
    // 定义人物路径
    const drawFigure = (c) => {
        c.moveTo(cx - 40, cy + 50); // 脚
        c.lineTo(cx - 20, cy - 80); // 身体
        c.lineTo(cx - 50, cy - 120); // 后仰的手
        c.lineTo(cx - 20, cy - 140); // 脖子
        c.arc(cx, cy - 160, 25, Math.PI, 3*Math.PI); // 头
        c.lineTo(cx + 30, cy - 140);
        c.lineTo(cx + 60, cy - 160 + Math.sin(time*5)*5); // 伸出的手 (动态)
        c.lineTo(cx + 40, cy - 80);
        c.lineTo(cx + 60, cy + 60); // 前脚
        c.lineTo(cx + 10, cy + 40); // 裆部
        c.closePath();
    };

    drawSilhouette(ctx, drawFigure, (c) => {
        // 内部填充：星空纹理，代表他源自宇宙的灵魂
        c.fillStyle = '#1a0b2e';
        c.fillRect(0, 0, width, height);
        // 内部星星
        for(let i=0; i<30; i++) {
            c.fillStyle = `rgba(255,255,255,${Math.random()})`;
            c.beginPath();
            c.arc(cx - 50 + Math.random()*100, cy - 200 + Math.random()*300, Math.random()*2, 0, Math.PI*2);
            c.fill();
        }
        // 内部流动线条 (能量)
        c.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        c.lineWidth = 1;
        for(let i=0; i<5; i++) {
            c.beginPath();
            c.moveTo(cx, cy);
            c.bezierCurveTo(cx - 50, cy - 100, cx + 50, cy - 100, cx, cy - 200);
            c.stroke();
        }
    });

    // 5. 随身包裹 (红色)
    ctx.beginPath();
    ctx.arc(cx + 60, cy - 150 + Math.sin(time*5)*5, 15, 0, Math.PI*2);
    ctx.fillStyle = '#8a0303';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // 6. 伴侣犬 (简化为跳跃的光影)
    ctx.save();
    ctx.translate(cx + 80, cy + 20);
    ctx.rotate(-0.5 + Math.sin(time * 10) * 0.1); // 摇尾巴/跳跃
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // 7. 文字标签
    ctx.fillStyle = '#111';
    ctx.font = 'bold 30px "Cinzel"';
    ctx.textAlign = 'center';
    ctx.fillText("THE FOOL", cx, height - 100);
    ctx.fillStyle = '#555';
    ctx.font = 'italic 18px serif';
    ctx.fillText("0 - The Beginning", cx, height - 70);
}