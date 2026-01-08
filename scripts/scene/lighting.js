// --- START OF FILE scene/lighting.js ---

import { scene, isMobile } from './core.js'; // 修正导入路径

export const pointLight = new THREE.PointLight(0xffaa00, 1.5, 10);

export function initLighting() {
    // 1. 半球光 (HemisphereLight) - 模拟自然的天空/地面环境光
    // 天空色 (深蓝紫) vs 地面色 (深棕)
    const hemiLight = new THREE.HemisphereLight(0x443366, 0x110500, 0.6);
    scene.add(hemiLight);

    // 2. 主光源 (Directional) - 模拟月光/神秘光源
    const mainLight = new THREE.DirectionalLight(0xffeebb, 1.2);
    mainLight.position.set(5, 12, 18);
    mainLight.castShadow = true;

    // 优化阴影
    const shadowSize = isMobile ? 1024 : 2048; // 提升分辨率
    mainLight.shadow.mapSize.width = shadowSize;
    mainLight.shadow.mapSize.height = shadowSize;
    mainLight.shadow.bias = -0.0001;
    mainLight.shadow.normalBias = 0.02; // 减少阴影波纹
    scene.add(mainLight);

    // 3. 补光 (紫色侧光) - 增加魔法氛围
    const fillLight = new THREE.DirectionalLight(0xaa44ff, 0.5);
    fillLight.position.set(-8, 2, 5);
    scene.add(fillLight);

    // 4. 底部轮廓光 (冷色) - 勾勒卡牌边缘
    const bottomLight = new THREE.DirectionalLight(0x0088ff, 0.6);
    bottomLight.position.set(0, -10, 2);
    scene.add(bottomLight);

    // 5. 准星点光源 (交互光)
    pointLight.distance = 15;
    pointLight.decay = 2;
    scene.add(pointLight);
}