// --- START OF FILE main.js ---

import { CONFIG, STATE } from './globals.js';
import { ui } from './ui.js';
import { scene, camera, renderer, deckGroup, cards, reticle, reticleOuter, reticleCore, pointLight, starField, initDeck } from './scene.js';
import { fetchInterpretation } from './api.js';
// 确保路径正确指向 materials.js
import { updateCardMaterials, animateCardFace, getCardFrontMaterial, createCardCanvas, updateCanvasContent } from './scene/materials.js';

const raycaster = new THREE.Raycaster();

// --- 设备环境检测 ---
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

// 扩展 STATE，用于存储结果页的 Canvas 引用以便动画更新
STATE.uiResultCanvases = [];

// 动画函数
function animateMove(obj, pos, rot, scale = {x:1, y:1, z:1}, duration = 1000) {
    const startPos = obj.position.clone();
    const startRot = obj.rotation.clone();
    const startScale = obj.scale.clone();
    let t = 0;

    function loop() {
        t += 16 / duration;
        if (t > 1) t = 1;
        const ease = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        obj.position.lerpVectors(startPos, new THREE.Vector3(pos.x, pos.y, pos.z), ease);
        obj.rotation.x = startRot.x + (rot.x - startRot.x) * ease;
        obj.rotation.y = startRot.y + (rot.y - startRot.y) * ease;
        obj.rotation.z = startRot.z + (rot.z - startRot.z) * ease;
        obj.scale.set(
            startScale.x + (scale.x - startScale.x) * ease,
            startScale.y + (scale.y - startScale.y) * ease,
            startScale.z + (scale.z - startScale.z) * ease
        );

        if (t < 1) requestAnimationFrame(loop);
    }
    loop();
}

// --- 游戏逻辑 ---

function confirmSelection(cardGroup) {
    if (STATE.selectedCards.length >= 3) return;
    if (STATE.selectedCards.find(c => c.mesh === cardGroup)) return;

    STATE.cooldown = CONFIG.cooldownTime;
    STATE.isPinching = false;
    STATE.pinchStartTime = 0;

    const isReversed = Math.random() > 0.5;
    const cardInfo = {
        mesh: cardGroup,
        name: cardGroup.userData.name, // 这里获取的是 initDeck 洗牌后的随机名字
        orientation: isReversed ? "逆位" : "正位"
    };
    STATE.selectedCards.push(cardInfo);

    const worldPos = new THREE.Vector3();
    cardGroup.getWorldPosition(worldPos);
    const worldRot = new THREE.Quaternion();
    cardGroup.getWorldQuaternion(worldRot);

    deckGroup.remove(cardGroup);
    scene.add(cardGroup);

    cardGroup.position.copy(worldPos);
    cardGroup.quaternion.copy(worldRot);
    const euler = new THREE.Euler().setFromQuaternion(worldRot);
    cardGroup.rotation.copy(euler);

    const slotIndex = STATE.selectedCards.length - 1;
    const targetX = (slotIndex - 1) * 3.0;
    const targetY = -2.5;
    const targetZ = 9;

    cardGroup.children[0].material.emissive.setHex(0xffaa00);
    cardGroup.children[0].material.emissiveIntensity = 1.0;

    animateMove(cardGroup,
        {x: targetX, y: targetY, z: targetZ},
        {x: 0, y: 0, z: 0},
        {x: 0.8, y: 0.8, z: 0.8},
        600
    );

    setTimeout(() => {
        cardGroup.children[0].material.emissive.setHex(0x221100);
        cardGroup.children[0].material.emissiveIntensity = 0.2;
    }, 300);

    if (STATE.selectedCards.length === 3) {
        STATE.phase = 'revealing';
        ui.guide.innerHTML = `<h2>命运已定</h2><p>准备揭晓...</p>`;
        setTimeout(revealCards, 1500);
    } else {
        ui.guide.innerHTML = `<h2>已选 ${STATE.selectedCards.length}/3</h2><p>继续寻找共鸣</p>`;
    }
}

function revealCards() {
    STATE.phase = 'result';
    ui.guide.style.opacity = 0;

    STATE.selectedCards.forEach((c, index) => {
        setTimeout(() => {
            const newMaterial = getCardFrontMaterial(c.name);
            const frontMesh = c.mesh.children[2]; // 确保这里对应 deck.js 中的 frontMesh 索引
            frontMesh.material = newMaterial;
            frontMesh.material.needsUpdate = true;

            const revealX = (index - 1) * 3.5;
            const revealY = 0.5;
            const revealZ = 10;

            const targetRotY = Math.PI;
            const targetRotZ = c.orientation === "逆位" ? 0 : Math.PI;

            animateMove(c.mesh,
                {x: revealX, y: revealY, z: revealZ},
                {x: 0, y: targetRotY, z: targetRotZ},
                {x: 0.6, y: 0.6, z: 0.6},
                1200
            );

        }, index * 800);
    });

    setTimeout(showResultPanel, 3500);
}

