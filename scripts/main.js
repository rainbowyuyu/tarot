import { CONFIG, STATE } from './globals.js';
import { ui } from './ui.js';
import { scene, camera, renderer, deckGroup, cards, reticle, pointLight, starField, initDeck, getCardFrontMaterial } from './scene.js';
import { fetchInterpretation } from './api.js';

const raycaster = new THREE.Raycaster();

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

function confirmSelection(card) {
    if (STATE.selectedCards.length >= 3) return;
    if (STATE.selectedCards.find(c => c.mesh === card)) return;

    STATE.cooldown = CONFIG.cooldownTime;
    STATE.isPinching = false;
    STATE.pinchStartTime = 0;

    const isReversed = Math.random() > 0.5;
    const cardInfo = {
        mesh: card,
        name: card.userData.name,
        orientation: isReversed ? "逆位" : "正位"
    };
    STATE.selectedCards.push(cardInfo);

    const worldPos = new THREE.Vector3();
    card.getWorldPosition(worldPos);
    const worldRot = new THREE.Quaternion();
    card.getWorldQuaternion(worldRot);

    deckGroup.remove(card);
    scene.add(card);

    card.position.copy(worldPos);
    card.quaternion.copy(worldRot);
    const euler = new THREE.Euler().setFromQuaternion(worldRot);
    card.rotation.copy(euler);

    // 底部等待位置
    const slotIndex = STATE.selectedCards.length - 1;
    const targetX = (slotIndex - 1) * 3.0;
    const targetY = -2.5;
    const targetZ = 9;

    card.material[4].emissive.setHex(0xffaa00);

    animateMove(card,
        {x: targetX, y: targetY, z: targetZ},
        {x: 0, y: 0, z: 0},
        {x: 0.8, y: 0.8, z: 0.8},
        600
    );

    setTimeout(() => { card.material[4].emissive.setHex(0x111111); }, 300);

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
            c.mesh.material[5] = newMaterial;
            c.mesh.material[5].needsUpdate = true;

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
    fetchInterpretation();
}

