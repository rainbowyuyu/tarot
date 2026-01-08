import { scene, isMobile } from './core.js';

export const reticle = new THREE.Group();
export const reticleOuter = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.15, 32),
    new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
);
export const reticleCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.10, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
);

// 粒子星场
const starGeo = new THREE.BufferGeometry();
const starCount = isMobile ? 500 : 1000;
const posArray = new Float32Array(starCount * 3);
for(let i=0; i<starCount*3; i++) {
    posArray[i] = (Math.random() - 0.5) * 60;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
export const starField = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({size: 0.08, color: 0xcc99ff, transparent: true, opacity: 0.6})
);

export function initEffects() {
    reticle.add(reticleOuter);
    reticleCore.scale.set(0, 0, 0);
    reticle.add(reticleCore);
    scene.add(reticle);
    scene.add(starField);
}