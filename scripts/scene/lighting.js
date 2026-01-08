import { scene, isMobile } from './core.js';

export const pointLight = new THREE.PointLight(0xffaa00, 1.5, 10);

export function initLighting() {
    // 1. 环境光
    const ambientLight = new THREE.AmbientLight(0x221144, 0.4);
    scene.add(ambientLight);

    // 2. 主光源
    const mainLight = new THREE.DirectionalLight(0xffeebb, 0.8);
    mainLight.position.set(5, 12, 18);
    mainLight.castShadow = true;
    const shadowSize = isMobile ? 512 : 1024;
    mainLight.shadow.mapSize.width = shadowSize;
    mainLight.shadow.mapSize.height = shadowSize;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    // 3. 补光
    const fillLight = new THREE.DirectionalLight(0xaa44ff, 0.6);
    fillLight.position.set(-8, 2, 5);
    scene.add(fillLight);

    // 4. 底部轮廓光
    const bottomLight = new THREE.DirectionalLight(0x004488, 0.5);
    bottomLight.position.set(0, -10, 2);
    scene.add(bottomLight);

    // 5. 准星点光源
    scene.add(pointLight);
}