// --- START OF FILE scene/deck.js ---

import { scene } from './core.js';
import { CONFIG, TAROT_DATA } from '../globals.js';
import { cardBackMat, cardBodyMat, cardFrontBaseMat } from './materials.js';

export const deckGroup = new THREE.Group();
export const cards = [];

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function initDeck() {
    scene.add(deckGroup);

    // 清理旧卡牌
    while(deckGroup.children.length > 0){
        const child = deckGroup.children[0];
        deckGroup.remove(child);
        if(child.geometry) child.geometry.dispose();
    }
    cards.length = 0;

    // 2. 打乱卡牌数据 (Randomization happens here)
    const shuffledDeck = shuffleArray(TAROT_DATA);
    const totalCards = shuffledDeck.length;

    const cardGeo = new THREE.BoxGeometry(2, 3.5, 0.05);
    const faceGeo = new THREE.PlaneGeometry(2, 3.5);

    for (let i = 0; i < totalCards; i++) {
        const group = new THREE.Group();

        const coreMesh = new THREE.Mesh(cardGeo, cardBodyMat);
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);

        const backMesh = new THREE.Mesh(faceGeo, cardBackMat);
        backMesh.position.z = 0.03;
        backMesh.receiveShadow = true;
        group.add(backMesh);

        const frontMesh = new THREE.Mesh(faceGeo, cardFrontBaseMat);
        frontMesh.position.z = -0.03;
        frontMesh.rotation.y = Math.PI;
        frontMesh.receiveShadow = true;
        group.add(frontMesh);

        // 保持物理位置(Shape)不变，是根据 i 计算的螺旋
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
            name: shuffledDeck[i], // 这里将随机打乱后的名字赋给固定位置的卡
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