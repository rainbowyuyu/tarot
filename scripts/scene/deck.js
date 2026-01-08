import { scene } from './core.js';
import { CONFIG, TAROT_DATA } from '../globals.js';
import { sharedGeometries } from './geometry.js';
import { cardBackMat, cardBodyMat, cardFrontBaseMat } from './materials.js';

export const deckGroup = new THREE.Group();
export const cards = [];

export function initDeck() {
    scene.add(deckGroup);

    // 清理旧卡牌
    while(deckGroup.children.length > 0){
        deckGroup.remove(deckGroup.children[0]);
    }
    cards.length = 0;

    for (let i = 0; i < CONFIG.cardCount; i++) {
        const group = new THREE.Group();

        // 卡身
        const coreMesh = new THREE.Mesh(sharedGeometries.coreGeo, cardBodyMat.clone());
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);

        const zOffset = (sharedGeometries.thickness / 2) + sharedGeometries.bevelThickness + 0.001;

        // 卡背
        const backMesh = new THREE.Mesh(sharedGeometries.faceGeo, cardBackMat);
        backMesh.position.z = zOffset;
        backMesh.receiveShadow = true;
        group.add(backMesh);

        // 卡面 (初始背面朝内)
        const frontMesh = new THREE.Mesh(sharedGeometries.faceGeo, cardFrontBaseMat);
        frontMesh.position.z = -zOffset;
        frontMesh.rotation.y = Math.PI;
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