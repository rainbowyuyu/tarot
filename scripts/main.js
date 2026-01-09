// --- START OF FILE main.js ---

import { CONFIG, STATE, TAROT_DATA } from './globals.js';
import { ui } from './ui.js';
import { scene, camera, renderer, deckGroup, cards, reticle, reticleOuter, reticleCore, pointLight, starField, initDeck } from './scene.js';
import { fetchInterpretation } from './api.js';
import { updateCardMaterials, animateCardFace, getCardFrontMaterial, createCardCanvas, updateCanvasContent } from './scene/materials.js';

const raycaster = new THREE.Raycaster();

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

// 扩展 STATE
STATE.uiResultCanvases = [];

// 获取新增的 UI 元素
const pcResetHint = document.getElementById('pc-reset-hint');
const mobileResetBtn = document.getElementById('mobile-reset-btn');

// --- 动画函数 (保持不变) ---
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

// --- 确认选择逻辑 ---
function confirmSelection(cardGroup) {
    if (STATE.selectedCards.length >= 3) return;
    if (STATE.selectedCards.find(c => c.mesh === cardGroup)) return;

    // 触觉反馈
    if (navigator.vibrate) navigator.vibrate(50);

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

    const slotIndex = STATE.selectedCards.length - 1;
    // 手机端展示位置：稍微紧凑一点，位置稍微抬高以免被底部UI遮挡
    const spacing = isMobile ? 1.8 : 3.0;
    const targetX = (slotIndex - 1) * spacing;
    const targetY = isMobile ? -1.0 : -2.5;
    const targetZ = 9;

    cardGroup.children[0].material.emissive.setHex(0xffaa00);
    cardGroup.children[0].material.emissiveIntensity = 1.0;

    animateMove(cardGroup,
        {x: targetX, y: targetY, z: targetZ},
        {x: 0, y: 0, z: 0},
        {x: isMobile ? 0.6 : 0.8, y: isMobile ? 0.6 : 0.8, z: isMobile ? 0.6 : 0.8},
        600
    );

    setTimeout(() => {
        cardGroup.children[0].material.emissive.setHex(0x221100);
        cardGroup.children[0].material.emissiveIntensity = 0.2;
    }, 300);

    // 更新UI提示
    if (STATE.selectedCards.length === 3) {
        STATE.phase = 'revealing';
        ui.guide.innerHTML = `<h2>命运已定</h2><p>准备揭晓...</p>`;
        setTimeout(revealCards, 1500);
    } else {
        if(isMobile) {
            ui.guide.innerHTML = `<h2>已选 ${STATE.selectedCards.length}/3</h2><p>点击卡牌继续</p>`;
        } else {
            ui.guide.innerHTML = `<h2>已选 ${STATE.selectedCards.length}/3</h2><p>继续寻找共鸣</p>`;
        }
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

            const spacing = isMobile ? 2.2 : 3.5;
            const revealX = (index - 1) * spacing;
            const revealY = 0.5;
            const revealZ = 10;

            const targetRotY = Math.PI;
            const targetRotZ = c.orientation === "逆位" ? 0 : Math.PI;

            animateMove(c.mesh,
                {x: revealX, y: revealY, z: revealZ},
                {x: 0, y: targetRotY, z: targetRotZ},
                {x: isMobile ? 0.5 : 0.6, y: isMobile ? 0.5 : 0.6, z: isMobile ? 0.5 : 0.6},
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
    STATE.uiResultCanvases = [];

    // 根据设备显示不同的重置方式
    if (isMobile) {
        if(pcResetHint) pcResetHint.style.display = 'none';
        if(mobileResetBtn) {
            mobileResetBtn.style.display = 'block';
            mobileResetBtn.onclick = resetGame; // 绑定点击事件
        }
    } else {
        if(pcResetHint) pcResetHint.style.display = 'block';
        if(mobileResetBtn) mobileResetBtn.style.display = 'none';
    }

    STATE.selectedCards.forEach(c => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'ui-card-wrapper';

        const cardCanvas = createCardCanvas(c.name, 0);
        cardCanvas.className = 'ui-card-img';

        if (c.orientation === "逆位") {
            cardCanvas.style.transform = "rotate(180deg)";
        }

        STATE.uiResultCanvases.push({
            canvas: cardCanvas,
            ctx: cardCanvas.getContext('2d'),
            name: c.name
        });

        const label = document.createElement('div');
        label.className = 'ui-card-label';
        label.innerText = `${c.name} (${c.orientation})`;

        cardContainer.appendChild(cardCanvas);
        cardContainer.appendChild(label);
        ui.revealCont.appendChild(cardContainer);
    });

    // 核心AI功能保持不变
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
    STATE.uiResultCanvases = [];
    STATE.isPinching = false;
    STATE.fistHoldStart = 0;

    ui.result.style.opacity = 0;
    ui.result.style.pointerEvents = "none";
    ui.progCont.style.display = 'none';

    // 隐藏移动端按钮
    if(mobileResetBtn) mobileResetBtn.style.display = 'none';

    ui.guide.style.opacity = 1;
    if(isMobile) {
        ui.guide.innerHTML = `<h2>洗牌仪式</h2><p>滑动屏幕，扰动能量</p>`;
    } else {
        ui.guide.innerHTML = `<h2>洗牌仪式</h2><p>张开手掌，扰动能量</p>`;
    }

    initDeck();

    setTimeout(() => {
        STATE.phase = 'selecting';
        if(isMobile) {
            ui.guide.innerHTML = `<h2>命运之选</h2><p>左右滑动浏览，点击卡牌</p>`;
        } else {
            ui.guide.innerHTML = `<h2>命运之选</h2><p>移动手掌浏览，捏合选择</p>`;
        }
    }, 1500);
}

// --- 物理更新与交互循环 ---
function updatePhysics() {
    const time = Date.now() * 0.001;
    starField.rotation.y = time * 0.02;

    updateCardMaterials(time);

    if (STATE.cooldown > 0) STATE.cooldown -= 16;

    // --- 视差与移动逻辑 (Parallax) ---
    if (STATE.phase === 'selecting') {
         // 手机端稍微减弱一点视差力度，防止太晕
         const parallaxStrength = isMobile ? 0.05 : 0.08;
         // 手机端滑动范围小，需要放大系数来保证能看到所有牌
         const rangeX = isMobile ? 60 : 75;

         const targetDeckPosX = -STATE.handPos.x * rangeX;

         deckGroup.position.x += (targetDeckPosX - deckGroup.position.x) * parallaxStrength;
         deckGroup.rotation.y += (-STATE.handPos.x * (isMobile ? 0.8 : 2.0) - deckGroup.rotation.y) * parallaxStrength;

         const targetDeckPosY = -STATE.handPos.y * (isMobile ? 1.0 : 3);
         deckGroup.position.y += (targetDeckPosY - deckGroup.position.y) * 0.1;

         deckGroup.rotation.z += (STATE.handPos.x * 0.1 - deckGroup.rotation.z) * 0.05;
    }

    // --- PC端：手势准星逻辑 ---
    // 移动端：隐藏准星
    if (!isMobile) {
        if (!STATE.handDetected) {
            reticle.visible = false;
            pointLight.intensity = 0;
            return;
        } else {
            reticle.visible = true;
            pointLight.intensity = 1.2;
        }

        const sensitivityX = 2.5;
        const sensitivityY = 2.5;

        let ndcX = STATE.handPos.x * sensitivityX;
        let ndcY = STATE.handPos.y * sensitivityY;
        ndcX = Math.max(-0.98, Math.min(0.98, ndcX));
        ndcY = Math.max(-0.98, Math.min(0.98, ndcY));

        const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const targetPos = camera.position.clone().add(dir.multiplyScalar(10));
        reticle.position.lerp(targetPos, 0.4);

        pointLight.position.copy(reticle.position);
        pointLight.position.z += 1;

        // PC 射线检测 (实时 Hover)
        raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
    } else {
        // Mobile: 隐藏准星
        reticle.visible = false;
        pointLight.intensity = 0.5;
    }

    let hoveredCard = null;

    // 仅 PC 实时检测 Hover
    if (!isMobile && STATE.phase === 'selecting' && STATE.cooldown <= 0) {
        const intersects = raycaster.intersectObjects(deckGroup.children, true);
        if (intersects.length > 0) {
            const hitObj = intersects[0].object;
            if (hitObj.parent && hitObj.parent.userData.isCardGroup) {
                hoveredCard = hitObj.parent;
            }
        }
    }

    const absoluteFaceCameraRot = -deckGroup.rotation.y;
    let reticleScale = 1.0;
    let reticleCoreScale = 0.0;
    let reticleRotSpeed = 1.0;
    let reticleColor = 0xffaa00;

    deckGroup.children.forEach(c => {
        // PC端逻辑: Hover 变色 + 捏合进度
        if (!isMobile && c === hoveredCard) {
            const coreMesh = c.children[0];
            coreMesh.material.emissive.setHex(0x5544aa);
            coreMesh.material.emissiveIntensity = 0.8;

            const hoverZ = c.userData.originalPos.z + 2.0;
            c.position.z = THREE.MathUtils.lerp(c.position.z, hoverZ, 0.2);
            c.scale.setScalar(1.2);
            c.rotation.y = THREE.MathUtils.lerp(c.rotation.y, absoluteFaceCameraRot, 0.2);

            // 捏合逻辑 (仅 PC)
            if (STATE.isPinching) {
                if (STATE.pinchStartTime === 0) STATE.pinchStartTime = Date.now();
                const elapsed = (Date.now() - STATE.pinchStartTime) / 1000;
                const progress = Math.min(elapsed / CONFIG.selectionThreshold, 1.0);

                ui.progCont.style.display = 'block';
                ui.progress.style.width = `${progress * 100}%`;
                ui.progress.style.backgroundColor = '#ffffff';

                reticleScale = 1.0 - (progress * 0.4);
                reticleCoreScale = progress;
                reticleRotSpeed = 5.0 + (progress * 10.0);
                reticleColor = 0xffaa00;

                c.position.x = c.userData.originalPos.x + (Math.random()-0.5) * 0.05;

                if (progress >= 1.0) confirmSelection(c);
            } else {
                STATE.pinchStartTime = 0;
                ui.progCont.style.display = 'none';
                ui.progress.style.width = '0%';
                reticleScale = 1.3;
            }
        } else {
            // 普通状态
            const coreMesh = c.children[0];
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

    if (!isMobile) {
        if (!hoveredCard && !STATE.isResetting) {
            STATE.pinchStartTime = 0;
            ui.progCont.style.display = 'none';
            reticleScale = 1.0;
            reticleCoreScale = 0.0;
        }

        reticleOuter.scale.lerp(new THREE.Vector3(reticleScale, reticleScale, 1), 0.2);
        reticleCore.scale.lerp(new THREE.Vector3(reticleCoreScale, reticleCoreScale, 1), 0.2);
        reticleOuter.rotation.z -= time * 0.05 * reticleRotSpeed;

        if (reticleOuter.material.color.getHex() !== reticleColor) {
            reticleOuter.material.color.lerp(new THREE.Color(reticleColor), 0.1);
        } else {
            reticleOuter.material.color.setHex(0xffaa00);
        }
    }
}


// --- 握拳检测 (仅 PC 使用) ---
function isHandFist(landmarks) {
    const wrist = landmarks[0];
    const fingers = [
        { tip: 8, mcp: 5 },
        { tip: 12, mcp: 9 },
        { tip: 16, mcp: 13 },
        { tip: 20, mcp: 17 }
    ];
    let foldedCount = 0;
    fingers.forEach(f => {
        const tipDist = Math.hypot(landmarks[f.tip].x - wrist.x, landmarks[f.tip].y - wrist.y);
        const mcpDist = Math.hypot(landmarks[f.mcp].x - wrist.x, landmarks[f.mcp].y - wrist.y);
        if (tipDist < mcpDist) {
            foldedCount++;
        }
    });
    return foldedCount >= 3;
}

// --- 初始化系统 (区分 Mobile 和 Desktop) ---

const videoElement = document.getElementById('input_video');

// 定义移动端触摸交互
function initMobileInteraction() {
    console.log("初始化移动端触控交互...");

    // 1. 触摸滑动 -> 更新 Parallax (HandPos)
    document.addEventListener('touchmove', (e) => {
        if(e.touches.length > 0) {
            const touch = e.touches[0];
            // 将屏幕坐标映射到 -1 到 1
            const x = (touch.clientX / window.innerWidth) * 2 - 1;
            const y = -(touch.clientY / window.innerHeight) * 2 + 1;

            // 平滑更新
            STATE.handPos.x += (x - STATE.handPos.x) * 0.1;
            STATE.handPos.y += (y - STATE.handPos.y) * 0.1;
        }
    }, { passive: true });

    // 2. 点击 -> 射线检测选牌
    renderer.domElement.addEventListener('click', (e) => {
        if(STATE.phase !== 'selecting' || STATE.cooldown > 0) return;

        // 计算点击位置的 NDC
        const mouse = new THREE.Vector2();
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(deckGroup.children, true);

        if (intersects.length > 0) {
            const hitObj = intersects[0].object;
            if (hitObj.parent && hitObj.parent.userData.isCardGroup) {
                confirmSelection(hitObj.parent);
            }
        }
    });

    // 3. 标记系统状态
    STATE.handDetected = true; // 移动端始终视为"已检测到手"
    STATE.phase = 'selecting';
    ui.guide.innerHTML = `<h2>命运之选</h2><p>左右滑动浏览，点击卡牌</p>`;

    // 隐藏加载动画
    ui.loader.style.display = 'none';
    ui.startBtn.style.display = 'none';
}


// 定义桌面端 Camera + MediaPipe 初始化
function initDesktopCamera() {
    videoElement.setAttribute('autoplay', '');
    videoElement.setAttribute('muted', '');
    videoElement.setAttribute('playsinline', '');
    videoElement.style.opacity = 0;
    videoElement.style.position = 'absolute';
    videoElement.style.zIndex = -1;

    if (typeof Hands === 'undefined') {
        console.error("MediaPipe Hands library not loaded.");
        alert("系统错误：手势识别库未加载，请刷新页面。");
        return;
    }

    const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});

    hands.setOptions({
        maxNumHands: 1, // PC 端通常单手操作
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            STATE.handDetected = true;

            const landmarks = results.multiHandLandmarks[0];
            const x = (1 - landmarks[9].x) * 2 - 1;
            const y = -(landmarks[9].y * 2 - 1);

            const smoothFactor = 0.3;
            STATE.handPos.x += (x - STATE.handPos.x) * smoothFactor;
            STATE.handPos.y += (y - STATE.handPos.y) * smoothFactor;

            // 捏合检测
            const dist = Math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y);
            STATE.isPinching = dist < (CONFIG.pinchDist || 0.05);

            // 握拳重置逻辑
            let isResetGesture = false;
            if (STATE.phase === 'result') {
                if (isHandFist(landmarks)) {
                    isResetGesture = true;
                }
            }

            if (isResetGesture) {
                STATE.isResetting = true;
                if (!STATE.fistHoldStart) STATE.fistHoldStart = Date.now();
                const elapsed = Date.now() - STATE.fistHoldStart;
                const progress = Math.min(elapsed / 1500, 1.0);

                ui.progCont.style.display = 'block';
                ui.progress.style.backgroundColor = '#ff4444';
                ui.progress.style.width = `${progress * 100}%`;

                if (progress >= 1.0) {
                    resetGame();
                    STATE.fistHoldStart = 0;
                    STATE.isResetting = false;
                }
            } else {
                STATE.fistHoldStart = 0;
                STATE.isResetting = false;
                if (!STATE.isPinching) {
                    ui.progCont.style.display = 'none';
                    ui.progress.style.width = '0%';
                }
            }

            if (STATE.phase === 'intro') {
                STATE.phase = 'selecting';
                ui.guide.innerHTML = `<h2>命运之选</h2><p>移动手掌浏览，捏合选择</p>`;
            }
        } else {
            STATE.handDetected = false;
            STATE.isPinching = false;
            STATE.fistHoldStart = 0;
            STATE.isResetting = false;
            ui.progCont.style.display = 'none';
        }
    });

    const cameraUtils = new Camera(videoElement, {
        onFrame: async () => { await hands.send({image: videoElement}); },
        width: 1280,
        height: 720,
        facingMode: 'user'
    });

    cameraUtils.start().then(() => {
        console.log("Camera started");
    }).catch(err => {
        console.error("摄像头启动失败:", err);
        alert("无法访问摄像头，请检查权限。");
        ui.loader.style.display = 'flex';
        ui.startBtn.style.display = 'block';
    });
}