function resetGame() {
    STATE.phase = 'intro';
    STATE.selectedCards.forEach(c => {
        scene.remove(c.mesh);
        if(c.mesh.material[5].map) c.mesh.material[5].map.dispose();
        if(c.mesh.material[5]) c.mesh.material[5].dispose();
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

function updatePhysics() {
    const time = Date.now() * 0.001;
    starField.rotation.y = time * 0.02;

    if (STATE.cooldown > 0) {
        STATE.cooldown -= 16;
    }

    // --- 核心优化：旋转与水平并存的选牌逻辑 ---
    if (STATE.phase === 'selecting') {
        // 牌堆的水平平移 (基于手势 X)
        const targetDeckPosX = -STATE.handPos.x * 75;
        deckGroup.position.x += (targetDeckPosX - deckGroup.position.x) * 0.08;

        // 牌堆的绕Y轴旋转 (基于手势 X)
        const targetDeckRotY = -STATE.handPos.x * 2.0;
        deckGroup.rotation.y += (targetDeckRotY - deckGroup.rotation.y) * 0.08;

        // 垂直方向轻微跟随 (基于手势 Y)
        const targetDeckPosY = -STATE.handPos.y * 3;
        deckGroup.position.y += (targetDeckPosY - deckGroup.position.y) * 0.1;

        // 牌堆的轻微 Z 轴倾斜，增加立体感
        deckGroup.rotation.z += (STATE.handPos.x * 0.1 - deckGroup.rotation.z) * 0.05;
    }

    // 准星逻辑
    const vector = new THREE.Vector3(STATE.handPos.x * 2.2, STATE.handPos.y * 2.2, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const targetPos = camera.position.clone().add(dir.multiplyScalar(10));
    reticle.position.lerp(targetPos, 0.3);

    pointLight.position.copy(reticle.position);
    pointLight.position.z += 1;

    // 射线检测
    raycaster.setFromCamera({ x: STATE.handPos.x * 2, y: STATE.handPos.y * 2 }, camera);
    const intersects = raycaster.intersectObjects(deckGroup.children);

    let hoveredCard = null;
    if (intersects.length > 0 && STATE.phase === 'selecting' && STATE.cooldown <= 0) {
        hoveredCard = intersects[0].object;
    }

    // --- 角度计算核心 ---
    // 1. 绝对正对屏幕的角度：完全抵消 deckGroup 的旋转
    const absoluteFaceCameraRot = -deckGroup.rotation.y;

    deckGroup.children.forEach(c => {
        const isCurrentlyHovered = (c === hoveredCard);

        if (isCurrentlyHovered) {
            // [高亮状态]
            // 颜色变亮
            c.material[4].emissive.setHex(0x5544aa);
            c.material[4].emissiveIntensity = 0.8;

            // 位置前突
            const hoverZ = c.userData.originalPos.z + 2.0;
            c.position.z = THREE.MathUtils.lerp(c.position.z, hoverZ, 0.2);
            c.scale.setScalar(1.2);

            // 【关键】选中卡牌：严格使用 absoluteFaceCameraRot
            // 无论牌堆怎么转，这张牌就像贴在屏幕玻璃上一样正对玩家
            c.rotation.y = THREE.MathUtils.lerp(c.rotation.y, absoluteFaceCameraRot, 0.2);

            // 处理捏合逻辑
            if (STATE.isPinching) {
                if (STATE.pinchStartTime === 0) STATE.pinchStartTime = Date.now();
                const elapsed = (Date.now() - STATE.pinchStartTime) / 1000;
                const progress = Math.min(elapsed / CONFIG.selectionThreshold, 1.0);

                ui.progCont.style.display = 'block';
                ui.progress.style.width = `${progress * 100}%`;

                c.position.x = c.userData.originalPos.x + (Math.random()-0.5) * 0.05;

                if (progress >= 1.0) confirmSelection(c);
            } else {
                STATE.pinchStartTime = 0;
                ui.progCont.style.display = 'none';
                ui.progress.style.width = '0%';
            }

        } else {
            // [非高亮状态]
            c.material[4].emissive.setHex(0x110022);
            c.material[4].emissiveIntensity = 0.2;

            const floatY = Math.sin(time * 2 + c.userData.id) * 0.03;
            c.position.z += (c.userData.originalPos.z - c.position.z) * 0.1;
            c.position.y += (c.userData.originalPos.y + floatY - c.position.y) * 0.1;
            c.position.x += (c.userData.originalPos.x - c.position.x) * 0.1;
            c.scale.setScalar(1);

            // 【关键】背景卡牌：保留轻微弧度
            let targetRot;
            if (STATE.phase === 'selecting') {
                // (baseAngle * 0.15) 保留 15% 的原始扇形角度，制造微弱的弧形墙效果
                // - deckGroup.rotation.y 抵消整体旋转，确保卡背始终大体朝向观众
                targetRot = (c.userData.baseAngle * 0.15) - deckGroup.rotation.y;
            } else {
                // 非选牌阶段（如洗牌、展示），恢复原始扇形朝向
                targetRot = c.userData.baseAngle;
            }

            c.rotation.y += (targetRot - c.rotation.y) * 0.1;
        }
    });

    if (!hoveredCard) {
        STATE.pinchStartTime = 0;
        ui.progCont.style.display = 'none';
    }
}

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

const videoElement = document.getElementById('input_video');
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5});

hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        STATE.handDetected = true;

        const landmarks = results.multiHandLandmarks[0];
        const x = (1 - landmarks[9].x) * 2 - 1;
        const y = -(landmarks[9].y * 2 - 1);
        STATE.handPos.x += (x - STATE.handPos.x) * 0.2;
        STATE.handPos.y += (y - STATE.handPos.y) * 0.2;

        const dist = Math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y);
        STATE.isPinching = dist < CONFIG.pinchDist;

        let isResetGesture = false;
        if (STATE.phase === 'result') {
            for (const handLandmarks of results.multiHandLandmarks) {
                if (isHandFist(handLandmarks)) {
                    isResetGesture = true;
                    break;
                }
            }
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

        if (STATE.phase === 'intro') {
            STATE.phase = 'selecting';
            ui.guide.innerHTML = `<h2>命运之选</h2><p>移动手掌浏览，捏合选择</p>`;
        }
    } else {
        STATE.handDetected = false;
        STATE.fistHoldStart = 0;
    }
});

const cameraUtils = new Camera(videoElement, {
  onFrame: async () => { await hands.send({image: videoElement}); },
  width: 640, height: 480
});

ui.startBtn.addEventListener('click', () => {
    ui.loader.style.display = 'none';
    cameraUtils.start();
});

window.onload = () => {
    setTimeout(() => {
        ui.spinner.style.display = 'none';
        ui.loaderText.innerText = "系统就绪";
        ui.startBtn.style.display = 'block';
    }, 1000);
};

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    renderer.render(scene, camera);
}
animate();