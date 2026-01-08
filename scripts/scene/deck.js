// --- START OF FILE scene/deck.js ---

import { scene } from './core.js';
import { CONFIG, TAROT_DATA } from '../globals.js';
// 假设 sharedGeometries 不存在或有问题，这里直接使用标准几何体以确保代码独立运行
// 如果你有 geometry.js，可以保留原导入，但下面的 Geometry 创建需对应修改
import { cardBackMat, cardBodyMat, cardFrontBaseMat } from './materials.js';

export const deckGroup = new THREE.Group();
export const cards = [];

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
    const arr = [...array]; // 创建副本
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function initDeck() {
    scene.add(deckGroup);

    // 1. 清理旧卡牌
    while(deckGroup.children.length > 0){
        const child = deckGroup.children[0];
        deckGroup.remove(child);
        // 简单的内存清理建议
        if(child.geometry) child.geometry.dispose();
    }
    cards.length = 0;

    // 2. 打乱卡牌数据
    // 关键点：物理位置(i)不变，但赋予的身份(name)随机
    const shuffledDeck = shuffleArray(TAROT_DATA);
    const totalCards = shuffledDeck.length; // 应该是 22

    // 定义几何体 (复用以优化性能)
    const cardGeo = new THREE.BoxGeometry(2, 3.5, 0.05);
    const faceGeo = new THREE.PlaneGeometry(2, 3.5);

    for (let i = 0; i < totalCards; i++) {
        const group = new THREE.Group();

        // A. 卡身 (侧边)
        const coreMesh = new THREE.Mesh(cardGeo, cardBodyMat);
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);

        // B. 卡背 (Back) - 稍微突起防止闪烁
        const backMesh = new THREE.Mesh(faceGeo, cardBackMat);
        backMesh.position.z = 0.03;
        backMesh.receiveShadow = true;
        group.add(backMesh);

        // C. 卡面 (Front) - 初始面向内，材质为基础底色
        const frontMesh = new THREE.Mesh(faceGeo, cardFrontBaseMat);
        frontMesh.position.z = -0.03;
        frontMesh.rotation.y = Math.PI; // 背面朝向
        frontMesh.receiveShadow = true;
        group.add(frontMesh);

        // 排列逻辑
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