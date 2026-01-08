import { CONFIG, TAROT_DATA } from './globals.js';
import { drawArcanaSymbol } from './cardStyles.js';

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.012);

export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 14);
camera.lookAt(0, 0, 0);

// 检测移动端
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// 电脑端保持高画质，移动端限制为 2 倍或 1.5 倍以提升性能
renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- 光影系统 ---
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffeebb, 1.0);
mainLight.position.set(5, 12, 18);
mainLight.castShadow = true;
// 移动端降低阴影贴图大小
const shadowSize = isMobile ? 512 : 1024;
mainLight.shadow.mapSize.width = shadowSize;
mainLight.shadow.mapSize.height = shadowSize;
mainLight.shadow.bias = -0.0001;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x444488, 0.4);
fillLight.position.set(-8, 0, 10);
scene.add(fillLight);

const bottomLight = new THREE.DirectionalLight(0x884422, 0.3);
bottomLight.position.set(0, -10, 5);
bottomLight.target.position.set(0, 0, 0);
scene.add(bottomLight);
scene.add(bottomLight.target);

export const pointLight = new THREE.PointLight(0xaa00ff, 1.2, 8);
scene.add(pointLight);

// --- 辅助绘图函数 ---
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
}

// --- 卡背纹理生成 ---
function createCardBackTexture() {
    // 【关键修复】使用 512x1024 (2的幂次方) 解决微信/移动端纹理黑屏
    const width = 512;
    const height = 1024;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const goldColor = '#d4af37';
    const deepPurple = '#1a0b2e';

    ctx.fillStyle = deepPurple;
    ctx.fillRect(0, 0, width, height);

    // 移动端减少粒子数量
    const particleCount = isMobile ? 3000 : 8000;
    for (let i = 0; i < particleCount; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.04})`;
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillRect(x, y, 1.5, 1.5);
    }

    const cx = width / 2;
    const cy = height / 2;

    function drawStar(x, y, outerRadius, innerRadius, points) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / points;
        ctx.beginPath();
        ctx.moveTo(x, y - outerRadius);
        for (let i = 0; i < points; i++) {
            ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(x, y - outerRadius);
        ctx.closePath();
        ctx.stroke();
    }

    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 8;
    // 使用动态 height
    drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 25);
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 32, 32, width - 64, height - 64, 15);

    ctx.strokeStyle = `rgba(212, 175, 55, 0.3)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<36; i++) {
        const angle = (Math.PI * 2 / 36) * i;
        ctx.moveTo(cx + Math.cos(angle) * 100, cy + Math.sin(angle) * 100);
        ctx.lineTo(cx + Math.cos(angle) * 350, cy + Math.sin(angle) * 350);
    }
    ctx.stroke();

    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 3;
    drawStar(cx, cy, 180, 140, 12);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 12);
    ctx.translate(-cx, -cy);
    drawStar(cx, cy, 180, 140, 12);
    ctx.restore();

    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#2a1b3e';
    ctx.beginPath(); ctx.arc(cx, cy, 85, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = goldColor;
    ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI*2); ctx.fill();

    function drawCrescent(x, y, r, rot) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fillStyle = goldColor; ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(0, -r*0.25, r*0.9, 0, Math.PI*2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }
    // 调整位置适配新高度
    drawCrescent(cx, 150, 40, Math.PI/2);
    drawCrescent(cx, height - 150, 40, -Math.PI/2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    // 【关键修复】移动端开启高各向异性过滤会导致渲染错误，设为 1 最安全
    tex.anisotropy = isMobile ? 1 : renderer.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;
    return tex;
}

// --- 材质定义 ---
const proceduralBackTex = createCardBackTexture();

const cardBackMat = new THREE.MeshStandardMaterial({
    map: proceduralBackTex,
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.6,
});

const cardBodyMat = new THREE.MeshStandardMaterial({
    color: 0xccaa44,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x221100,
    emissiveIntensity: 0.2
});

const cardFrontBaseMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.5,
    metalness: 0.1
});

export const cards = [];
export const deckGroup = new THREE.Group();
scene.add(deckGroup);

