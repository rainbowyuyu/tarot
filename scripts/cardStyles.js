/**
 * 绘制 22 张大阿卡纳牌的核心符号 - 高级炼金术几何风格
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} centerX - 中心 X 坐标
 * @param {number} centerY - 中心 Y 坐标
 * @param {number} index - 卡牌 ID (0-21)
 */
export function drawArcanaSymbol(ctx, centerX, centerY, index) {
    // --- 调色板 ---
    const C = {
        INK: '#1a1a1a',        // 主线条：深炭黑
        GOLD: '#c5a059',       // 神性/光芒：古董金
        CRIMSON: '#8a0303',    // 激情/血液：深红
        BLUE: '#2c3e50',       // 水/天空：灰蓝
        BG_SHADE: 'rgba(197, 160, 89, 0.1)' // 背景装饰淡淡的金
    };

    // --- 基础设置 ---
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // --- 高级绘图辅助函数 ---

    // 绘制光芒/光晕
    const drawRays = (x, y, radius, count, length, color = C.GOLD) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const startX = x + Math.cos(angle) * radius;
            const startY = y + Math.sin(angle) * radius;
            const endX = x + Math.cos(angle) * (radius + length);
            const endY = y + Math.sin(angle) * (radius + length);
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
        }
        ctx.stroke();
        ctx.restore();
    };

    // 绘制实心/空心圆
    const circle = (x, y, r, color = C.INK, fill = false, lineWidth = 4) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
    };

    // 绘制月亮 (Crescent)
    const moon = (x, y, r, rotation, color = C.GOLD) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(r * 0.3, 0, r * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    };

    // 绘制多角星
    const star = (x, y, r, points, color = C.GOLD, fill = false) => {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.moveTo(0, 0 - r);
        for (let i = 0; i < points; i++) {
            ctx.rotate(Math.PI / points);
            ctx.lineTo(0, 0 - (r * 0.4));
            ctx.rotate(Math.PI / points);
            ctx.lineTo(0, 0 - r);
        }
        ctx.closePath();
        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.restore();
    };

    // --- 绘制逻辑 ---
    switch (index) {
        case 0: // 愚者 (The Fool) - 悬崖边的自由灵魂
            // 太阳
            circle(centerX + 80, centerY - 100, 25, C.GOLD, false, 3);
            drawRays(centerX + 80, centerY - 100, 30, 12, 15);
            // 悬崖 (几何化)
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(centerX - 100, centerY - 20);
            ctx.lineTo(centerX + 20, centerY - 20); // 平台
            ctx.lineTo(centerX + 60, centerY + 120); // 陡坡
            ctx.lineTo(centerX - 100, centerY + 120);
            ctx.stroke();
            // 人物简影 (迈步)
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 20);
            ctx.lineTo(centerX + 30, centerY - 80); // 身体
            ctx.stroke();
            circle(centerX + 30, centerY - 95, 12, C.INK, true); // 头
            // 包裹
            ctx.strokeStyle = C.CRIMSON;
            ctx.beginPath();
            ctx.moveTo(centerX + 30, centerY - 80);
            ctx.lineTo(centerX + 60, centerY - 90);
            ctx.stroke();
            circle(centerX + 65, centerY - 92, 8, C.CRIMSON, true);
            break;

        case 1: // 魔术师 (The Magician) - 掌握四元素
            // 无限符号
            ctx.font = '100px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = C.GOLD;
            ctx.fillText('∞', centerX, centerY - 90);
            // 桌子
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 4;
            ctx.strokeRect(centerX - 90, centerY + 30, 180, 10);
            // 权杖 (上指)
            ctx.beginPath(); ctx.moveTo(centerX, centerY - 60); ctx.lineTo(centerX, centerY + 10); ctx.stroke();
            // 四元素
            circle(centerX - 60, centerY + 10, 12, C.GOLD, false, 3); // 币
            ctx.strokeStyle = C.BLUE; ctx.strokeRect(centerX - 25, centerY - 5, 20, 25); // 杯
            ctx.strokeStyle = C.INK; ctx.beginPath(); ctx.moveTo(centerX + 20, centerY + 20); ctx.lineTo(centerX + 20, centerY - 10); ctx.stroke(); // 剑
            ctx.strokeStyle = C.CRIMSON; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(centerX + 60, centerY + 20); ctx.lineTo(centerX + 60, centerY - 5); ctx.stroke(); // 杖
            break;

        case 2: // 女祭司 (The High Priestess) - 智慧与直觉
            // 新月冠
            moon(centerX, centerY - 80, 30, -Math.PI / 2, C.GOLD);
            circle(centerX, centerY - 80, 12, C.INK, true);
            // TORA 卷轴
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 3;
            ctx.fillStyle = '#fff';
            ctx.fillRect(centerX - 50, centerY - 20, 100, 120);
            ctx.strokeRect(centerX - 50, centerY - 20, 100, 120);
            ctx.fillStyle = C.INK;
            ctx.font = 'bold 24px serif';
            ctx.fillText('TORA', centerX, centerY + 40);
            // 帷幕 (B & J)
            ctx.fillStyle = C.INK;
            ctx.font = 'bold 40px serif';
            ctx.fillText('B', centerX - 80, centerY + 40);
            ctx.fillText('J', centerX + 80, centerY + 40);
            break;

        case 3: // 皇后 (The Empress) - 丰饶与爱
            // 金星符号
            ctx.strokeStyle = C.GOLD;
            ctx.lineWidth = 6;
            circle(centerX, centerY - 30, 45, C.GOLD, false, 6);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 15); ctx.lineTo(centerX, centerY + 90);
            ctx.moveTo(centerX - 30, centerY + 60); ctx.lineTo(centerX + 30, centerY + 60);
            ctx.stroke();
            // 麦穗装饰
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 2;
            for (let i = -2; i <= 2; i++) {
                if (i === 0) continue;
                ctx.beginPath();
                ctx.moveTo(centerX + i * 40, centerY + 80);
                ctx.quadraticCurveTo(centerX + i * 50, centerY + 40, centerX + i * 60, centerY);
                ctx.stroke();
            }
            break;

        case 4: // 皇帝 (The Emperor) - 秩序与权力
            // 立方体王座 (几何感)
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 5;
            ctx.strokeRect(centerX - 70, centerY - 40, 140, 120);
            // 权杖 (十字球)
            ctx.strokeStyle = C.CRIMSON;
            circle(centerX, centerY - 20, 30, C.CRIMSON, false, 4);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 50); ctx.lineTo(centerX, centerY - 80);
            ctx.moveTo(centerX - 15, centerY - 65); ctx.lineTo(centerX + 15, centerY - 65);
            ctx.stroke();
            break;

        case 5: // 教皇 (The Hierophant) - 传统与信仰
            // 三重十字权杖
            ctx.strokeStyle = C.GOLD;
            ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(centerX, centerY - 100); ctx.lineTo(centerX, centerY + 100); ctx.stroke();
            ctx.lineWidth = 4;
            // 上横
            ctx.beginPath(); ctx.moveTo(centerX - 20, centerY - 70); ctx.lineTo(centerX + 20, centerY - 70); ctx.stroke();
            // 中横
            ctx.beginPath(); ctx.moveTo(centerX - 35, centerY - 45); ctx.lineTo(centerX + 35, centerY - 45); ctx.stroke();
            // 下横
            ctx.beginPath(); ctx.moveTo(centerX - 50, centerY - 20); ctx.lineTo(centerX + 50, centerY - 20); ctx.stroke();
            // 交叉钥匙
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 2;
            ctx.save();
            ctx.translate(centerX, centerY + 80);
            ctx.rotate(Math.PI / 4);
            ctx.strokeRect(-40, -5, 80, 10);
            ctx.rotate(-Math.PI / 2);
            ctx.strokeRect(-40, -5, 80, 10);
            ctx.restore();
            break;

        case 6: // 恋人 (The Lovers) - 结合与选择
            // 巨大的太阳
            drawRays(centerX, centerY - 90, 40, 16, 20, C.GOLD);
            circle(centerX, centerY - 90, 35, C.GOLD, false, 3);
            // 结合的心形
            ctx.fillStyle = C.CRIMSON;
            ctx.beginPath();
            const topY = centerY;
            ctx.moveTo(centerX, topY + 20);
            ctx.bezierCurveTo(centerX, topY, centerX - 50, topY - 40, centerX - 50, topY + 20);
            ctx.bezierCurveTo(centerX - 50, topY + 60, centerX, topY + 100, centerX, topY + 120);
            ctx.bezierCurveTo(centerX, topY + 100, centerX + 50, topY + 60, centerX + 50, topY + 20);
            ctx.bezierCurveTo(centerX + 50, topY - 40, centerX, topY, centerX, topY + 20);
            ctx.fill();
            break;

        case 7: // 战车 (The Chariot) - 意志与胜利
            // 战车轮廓
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 5;
            ctx.strokeRect(centerX - 60, centerY - 40, 120, 80);
            // 轮子
            circle(centerX - 60, centerY + 40, 30, C.INK, false, 4);
            circle(centerX + 60, centerY + 40, 30, C.INK, false, 4);
            // 翅膀与圆盘
            ctx.strokeStyle = C.GOLD;
            circle(centerX, centerY - 40, 15, C.GOLD, false, 3);
            ctx.beginPath();
            ctx.moveTo(centerX - 15, centerY - 40);
            ctx.quadraticCurveTo(centerX - 60, centerY - 60, centerX - 90, centerY - 40);
            ctx.moveTo(centerX + 15, centerY - 40);
            ctx.quadraticCurveTo(centerX + 60, centerY - 60, centerX + 90, centerY - 40);
            ctx.stroke();
            break;

        case 8: // 力量 (Strength) - 勇气与包容
            // 无限符号
            ctx.font = '100px serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = C.GOLD;
            ctx.fillText('∞', centerX, centerY - 80);
            // 狮子线条
            ctx.strokeStyle = C.CRIMSON;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY + 30, 50, Math.PI, 0); // 狮头
            ctx.stroke();
            // 抚摸的手
            ctx.strokeStyle = C.INK;
            ctx.beginPath();
            ctx.moveTo(centerX - 40, centerY);
            ctx.quadraticCurveTo(centerX, centerY + 20, centerX + 40, centerY);
            ctx.stroke();
            break;

        case 9: // 隐士 (The Hermit) - 内省与指引
            // 提灯
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 40);
            ctx.lineTo(centerX - 30, centerY + 20);
            ctx.lineTo(centerX + 30, centerY + 20);
            ctx.closePath();
            ctx.stroke();
            // 六芒星光芒
            star(centerX, centerY - 5, 12, 6, C.GOLD, true);
            drawRays(centerX, centerY - 5, 20, 12, 60, C.GOLD);
            break;

        case 10: // 命运之轮 (Wheel of Fortune) - 循环
            // 外轮
            circle(centerX, centerY, 80, C.INK, false, 6);
            // 内轮
            circle(centerX, centerY, 25, C.GOLD, false, 3);
            // 辐条
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 3;
            for (let i = 0; i < 8; i++) {
                const ang = i * (Math.PI / 4);
                ctx.beginPath();
                ctx.moveTo(centerX + Math.cos(ang) * 25, centerY + Math.sin(ang) * 25);
                ctx.lineTo(centerX + Math.cos(ang) * 80, centerY + Math.sin(ang) * 80);
                ctx.stroke();
            }
            // 字母 T A R O
            ctx.fillStyle = C.GOLD;
            ctx.font = 'bold 20px serif';
            ctx.fillText('T', centerX, centerY - 60);
            ctx.fillText('A', centerX + 60, centerY);
            ctx.fillText('R', centerX, centerY + 60);
            ctx.fillText('O', centerX - 60, centerY);
            break;

        case 11: // 正义 (Justice) - 平衡与真相
            // 剑 (竖直)
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(centerX, centerY + 100); ctx.lineTo(centerX, centerY - 100); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(centerX - 20, centerY - 80); ctx.lineTo(centerX + 20, centerY - 80); ctx.stroke();
            // 天平
            ctx.strokeStyle = C.GOLD;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(centerX - 80, centerY - 40); ctx.lineTo(centerX + 80, centerY - 40); ctx.stroke();
            // 盘
            const scaleY = centerY - 40;
            ctx.beginPath(); ctx.moveTo(centerX - 80, scaleY); ctx.lineTo(centerX - 80, scaleY + 50); ctx.stroke();
            circle(centerX - 80, scaleY + 50, 15, C.GOLD);
            ctx.beginPath(); ctx.moveTo(centerX + 80, scaleY); ctx.lineTo(centerX + 80, scaleY + 50); ctx.stroke();
            circle(centerX + 80, scaleY + 50, 15, C.GOLD);
            break;

        case 12: // 倒吊人 (The Hanged Man) - 牺牲与新视角
            // T型架
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(centerX - 60, centerY - 100); ctx.lineTo(centerX + 60, centerY - 100); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(centerX, centerY - 100); ctx.lineTo(centerX, centerY + 40); ctx.stroke();
            // 倒吊姿态 (P型腿)
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 40);
            ctx.lineTo(centerX, centerY + 80); // 头
            ctx.moveTo(centerX, centerY + 40);
            ctx.lineTo(centerX - 30, centerY); // 弯腿
            ctx.stroke();
            // 智慧光环
            drawRays(centerX, centerY + 80, 20, 12, 10, C.GOLD);
            break;

        case 13: // 死神 (Death) - 结束与重生
            // 镰刀
            ctx.strokeStyle = '#555'; // 钢色
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(centerX - 40, centerY, 80, 0.5 * Math.PI, 1.8 * Math.PI);
            ctx.stroke();
            // 刀柄
            ctx.strokeStyle = C.INK;
            ctx.beginPath(); ctx.moveTo(centerX - 40, centerY + 80); ctx.lineTo(centerX + 60, centerY - 60); ctx.stroke();
            // 枯骨/白玫瑰
            circle(centerX + 40, centerY + 60, 20, '#fff', true);
            circle(centerX + 40, centerY + 60, 20, C.INK, false, 2);
            break;

        case 14: // 节制 (Temperance) - 融合与流动
            // 圣杯
            ctx.strokeStyle = C.GOLD;
            ctx.lineWidth = 3;
            ctx.strokeRect(centerX - 60, centerY + 20, 30, 40);
            ctx.strokeRect(centerX + 30, centerY - 60, 30, 40);
            // 水流 (贝塞尔曲线)
            ctx.strokeStyle = C.BLUE;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centerX + 45, centerY - 20);
            ctx.bezierCurveTo(centerX + 45, centerY + 10, centerX - 45, centerY - 10, centerX - 45, centerY + 20);
            ctx.stroke();
            // 额头印记
            ctx.strokeStyle = C.GOLD;
            circle(centerX, centerY - 100, 10, C.GOLD, true);
            break;

        case 15: // 恶魔 (The Devil) - 束缚与物质
            // 倒五芒星
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 5;
            circle(centerX, centerY - 20, 70, C.INK, false, 2);
            ctx.save();
            ctx.translate(centerX, centerY - 20);
            ctx.rotate(Math.PI); // 倒置
            star(0, 0, 70, 5, C.INK, false);
            ctx.restore();
            // 锁链
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 3;
            ctx.strokeRect(centerX - 60, centerY + 80, 120, 15);
            break;

        case 16: // 高塔 (The Tower) - 突变与启示
            // 塔身
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 5;
            ctx.strokeRect(centerX - 40, centerY - 40, 80, 140);
            // 闪电
            ctx.strokeStyle = C.GOLD;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(centerX + 80, centerY - 120);
            ctx.lineTo(centerX + 20, centerY - 70);
            ctx.lineTo(centerX + 50, centerY - 40);
            ctx.lineTo(centerX - 70, centerY + 20);
            ctx.stroke();
            // 坠落的王冠
            circle(centerX - 50, centerY - 60, 15, C.GOLD, false, 3);
            // 火焰
            drawRays(centerX, centerY - 40, 50, 8, 10, C.CRIMSON);
            break;

        case 17: // 星星 (The Star) - 希望与灵感
            // 八芒星 (主星)
            star(centerX, centerY - 60, 40, 8, C.GOLD, true);
            // 小星星
            star(centerX - 60, centerY - 90, 10, 5, C.GOLD, true);
            star(centerX + 60, centerY - 90, 10, 5, C.GOLD, true);
            star(centerX - 70, centerY - 30, 10, 5, C.GOLD, true);
            star(centerX + 70, centerY - 30, 10, 5, C.GOLD, true);
            // 水流
            ctx.strokeStyle = C.BLUE;
            ctx.lineWidth = 3;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(centerX - 30 + i * 20, centerY + 20);
                ctx.quadraticCurveTo(centerX - 50 + i * 20, centerY + 60, centerX - 30 + i * 20, centerY + 100);
                ctx.stroke();
            }
            break;

        case 18: // 月亮 (The Moon) - 幻象与潜意识
            // 月亮脸
            moon(centerX, centerY - 70, 50, 0, C.GOLD);
            // 闭眼
            ctx.strokeStyle = C.INK;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(centerX - 10, centerY - 70, 10, 0, Math.PI); ctx.stroke();
            // 滴落的露珠
            for (let i = -1; i <= 1; i++) {
                circle(centerX + i * 30, centerY, 5, C.GOLD, true);
            }
            // 双塔
            ctx.fillStyle = '#333';
            ctx.fillRect(centerX - 80, centerY + 30, 30, 70);
            ctx.fillRect(centerX + 50, centerY + 30, 30, 70);
            break;

        case 19: // 太阳 (The Sun) - 成功与活力
            // 大太阳
            circle(centerX, centerY - 50, 45, C.GOLD, true);
            // 复杂的直/曲光芒
            ctx.strokeStyle = C.GOLD;
            ctx.lineWidth = 2;
            for (let i = 0; i < 16; i++) {
                const angle = (Math.PI * 2 / 16) * i;
                const startR = 50;
                const endR = 90;
                ctx.beginPath();
                if (i % 2 === 0) {
                    // 直线
                    ctx.moveTo(centerX + Math.cos(angle) * startR, centerY - 50 + Math.sin(angle) * startR);
                    ctx.lineTo(centerX + Math.cos(angle) * endR, centerY - 50 + Math.sin(angle) * endR);
                } else {
                    // 曲线
                    const mx = centerX + Math.cos(angle) * (startR + 20) + Math.cos(angle + 0.5) * 10;
                    const my = centerY - 50 + Math.sin(angle) * (startR + 20) + Math.sin(angle + 0.5) * 10;
                    ctx.moveTo(centerX + Math.cos(angle) * startR, centerY - 50 + Math.sin(angle) * startR);
                    ctx.quadraticCurveTo(mx, my, centerX + Math.cos(angle) * endR, centerY - 50 + Math.sin(angle) * endR);
                }
                ctx.stroke();
            }
            // 墙
            ctx.strokeStyle = C.CRIMSON;
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(centerX - 90, centerY + 60); ctx.lineTo(centerX + 90, centerY + 60); ctx.stroke();
            break;

        case 20: // 审判 (Judgement) - 觉醒
            // 天使号角
            ctx.strokeStyle = C.GOLD;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centerX + 60, centerY - 100);
            ctx.lineTo(centerX - 20, centerY - 40); // 管身
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(centerX - 20, centerY - 40, 15, 8, Math.PI / 4, 0, Math.PI * 2); // 喇叭口
            ctx.stroke();
            // 云层
            ctx.strokeStyle = '#aaa';
            ctx.beginPath(); ctx.arc(centerX + 60, centerY - 100, 20, 0, Math.PI * 2); ctx.stroke();
            // 棺材
            ctx.strokeStyle = C.INK;
            ctx.strokeRect(centerX - 40, centerY + 40, 80, 50);
            // 人形
            ctx.fillStyle = C.INK;
            circle(centerX, centerY + 20, 15, C.INK, true); // 头
            ctx.fillRect(centerX - 15, centerY + 35, 30, 20); // 身
            break;

        case 21: // 世界 (The World) - 达成与圆满
            // 桂冠花环 (椭圆)
            ctx.strokeStyle = '#27ae60'; // 绿色
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 80, 110, 0, 0, Math.PI * 2);
            ctx.stroke();
            // 上下束带
            ctx.strokeStyle = C.CRIMSON;
            ctx.lineWidth = 4;
            // 上X
            ctx.beginPath(); ctx.moveTo(centerX - 10, centerY - 110); ctx.lineTo(centerX + 10, centerY - 110); ctx.stroke();
            // 下X
            ctx.beginPath(); ctx.moveTo(centerX - 10, centerY + 110); ctx.lineTo(centerX + 10, centerY + 110); ctx.stroke();
            // 四角元素 (简笔)
            circle(centerX - 100, centerY - 130, 10, C.INK, false, 2); // 人
            circle(centerX + 100, centerY - 130, 10, C.INK, false, 2); // 鹰
            circle(centerX - 100, centerY + 130, 10, C.INK, false, 2); // 牛
            circle(centerX + 100, centerY + 130, 10, C.INK, false, 2); // 狮
            break;
    }

    ctx.restore();
}