function showResultPanel() {
    ui.result.style.opacity = 1;
    ui.result.style.pointerEvents = "auto";
    ui.aiText.innerHTML = "正在连接星灵...";
    ui.revealCont.innerHTML = "";
    STATE.uiResultCanvases = []; // 清空之前的记录

    STATE.selectedCards.forEach(c => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'ui-card-wrapper';

        // --- 核心修改：使用 Canvas 代替 Img ---
        // 1. 创建 Canvas
        const cardCanvas = createCardCanvas(c.name, 0);
        cardCanvas.className = 'ui-card-img'; // 复用之前的 CSS 类名以保持样式

        // 2. 处理逆位旋转
        if (c.orientation === "逆位") {
            cardCanvas.style.transform = "rotate(180deg)";
        }

        // 3. 将 Canvas 信息存入全局状态，以便在 animate 循环中更新
        STATE.uiResultCanvases.push({
            canvas: cardCanvas,
            ctx: cardCanvas.getContext('2d'),
            name: c.name
        });

        const label = document.createElement('div');
        label.className = 'ui-card-label';
        // 简化名字显示
        const simpleName = c.name.match(/\((.*?)\)/) ? c.name.match(/\((.*?)\)/)[1] : c.name;
        label.innerText = `${simpleName} (${c.orientation})`;

        cardContainer.appendChild(cardCanvas); // 直接插入 Canvas
        cardContainer.appendChild(label);
        ui.revealCont.appendChild(cardContainer);
    });

    fetchInterpretation();
}

function resetGame() {
    STATE.phase = 'intro';
    STATE.selectedCards.forEach(c => {
        scene.remove(c.mesh);
        if(c.mesh.children[2].material.map) c.mesh.children[2].material.map.dispose();
        if(c.mesh.children[2].material) c.mesh.children[2].material.dispose();
    });
    STATE.selectedCards = [];
    STATE.isPinching = false;

    ui.result.style.opacity = 0;
    ui.result.style.pointerEvents = "none";

    ui.guide.style.opacity = 1;
    ui.guide.innerHTML = `<h2>洗牌仪式</h2><p>张开手掌，扰动能量</p>`;

    initDeck();

    setTimeout(() => {
        STATE.phase = 'selecting';
        ui.guide.innerHTML = `<h2>命运之选</h2><p>捏合手指选择 3 张卡牌</p>`;
    }, 1500);
}

