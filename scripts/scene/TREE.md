# scene
- scene.js (总入口)
    - core.js: 负责 Three.js 的基础组件（场景、相机、渲染器、窗口缩放）。
    - lighting.js: 负责所有灯光的设置。
    - background.js: 负责生成宇宙星云背景。
    - materials.js: 负责材质、纹理生成（卡背、卡面 Canvas 绘制）。
    - geometry.js: 负责卡牌的几何形状生成。
    - deck.js: 负责卡组的逻辑（生成卡牌 Mesh、添加到场景）。
    - effects.js: 负责特效（准星、粒子星场）。