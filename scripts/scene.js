// --- scene.js (Main Entry Point) ---

import { scene, camera, renderer, isMobile } from './scene/core.js';
import { initLighting, pointLight } from './scene/lighting.js';
import { initBackground } from './scene/background.js';
import { initDeck, deckGroup, cards } from './scene/deck.js';
import { initEffects, reticle, reticleOuter, reticleCore, starField } from './scene/effects.js';
import { getCardFrontMaterial, createCardCanvas } from './scene/materials.js';

// 初始化各个子系统
initBackground();
initLighting();
initEffects();
initDeck(); // 初始生成卡组

// 重新导出所有 main.js 需要的对象和函数
export {
    scene,
    camera,
    renderer,
    deckGroup,
    cards,
    reticle,
    reticleOuter,
    reticleCore,
    pointLight,
    starField,
    initDeck,
    getCardFrontMaterial,
    createCardCanvas
};