// --- 物理更新与交互循环 ---
function updatePhysics() {
    const time = Date.now() * 0.001;
    starField.rotation.y = time * 0.02;

    // 1. 更新卡背 Shader 动画
    updateCardMaterials(time);

    if (STATE.cooldown > 0) STATE.cooldown -= 16;

    // 2. 根据手势位置移动卡组 (视差效果)
    if (STATE.phase === 'selecting') {
        const targetDeckPosX = -STATE.handPos.x * 75;
        deckGroup.position.x += (targetDeckPosX - deckGroup.position.x) * 0.08;

        const targetDeckRotY = -STATE.handPos.x * 2.0;
        deckGroup.rotation.y += (targetDeckRotY - deckGroup.rotation.y) * 0.08;

        const targetDeckPosY = -STATE.handPos.y * 3;
        deckGroup.position.y += (targetDeckPosY - deckGroup.position.y) * 0.1;

        deckGroup.rotation.z += (STATE.handPos.x * 0.1 - deckGroup.rotation.z) * 0.05;
    }

    // 3. 准星控制
    // 如果没有检测到手，隐藏准星
    if (!STATE.handDetected) {
        reticle.visible = false;
        pointLight.intensity = 0; // 同时也关掉准星上的灯光
        return; // 停止后续交互检测
    } else {
        reticle.visible = true;
        pointLight.intensity = 1.2;
    }

    const sensitivity = isMobile ? 3.0 : 2.5;
    // 限制 NDC 坐标在 -1 到 1 之间
    const ndcX = Math.max(-1, Math.min(1, STATE.handPos.x * sensitivity));
    const ndcY = Math.max(-1, Math.min(1, STATE.handPos.y * sensitivity));

    const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const targetPos = camera.position.clone().add(dir.multiplyScalar(10));
    reticle.position.lerp(targetPos, 0.4);

    pointLight.position.copy(reticle.position);
    pointLight.position.z += 1;

    // 4. 射线检测
    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
    const intersects = raycaster.intersectObjects(deckGroup.children, true);

    let hoveredCard = null;
    if (intersects.length > 0 && STATE.phase === 'selecting' && STATE.cooldown <= 0) {
        const hitObj = intersects[0].object;
        if (hitObj.parent && hitObj.parent.userData.isCardGroup) {
            hoveredCard = hitObj.parent;
        }
    }

    const absoluteFaceCameraRot = -deckGroup.rotation.y;
    let reticleScale = 1.0;
    let reticleCoreScale = 0.0;
    let reticleRotSpeed = 1.0;
    let reticleColor = 0xffaa00;

    deckGroup.children.forEach(c => {
        const isCurrentlyHovered = (c === hoveredCard);
        const coreMesh = c.children[0];

        if (isCurrentlyHovered) {
            coreMesh.material.emissive.setHex(0x5544aa);
            coreMesh.material.emissiveIntensity = 0.8;

            const hoverZ = c.userData.originalPos.z + 2.0;
            c.position.z = THREE.MathUtils.lerp(c.position.z, hoverZ, 0.2);
            c.scale.setScalar(1.2);
            c.rotation.y = THREE.MathUtils.lerp(c.rotation.y, absoluteFaceCameraRot, 0.2);

            // 捏合逻辑
            if (STATE.isPinching) {
                if (STATE.pinchStartTime === 0) STATE.pinchStartTime = Date.now();
                const elapsed = (Date.now() - STATE.pinchStartTime) / 1000;
                const progress = Math.min(elapsed / CONFIG.selectionThreshold, 1.0);

                ui.progCont.style.display = 'block';
                ui.progress.style.width = `${progress * 100}%`;

                // 准星反馈
                reticleScale = 1.0 - (progress * 0.4);
                reticleCoreScale = progress;
                reticleRotSpeed = 5.0 + (progress * 10.0);
                reticleColor = 0x00ffff;

                // 卡牌抖动效果
                c.position.x = c.userData.originalPos.x + (Math.random()-0.5) * 0.05;

                if (progress >= 1.0) confirmSelection(c);
            } else {
                STATE.pinchStartTime = 0;
                ui.progCont.style.display = 'none';
                ui.progress.style.width = '0%';
                reticleScale = 1.3;
            }

        } else {
            // 未悬停状态恢复
            coreMesh.material.emissive.setHex(0x221100);
            coreMesh.material.emissiveIntensity = 0.2;

            const floatY = Math.sin(time * 2 + c.userData.id) * 0.03;
            c.position.z += (c.userData.originalPos.z - c.position.z) * 0.1;
            c.position.y += (c.userData.originalPos.y + floatY - c.position.y) * 0.1;
            c.position.x += (c.userData.originalPos.x - c.position.x) * 0.1;

            if (Math.abs(c.scale.x - 1) > 0.01) c.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);

            let targetRot = (c.userData.baseAngle * 0.15) - deckGroup.rotation.y;
            c.rotation.y += (targetRot - c.rotation.y) * 0.1;
        }
    });

    // 准星无悬停状态
    if (!hoveredCard) {
        STATE.pinchStartTime = 0;
        ui.progCont.style.display = 'none';
        reticleScale = 1.0;
        reticleCoreScale = 0.0;
    }

    // 更新准星视觉
    reticleOuter.scale.lerp(new THREE.Vector3(reticleScale, reticleScale, 1), 0.2);
    reticleCore.scale.lerp(new THREE.Vector3(reticleCoreScale, reticleCoreScale, 1), 0.2);
    reticleOuter.rotation.z -= time * 0.05 * reticleRotSpeed;

    if (reticleOuter.material.color.getHex() !== reticleColor) {
        reticleOuter.material.color.lerp(new THREE.Color(reticleColor), 0.1);
    } else {
        reticleOuter.material.color.setHex(0xffaa00);
    }
}

// 握拳检测 (用于重置游戏)
function isHandFist(landmarks) {
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20];
    let foldedCount = 0;
    tips.forEach(idx => {
        const dist = Math.hypot(landmarks[idx].x - wrist.x, landmarks[idx].y - wrist.y);
        if (dist < CONFIG.fistCompactness || landmarks[idx].y > landmarks[idx-2].y) foldedCount++;
    });
    return foldedCount >= 3;
}

// --- MediaPipe 初始化 ---

