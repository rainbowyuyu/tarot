import { scene, renderer } from './core.js';

// 存储需要更新动画的对象
const animatedObjects = [];

/**
 * 1. 生成烟雾/星云纹理 (Procedural Nebula Texture)
 * 使用 Canvas 生成，避免加载外部图片
 */
function createNebulaTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 绘制柔和的云雾
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)'); // 中心亮
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // 边缘透明

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
}

/**
 * 2. 生成星星纹理
 */
function createStarTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // 添加十字星芒
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(size/2 - 1, size/4, 2, size/2);
    ctx.fillRect(size/4, size/2 - 1, size/2, 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
}

/**
 * 3. 创建动态背景系统
 */
export function initBackground() {
    // A. 深空背景球 (Deep Space Sphere) - 提供底色
    const sphereGeo = new THREE.SphereGeometry(80, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
        color: 0x050011, // 极深的紫黑色
        side: THREE.BackSide // 渲染内部
    });
    const bgSphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(bgSphere);

    // B. 动态星云层 (Dynamic Nebula Cloud)
    const nebulaGroup = new THREE.Group();
    const nebulaTex = createNebulaTexture();
    const cloudCount = 15; // 云雾数量

    // 参考图配色：深紫、洋红、金色
    const colors = [0x4a00e0, 0x8e2de2, 0x1a0b2e, 0xffaa00];

    for (let i = 0; i < cloudCount; i++) {
        const cloudGeo = new THREE.PlaneGeometry(40, 40);
        const cloudMat = new THREE.MeshBasicMaterial({
            map: nebulaTex,
            transparent: true,
            opacity: Math.random() * 0.15 + 0.05, // 低透明度
            depthWrite: false, // 不遮挡后方物体
            blending: THREE.AdditiveBlending, // 【关键】发光叠加模式
            color: colors[Math.floor(Math.random() * colors.length)],
            side: THREE.DoubleSide
        });

        const cloud = new THREE.Mesh(cloudGeo, cloudMat);

        // 随机分布
        cloud.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 30 - 20 // 稍微靠后
        );
        cloud.rotation.z = Math.random() * Math.PI * 2;
        cloud.scale.setScalar(Math.random() * 0.5 + 0.8);

        // 动画数据
        cloud.userData = {
            rotSpeed: (Math.random() - 0.5) * 0.002,
            floatSpeed: (Math.random() - 0.5) * 0.005,
            initialY: cloud.position.y
        };

        nebulaGroup.add(cloud);
        animatedObjects.push(cloud);
    }
    scene.add(nebulaGroup);

    // C. 悬浮星尘 (Golden Dust Particles)
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 600;
    const posArray = new Float32Array(particleCount * 3);
    const sizeArray = new Float32Array(particleCount);

    for(let i = 0; i < particleCount; i++) {
        posArray[i * 3] = (Math.random() - 0.5) * 80;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 80;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10;
        sizeArray[i] = Math.random() * 0.5 + 0.1;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1)); // 如果ShaderMaterial支持size

    // 使用 PointsMaterial 简单渲染
    const particleMat = new THREE.PointsMaterial({
        size: 0.3,
        map: createStarTexture(),
        transparent: true,
        opacity: 0.8,
        color: 0xffddaa, // 金色
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const starSystem = new THREE.Points(particlesGeo, particleMat);
    scene.add(starSystem);

    // 动画循环注入
    // 这里的 trick 是我们自己在 background.js 内部启动一个微型更新逻辑
    // 或者更优雅的方式：覆盖 scene.userData.updateBackground 方法供 main.js 调用

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        const delta = 0.016; // 约 60fps

        // 1. 星云旋转与浮动
        nebulaGroup.rotation.z += 0.0005; // 整体极慢旋转
        animatedObjects.forEach(cloud => {
            cloud.rotation.z += cloud.userData.rotSpeed;
            cloud.position.y = cloud.userData.initialY + Math.sin(time * 0.5 + cloud.id) * 2;
        });

        // 2. 星星闪烁 (通过轻微缩放模拟)
        if (Math.random() > 0.95) {
            particleMat.size = 0.3 + Math.random() * 0.1;
        }

        // 3. 整体缓慢移动
        starSystem.rotation.y = -time * 0.02;
    }

    animate();
}