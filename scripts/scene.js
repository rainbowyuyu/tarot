import { CONFIG, TAROT_DATA } from './globals.js';
import { drawArcanaSymbol } from './cardStyles.js'; // 确保文件名一致

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.012);

export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 14);
camera.lookAt(0, 0, 0);

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
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
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
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

// --- 通用绘图辅助 ---
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
    const width = 512;
    const height = 900;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const goldColor = '#d4af37';
    const deepPurple = '#1a0b2e';

    ctx.fillStyle = deepPurple;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 40000; i++) {
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
    drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 25);
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 32, 32, width - 64, height - 64, 15);

    ctx.strokeStyle = `rgba(212, 175, 55, 0.3)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<72; i++) {
        const angle = (Math.PI * 2 / 72) * i;
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
    drawCrescent(cx, 150, 40, Math.PI/2);
    drawCrescent(cx, height - 150, 40, -Math.PI/2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
}

// --- 材质定义 ---
const cardSideMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
const proceduralBackTex = createCardBackTexture();
const cardBackMat = new THREE.MeshStandardMaterial({
    map: proceduralBackTex,
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.7,
    emissive: 0x220033,
    emissiveIntensity: 0.3
});
const cardFrontBaseMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.1
});

export const cards = [];
export const deckGroup = new THREE.Group();
scene.add(deckGroup);

// --- 3. 动态生成卡面纹理 ---
export function getCardFrontMaterial(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    // 3.1 背景
    ctx.fillStyle = '#f5e6d3';
    ctx.fillRect(0, 0, 512, 900);
    // 纸张噪点
    for(let i=0; i<4000; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.06})`;
        ctx.fillRect(Math.random()*512, Math.random()*900, 2, 2);
    }

    // 3.2 边框
    ctx.strokeStyle = '#cba135';
    ctx.lineWidth = 18;
    drawRoundedRect(ctx, 15, 15, 482, 870, 20);
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, 30, 30, 452, 840, 10);

    // 3.3 图案区背景
    ctx.fillStyle = '#f0eadd';
    ctx.fillRect(50, 50, 412, 580);
    ctx.strokeStyle = '#aa9977';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, 412, 580);

    // 3.4 【核心修复】获取 ID
    // 之前用 parseInt 解析罗马数字会得到 NaN，导致 switch case 无法匹配
    // 现在直接在原始数组中查找索引，保证 100% 准确
    const id = TAROT_DATA.indexOf(name);

    if (id !== -1) {
        // 调用 cardStyles.js 中的绘制函数
        // 坐标 (256, 340) 是上方矩形框的中心点 (50 + 412/2, 50 + 580/2)
        drawArcanaSymbol(ctx, 256, 340, id);
    } else {
        console.warn("Card ID not found for:", name);
    }

    // 3.5 文字
    ctx.fillStyle = '#111';
    ctx.font = 'bold 38px "Cinzel", serif';
    ctx.textAlign = 'center';

    const cleanName = name.split('(')[0].trim();
    const enName = name.split('(')[1]?.replace(')', '') || "";

    ctx.fillText(cleanName, 256, 690);

    ctx.font = 'italic 22px serif';
    ctx.fillStyle = '#555';
    ctx.fillText(enName, 256, 740);

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.needsUpdate = true;

    return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.6,
        metalness: 0.1
    });
}

export function initDeck() {
    while(deckGroup.children.length > 0){
        deckGroup.remove(deckGroup.children[0]);
    }
    cards.length = 0;

    for (let i = 0; i < CONFIG.cardCount; i++) {
        const geometry = new THREE.BoxGeometry(CONFIG.cardWidth, CONFIG.cardHeight, 0.04);

        const materials = [
            cardSideMat, cardSideMat, cardSideMat, cardSideMat,
            cardBackMat, // +Z
            cardFrontBaseMat // -Z
        ];

        const mesh = new THREE.Mesh(geometry, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const angle = (i - CONFIG.cardCount/2) * 0.18;
        const radius = CONFIG.deckRadius;

        mesh.position.set(
            Math.sin(angle) * radius,
            Math.cos(angle * 2) * 0.5 - 0.5,
            Math.cos(angle) * radius - radius
        );

        mesh.rotation.y = -angle;
        mesh.rotation.z = (Math.random() - 0.5) * 0.05;

        mesh.userData = {
            id: i,
            name: TAROT_DATA[i],
            originalPos: mesh.position.clone(),
            originalRot: mesh.rotation.clone(),
            isHovered: false
        };

        deckGroup.add(mesh);
        cards.push(mesh);
    }
}
initDeck();

// 辅助图形
const reticleGeo = new THREE.RingGeometry(0.12, 0.16, 32);
const reticleMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
export const reticle = new THREE.Mesh(reticleGeo, reticleMat);
scene.add(reticle);

const starGeo = new THREE.BufferGeometry();
const starCount = 1500;
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