import { CONFIG } from '../globals.js';

export const sharedGeometries = (function() {
    const width = CONFIG.cardWidth;
    const height = CONFIG.cardHeight;
    const radius = 0.15;
    const thickness = 0.04;

    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;

    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    const extrudeSettings = { steps: 1, depth: thickness, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
    const coreGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    coreGeo.center();

    const faceGeo = new THREE.ShapeGeometry(shape);
    faceGeo.center();

    const posAttribute = faceGeo.attributes.position;
    const uvAttribute = faceGeo.attributes.uv;
    for (let i = 0; i < posAttribute.count; i++) {
        const x = posAttribute.getX(i);
        const y = posAttribute.getY(i);
        const u = (x + width / 2) / width;
        const v = (y + height / 2) / height;
        uvAttribute.setXY(i, u, v);
    }
    faceGeo.attributes.uv.needsUpdate = true;

    return { coreGeo, faceGeo, thickness, bevelThickness: 0.02 };
})();