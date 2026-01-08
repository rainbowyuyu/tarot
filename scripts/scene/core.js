// --- START OF FILE core.js ---

// 检测移动端 (通用工具)
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.012);

// --- 适配修复 1: 调整相机参数 ---
// 手机端视口窄，需要更宽的视角或更远的距离
export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

if (isMobile) {
    // 手机端：拉远距离，稍微抬高视角，防止卡牌出画
    camera.position.set(0, 2, 22);
} else {
    // 电脑端：保持原样
    camera.position.set(0, 1, 14);
}
camera.lookAt(0, 0, 0);

export const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance" // iOS 性能优化提示
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.getElementById('canvas-container').appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 窗口大小改变时重新适配相机位置
    if (window.innerWidth < window.innerHeight) { // 竖屏
         camera.position.set(0, 2, 22);
    } else {
         camera.position.set(0, 1, 14);
    }
    camera.lookAt(0, 0, 0);
});