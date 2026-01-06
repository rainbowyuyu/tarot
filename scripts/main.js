import { CONFIG, STATE } from './globals.js';
import { ui } from './ui.js';
import { scene, camera, renderer, deckGroup, cards, reticle, pointLight, starField, initDeck, getCardFrontMaterial, createCardCanvas } from './scene.js';
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

function confirmSelection(cardGroup) {
    if (STATE.selectedCards.length >= 3) return;
    if (STATE.selectedCards.find(c => c.mesh === cardGroup)) return;

    STATE.cooldown = CONFIG.cooldownTime;
    STATE.isPinching = false;
    STATE.pinchStartTime = 0;

    const isReversed = Math.random() > 0.5;
    const cardInfo = {
        mesh: cardGroup,
        name: cardGroup.userData.name,
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

    // 底部等待位置
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
            const frontMesh = c.mesh.children[2];
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

// --- 核心修改：在结果面板显示卡牌预览图 ---
function showResultPanel() {
    ui.result.style.opacity = 1;
    ui.result.style.pointerEvents = "auto";
    ui.aiText.innerHTML = "正在连接星灵...";

    // 清空现有内容
    ui.revealCont.innerHTML = "";

    // 遍历选中的卡牌生成预览
    STATE.selectedCards.forEach(c => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'ui-card-wrapper';

        // 1. 生成 Canvas 图片
        const cardCanvas = createCardCanvas(c.name);
        const img = document.createElement('img');
        img.src = cardCanvas.toDataURL();
        img.className = 'ui-card-img';

        // 2. 如果是逆位，在 UI 上旋转图片
        if (c.orientation === "逆位") {
            img.style.transform = "rotate(180deg)";
        }

        // 3. 标签
        const label = document.createElement('div');
        label.className = 'ui-card-label';
        label.innerText = `${c.name.split('(')[0]} (${c.orientation})`;

        cardContainer.appendChild(img);
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

function updatePhysics() {
    const time = Date.now() * 0.001;
    starField.rotation.y = time * 0.02;

    if (STATE.cooldown > 0) {
        STATE.cooldown -= 16;
    }

    if (STATE.phase === 'selecting') {
        const targetDeckPosX = -STATE.handPos.x * 75;
        deckGroup.position.x += (targetDeckPosX - deckGroup.position.x) * 0.08;

        const targetDeckRotY = -STATE.handPos.x * 2.0;
        deckGroup.rotation.y += (targetDeckRotY - deckGroup.rotation.y) * 0.08;

        const targetDeckPosY = -STATE.handPos.y * 3;
        deckGroup.position.y += (targetDeckPosY - deckGroup.position.y) * 0.1;

        deckGroup.rotation.z += (STATE.handPos.x * 0.1 - deckGroup.rotation.z) * 0.05;
    }

    const sensitivity = 2.5;
    const ndcX = Math.max(-1, Math.min(1, STATE.handPos.x * sensitivity));
    const ndcY = Math.max(-1, Math.min(1, STATE.handPos.y * sensitivity));

    const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const targetPos = camera.position.clone().add(dir.multiplyScalar(10));
    reticle.position.lerp(targetPos, 0.4);

    pointLight.position.copy(reticle.position);
    pointLight.position.z += 1;

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
            coreMesh.material.emissive.setHex(0x221100);
            coreMesh.material.emissiveIntensity = 0.2;

            const floatY = Math.sin(time * 2 + c.userData.id) * 0.03;
            c.position.z += (c.userData.originalPos.z - c.position.z) * 0.1;
            c.position.y += (c.userData.originalPos.y + floatY - c.position.y) * 0.1;
            c.position.x += (c.userData.originalPos.x - c.position.x) * 0.1;

            const currentScale = c.scale.x;
            if (Math.abs(currentScale - 1) > 0.01) {
                 c.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }

            let targetRot = (c.userData.baseAngle * 0.15) - deckGroup.rotation.y;
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
// 优化：在移动端降低复杂度以提升性能
const isMobile = window.innerWidth < 768;
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: isMobile ? 0 : 1, // 0: Lite, 1: Full
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

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

// --- 核心修改：摄像头初始化支持移动端 ---
// 添加 facingMode: 'user' 强制使用前置摄像头
const cameraUtils = new Camera(videoElement, {
  onFrame: async () => { await hands.send({image: videoElement}); },
  width: isMobile ? 480 : 640,  // 移动端降低分辨率
  height: isMobile ? 640 : 480,
  facingMode: 'user' // 关键：指定前置摄像头
});

ui.startBtn.addEventListener('click', () => {
    ui.loader.style.display = 'none';
    cameraUtils.start().catch(err => {
        console.error("摄像头启动失败:", err);
        alert("无法访问摄像头，请确保已授权并在 HTTPS 环境下运行。");
    });
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