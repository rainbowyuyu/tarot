// 伪随机数生成器 (为了保证每次刷新图案一致)
export function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

// 简单的 2D 噪声 (用于生成自然的纹理：云、地形、长袍褶皱)
export function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

// 绘制高级金属边框/线条
export function setGoldStroke(ctx, width, height, lineWidth = 2) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#8B5A2B');   // 暗铜
    grad.addColorStop(0.25, '#FFECB3'); // 亮金
    grad.addColorStop(0.5, '#D4AF37');  // 纯金
    grad.addColorStop(0.75, '#FFECB3');
    grad.addColorStop(1, '#8B5A2B');
    ctx.strokeStyle = grad;
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
}

// 绘制发光的复杂星芒
export function drawComplexStar(ctx, cx, cy, r, points, time) {
    ctx.save();
    ctx.translate(cx, cy);
    // 动态旋转
    ctx.rotate(time * 0.2);

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 236, 179, 0.9)';
    for(let i=0; i<points * 2; i++) {
        const radius = (i % 2 === 0) ? r : r * 0.3;
        const angle = (Math.PI * i) / points;
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 20;
    ctx.fill();

    // 内部细节
    ctx.beginPath();
    ctx.rotate(time * -0.4); // 反向旋转内圈
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    for(let i=0; i<points; i++) {
        const angle = (Math.PI * 2 * i) / points;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * r * 0.8, Math.sin(angle) * r * 0.8);
    }
    ctx.stroke();
    ctx.restore();
}

// 绘制人物剪影容器 (核心技巧：在剪影内绘制宇宙)
export function drawSilhouette(ctx, drawPathFn, drawInsideFn) {
    ctx.save();
    ctx.beginPath();
    drawPathFn(ctx); // 绘制路径但不填充
    ctx.clip(); // 裁剪区域
    drawInsideFn(ctx); // 在内部绘制内容
    ctx.restore();

    // 描边轮廓
    ctx.save();
    ctx.beginPath();
    drawPathFn(ctx);
    setGoldStroke(ctx, 512, 1024, 3);
    ctx.stroke();
    ctx.restore();
}

// 生成动态背景雾气
export function drawDynamicFog(ctx, width, height, time, colorBase = '10, 20, 40') {
    for(let i=0; i<20; i++) {
        const x = (Math.sin(i + time * 0.5) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 1.5 + time * 0.3) * 0.5 + 0.5) * height;
        const r = 100 + Math.sin(time + i) * 50;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${colorBase}, 0.1)`);
        grad.addColorStop(1, `rgba(${colorBase}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
}