// --- 启动按钮逻辑 ---
ui.startBtn.addEventListener('click', () => {
    // 隐藏加载UI
    ui.loader.style.display = 'none';
    ui.startBtn.style.display = 'none';

    if (isMobile) {
        // 移动端：直接开始，不调用摄像头
        initMobileInteraction();
    } else {
        // PC端：HTTPS检查 + 摄像头启动
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            alert("安全警告：请在 HTTPS 环境下运行本应用，否则无法打开摄像头。");
            return;
        }
        initDesktopCamera();
    }
});


const initSystem = () => {
    ui.spinner.style.display = 'none';
    ui.loaderText.innerText = isMobile ? "点击开启命运" : "系统就绪";
    ui.startBtn.style.display = 'block';
    ui.startBtn.innerText = isMobile ? "进入仪式" : "开启仪式";

    // 针对移动端的 UI 调整
    if (isMobile) {
        const gestureHint = document.getElementById('gesture-hint');
        if(gestureHint) gestureHint.style.display = 'none';
    }

    if (ui.progCont) {
        ui.progCont.style.zIndex = "9999";
        ui.progCont.style.position = "absolute";
    }
};

if (document.readyState === 'complete') {
    initSystem();
} else {
    window.addEventListener('load', initSystem);
    setTimeout(initSystem, 3000);
}

// --- 核心动画循环 ---
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    updatePhysics();

    if (STATE.phase === 'result' || STATE.phase === 'revealing') {
        STATE.selectedCards.forEach(c => {
            if (c.mesh && c.mesh.children[2]) {
                const mat = c.mesh.children[2].material;
                animateCardFace(mat, time);
            }
        });
    }

    if (STATE.phase === 'result' && STATE.uiResultCanvases.length > 0) {
        STATE.uiResultCanvases.forEach(item => {
            updateCanvasContent(item.ctx, item.canvas.width, item.canvas.height, item.name, time);
        });
    }

    renderer.render(scene, camera);
}
animate();