const videoElement = document.getElementById('input_video');
videoElement.setAttribute('playsinline', 'true');
videoElement.setAttribute('webkit-playsinline', 'true');
videoElement.setAttribute('muted', 'true');
// 隐藏视频元素，只用于识别
videoElement.style.opacity = 0;
videoElement.style.position = 'absolute';
videoElement.style.zIndex = -1;

// 确保 Hands 已加载 (来自 CDN)
if (typeof Hands === 'undefined') {
    console.error("MediaPipe Hands library not loaded. Check index.html imports.");
    alert("系统错误：手势识别库未加载，请刷新页面。");
}

const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});

hands.setOptions({
    maxNumHands: isMobile ? 1 : 2,
    modelComplexity: isMobile ? 0 : 1, // 0:Lite (快), 1:Full (准)
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        STATE.handDetected = true;

        const landmarks = results.multiHandLandmarks[0];
        // 坐标映射：MediaPipe x(0~1) -> NDC x(-1~1)
        // 注意：自拍模式下视频是镜像的，所以 x 需要翻转 (1 - x)
        const x = (1 - landmarks[9].x) * 2 - 1;
        const y = -(landmarks[9].y * 2 - 1);

        // 平滑移动
        STATE.handPos.x += (x - STATE.handPos.x) * 0.3; // 增加平滑系数，减少迟滞
        STATE.handPos.y += (y - STATE.handPos.y) * 0.3;

        // 捏合检测 (食指指尖 vs 拇指指尖)
        const dist = Math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y);
        // 根据实际测试，pinchDist 阈值通常在 0.05 左右
        STATE.isPinching = dist < (CONFIG.pinchDist || 0.05);

        // 重置手势 (仅在结果页生效)
        let isResetGesture = false;
        if (STATE.phase === 'result') {
            if (isHandFist(landmarks)) isResetGesture = true;
        }

        if (isResetGesture) {
            if (!STATE.fistHoldStart) STATE.fistHoldStart = Date.now();
            if (Date.now() - STATE.fistHoldStart > 1500) {
                resetGame();
                STATE.fistHoldStart = 0;
            }
        } else {
            STATE.fistHoldStart = 0;
        }

        // 状态流转
        if (STATE.phase === 'intro') {
            STATE.phase = 'selecting';
            ui.guide.innerHTML = `<h2>命运之选</h2><p>移动手掌浏览，捏合选择</p>`;
        }
    } else {
        STATE.handDetected = false;
        STATE.isPinching = false;
        STATE.fistHoldStart = 0;
    }
});

// Camera 初始化
const cameraUtils = new Camera(videoElement, {
  onFrame: async () => { await hands.send({image: videoElement}); },
  width: isMobile ? 480 : 1280,
  height: isMobile ? 640 : 720,
  facingMode: 'user'
});

ui.startBtn.addEventListener('click', () => {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        alert("安全警告：请在 HTTPS 环境下运行本应用，否则无法打开摄像头。");
        return;
    }

    ui.loader.style.display = 'none';
    ui.startBtn.style.display = 'none'; // 点击后隐藏按钮

    cameraUtils.start().then(() => {
        console.log("Camera started");
    }).catch(err => {
        console.error("摄像头启动失败:", err);
        // 降级尝试
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                const loop = async () => {
                    await hands.send({image: videoElement});
                    requestAnimationFrame(loop);
                };
                loop();
            })
            .catch(e => {
                alert(`无法访问摄像头，请检查权限设置。`);
                ui.loader.style.display = 'flex';
                ui.startBtn.style.display = 'block';
            });
    });
});

const initSystem = () => {
    ui.spinner.style.display = 'none';
    ui.loaderText.innerText = "系统就绪";
    ui.startBtn.style.display = 'block';
};

if (document.readyState === 'complete') {
    initSystem();
} else {
    window.addEventListener('load', initSystem);
    setTimeout(initSystem, 3000); // 超时强制显示
}

// --- 核心动画循环 ---
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    updatePhysics();

    // A. 更新 3D 场景中选中卡牌的材质动画 (特写/揭示阶段)
    if (STATE.phase === 'result' || STATE.phase === 'revealing') {
        STATE.selectedCards.forEach(c => {
            if (c.mesh && c.mesh.children[2]) {
                const mat = c.mesh.children[2].material;
                animateCardFace(mat, time);
            }
        });
    }

    // B. 更新 DOM 结果展示中的 Canvas 动画
    // 这是让右侧/结果面板中的卡片动起来的关键
    if (STATE.phase === 'result' && STATE.uiResultCanvases.length > 0) {
        STATE.uiResultCanvases.forEach(item => {
            updateCanvasContent(item.ctx, item.canvas.width, item.canvas.height, item.name, time);
        });
    }

    renderer.render(scene, camera);
}
animate();