// --- 卡面 Canvas 生成 (修复尺寸) ---
export function createCardCanvas(name) {
    // 【关键修复】同样使用 512x1024 尺寸
    const width = 512;
    const height = 1024;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = '#f5e6d3';
    ctx.fillRect(0, 0, width, height);

    // 噪点
    for(let i=0; i<1500; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.06})`;
        ctx.fillRect(Math.random()*width, Math.random()*height, 2, 2);
    }

    // 边框 (适配动态 height)
    ctx.strokeStyle = '#cba135';
    ctx.lineWidth = 18;
    drawRoundedRect(ctx, 15, 15, width - 30, height - 30, 20);
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, 30, 30, width - 60, height - 60, 10);

    // 内容框
    const contentHeight = height - 320;
    ctx.fillStyle = '#f0eadd';
    ctx.fillRect(50, 50, 412, contentHeight);
    ctx.strokeStyle = '#aa9977';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, 412, contentHeight);

    // 绘制图案 (居中)
    const id = TAROT_DATA.indexOf(name);
    if (id !== -1) {
        drawArcanaSymbol(ctx, 256, 50 + contentHeight/2, id);
    }

    // 文字 (调整到底部)
    ctx.fillStyle = '#111';
    ctx.font = 'bold 38px "Cinzel", serif';
    ctx.textAlign = 'center';

    const cleanName = name.split('(')[0].trim();
    const enName = name.split('(')[1]?.replace(')', '') || "";

    ctx.fillText(cleanName, 256, height - 200);

    ctx.font = 'italic 22px serif';
    ctx.fillStyle = '#555';
    ctx.fillText(enName, 256, height - 150);

    return canvas;
}

// 动态生成卡面材质
export function getCardFrontMaterial(name) {
    const canvas = createCardCanvas(name);
    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    // 移动端安全设置
    tex.anisotropy = isMobile ? 1 : renderer.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;

    return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.6,
        metalness: 0.1
    });
}

// --- 高级几何体生成 ---
const sharedGeometries = (function() {
    const width = CONFIG.cardWidth;
    const height = CONFIG.cardHeight;
    const radius = 0.15;
    const thickness = 0.04;

    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;

    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    const extrudeSettings = { steps: 1, depth: thickness, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
    const coreGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    coreGeo.center();

    const faceGeo = new THREE.ShapeGeometry(shape);
    faceGeo.center();

    const posAttribute = faceGeo.attributes.position;
    const uvAttribute = faceGeo.attributes.uv;
    for (let i = 0; i < posAttribute.count; i++) {
        const x = posAttribute.getX(i);
        const y = posAttribute.getY(i);
        // UV 映射适配 (宽不变，高自适应)
        const u = (x + width / 2) / width;
        const v = (y + height / 2) / height;
        uvAttribute.setXY(i, u, v);
    }
    faceGeo.attributes.uv.needsUpdate = true;

    return { coreGeo, faceGeo, thickness, bevelThickness: 0.02 };
})();

export function initDeck() {
    while(deckGroup.children.length > 0){
        deckGroup.remove(deckGroup.children[0]);
    }
    cards.length = 0;

    for (let i = 0; i < CONFIG.cardCount; i++) {
        const group = new THREE.Group();

        const coreMesh = new THREE.Mesh(sharedGeometries.coreGeo, cardBodyMat.clone());
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);

        const zOffset = (sharedGeometries.thickness / 2) + sharedGeometries.bevelThickness + 0.001;

        const backMesh = new THREE.Mesh(sharedGeometries.faceGeo, cardBackMat);
        backMesh.position.z = zOffset;
        backMesh.receiveShadow = true;
        group.add(backMesh);

        const frontMesh = new THREE.Mesh(sharedGeometries.faceGeo, cardFrontBaseMat);
        frontMesh.position.z = -zOffset;
        frontMesh.rotation.y = Math.PI;
        frontMesh.receiveShadow = true;
        group.add(frontMesh);

        const angleStep = 0.20;
        const angle = (i - CONFIG.cardCount/2) * angleStep;
        const radius = CONFIG.deckRadius;

        group.position.set(
            Math.sin(angle) * radius,
            Math.cos(angle * 2) * 0.5 - 0.5,
            Math.cos(angle) * radius - radius
        );

        group.rotation.y = -angle;
        group.rotation.z = (Math.random() - 0.5) * 0.02;

        group.userData = {
            id: i,
            name: TAROT_DATA[i],
            baseAngle: -angle,
            originalPos: group.position.clone(),
            originalRot: group.rotation.clone(),
            isHovered: false,
            isCardGroup: true
        };

        deckGroup.add(group);
        cards.push(group);
    }
}
initDeck();

// --- 准星 Group ---
export const reticle = new THREE.Group();
scene.add(reticle);

const ringGeo = new THREE.RingGeometry(0.12, 0.15, 32);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
export const reticleOuter = new THREE.Mesh(ringGeo, ringMat);
reticle.add(reticleOuter);

const coreGeo = new THREE.CircleGeometry(0.10, 32);
const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
export const reticleCore = new THREE.Mesh(coreGeo, coreMat);
reticleCore.scale.set(0, 0, 0);
reticle.add(reticleCore);

const starGeo = new THREE.BufferGeometry();
const starCount = isMobile ? 500 : 1000; // 移动端减少粒子
const posArray = new Float32Array(starCount * 3);
for(let i=0; i<starCount*3; i++) {
    posArray[i] = (Math.random() - 0.5) * 60;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starMat = new THREE.PointsMaterial({size: 0.08, color: 0xcc99ff, transparent: true, opacity: 0.6});
export const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});