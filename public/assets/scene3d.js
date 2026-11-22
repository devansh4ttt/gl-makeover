/* ==========================================================================
   Gorgeous Look Makeover (G L Makeover) — Unified Single-Loop WebGL 3D
   Exports:
     1. mountVanityMirror3D      (Home Hero — 3D Illuminated Vanity Mirror)
     2. mountAdminVanitySphere3D (Admin Hub — 3D Rose-Gold Activity Sphere)
   Single active WebGL loop coordinator, pixel-ratio cap, context-loss
   recovery, off-screen IntersectionObserver pause, and zero-leak disposal.
   ========================================================================== */

let threePromise = null;
let activeLoopOwner = null;
const loopPausers = new Map();

function claimWebGLLoop(ownerId, pauseFn) {
  loopPausers.set(ownerId, pauseFn);
  if (activeLoopOwner && activeLoopOwner !== ownerId) {
    const prevPause = loopPausers.get(activeLoopOwner);
    if (typeof prevPause === 'function') prevPause(true);
  }
  activeLoopOwner = ownerId;
}

function releaseWebGLLoop(ownerId) {
  loopPausers.delete(ownerId);
  if (activeLoopOwner === ownerId) activeLoopOwner = null;
}

function detectTier() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'none';
  }
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'none';
  } catch (_) {
    return 'none';
  }
  const w = window.innerWidth || 1024;
  const cores = navigator.hardwareConcurrency || 4;
  if (w < 680 || cores <= 4) return 'lite';
  if (w < 1100) return 'medium';
  return 'high';
}

function loadThree() {
  if (!threePromise) {
    threePromise = import('https://esm.sh/three@0.169.0');
  }
  return threePromise;
}

/* ==========================================================================
   1. HOME HERO — 3D Illuminated Vanity Mirror & Champagne Rose-Gold Ring
   ========================================================================== */
export async function mountVanityMirror3D(hostEl, initialPhotoUrl, callbacks = {}) {
  const tier = detectTier();
  if (tier === 'none' || !hostEl) {
    return { supported: false, setPhoto() {}, setPaused() {}, resetCamera() {}, dispose() {} };
  }

  let THREE;
  try {
    THREE = await loadThree();
  } catch (_) {
    return { supported: false, setPhoto() {}, setPaused() {}, resetCamera() {}, dispose() {} };
  }

  const ownerId = 'gl-vanity-' + Math.random().toString(36).slice(2, 8);
  const disposables = [];
  const track = (obj) => {
    if (obj) disposables.push(obj);
    return obj;
  };

  let width = Math.max(hostEl.clientWidth, 300);
  let height = Math.max(hostEl.clientHeight, 240);

  const renderer = new THREE.WebGLRenderer({
    antialias: tier !== 'lite',
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier === 'high' ? 2 : 1.5));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  hostEl.innerHTML = '';
  hostEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 45);
  camera.position.set(0, 0.08, 6.25);

  scene.add(new THREE.AmbientLight(0xfaf8f4, 0.68));

  const keyLight = new THREE.DirectionalLight(0xffe7c9, 1.85);
  keyLight.position.set(4.2, 4.4, 5.2);
  scene.add(keyLight);

  const mulberryRim = new THREE.PointLight(0x6d213c, 3.2, 14);
  mulberryRim.position.set(-4.2, -1.8, 3.0);
  scene.add(mulberryRim);

  const champagneAccent = new THREE.PointLight(0xdfb98a, 2.6, 13);
  champagneAccent.position.set(3.4, 2.0, 3.8);
  scene.add(champagneAccent);

  const rig = new THREE.Group();
  scene.add(rig);

  const espressoMat = track(new THREE.MeshStandardMaterial({
    color: 0x22171b,
    metalness: 0.52,
    roughness: 0.36
  }));
  const roseGoldMat = track(new THREE.MeshStandardMaterial({
    color: 0xdfb98a,
    metalness: 0.9,
    roughness: 0.2
  }));
  const bulbMat = track(new THREE.MeshStandardMaterial({
    color: 0xfff3de,
    emissive: 0xdfb98a,
    emissiveIntensity: 1.45,
    roughness: 0.2
  }));

  // 1. Sculpted Oval Vanity Ring Frame (scaled torus for architectural mirror silhouette)
  const mirrorGroup = new THREE.Group();
  rig.add(mirrorGroup);

  const outerRim = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.92, 0.072, 20, 72)),
    roseGoldMat
  );
  outerRim.scale.set(1.18, 0.94, 1);
  mirrorGroup.add(outerRim);

  const innerBezel = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.8, 0.036, 16, 68)),
    espressoMat
  );
  innerBezel.scale.set(1.18, 0.94, 1);
  innerBezel.position.z = 0.05;
  mirrorGroup.add(innerBezel);

  // 2. Twelve Illuminated Warm Vanity Bulbs around Oval Perimeter (InstancedMesh = 1 draw call)
  const bulbCount = 12;
  const bulbs = new THREE.InstancedMesh(
    track(new THREE.SphereGeometry(0.068, 12, 12)),
    bulbMat,
    bulbCount
  );
  const bulbDummy = new THREE.Object3D();
  for (let i = 0; i < bulbCount; i++) {
    const a = (i / bulbCount) * Math.PI * 2;
    bulbDummy.position.set(Math.cos(a) * 1.92 * 1.18, Math.sin(a) * 1.92 * 0.94, 0.11);
    bulbDummy.scale.setScalar(1);
    bulbDummy.updateMatrix();
    bulbs.setMatrixAt(i, bulbDummy.matrix);
  }
  bulbs.instanceMatrix.needsUpdate = true;
  mirrorGroup.add(bulbs);

  // 3. Minimalist Vanity Tray Pedestal Beneath Mirror
  const pedestalBar = new THREE.Mesh(track(new THREE.BoxGeometry(2.3, 0.06, 0.42)), roseGoldMat);
  pedestalBar.position.set(0, -1.94, -0.05);
  rig.add(pedestalBar);

  const pedestalBase = new THREE.Mesh(track(new THREE.BoxGeometry(2.5, 0.09, 0.56)), espressoMat);
  pedestalBase.position.set(0, -2.02, -0.05);
  rig.add(pedestalBase);

  // 4. Floating Bridal Look Showcase Plate (displays real Phase 1 bridal look)
  const plateW = 2.66;
  const plateH = 1.72;
  const frameGroup = new THREE.Group();
  frameGroup.position.z = 0.22;
  rig.add(frameGroup);

  const plateBack = new THREE.Mesh(
    track(new THREE.BoxGeometry(plateW + 0.12, plateH + 0.12, 0.075)),
    espressoMat
  );
  plateBack.position.z = -0.045;
  frameGroup.add(plateBack);

  const plateTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(plateW + 0.17, plateH + 0.17, 0.028)),
    roseGoldMat
  );
  plateTrim.position.z = -0.068;
  frameGroup.add(plateTrim);

  const photoMat = track(new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.05
  }));
  const photoMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(plateW, plateH)), photoMat);
  photoMesh.position.z = 0.006;
  frameGroup.add(photoMesh);

  // 5. Custom GLSL Warm Champagne Ring-Light Halo Shader
  const haloMat = track(new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(0xdfb98a) },
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * vec2(0.9, 1.12);
        float r = length(p);
        float ring = smoothstep(0.48, 0.36, r) * smoothstep(0.24, 0.37, r);
        float pulse = 0.76 + 0.24 * sin(uTime * 1.1);
        gl_FragColor = vec4(uColor, ring * 0.32 * pulse);
      }
    `
  }));
  const haloPlane = new THREE.Mesh(track(new THREE.PlaneGeometry(6.2, 4.8)), haloMat);
  haloPlane.position.z = -0.45;
  rig.add(haloPlane);

  // 6. Instanced Shimmer Motes (1 draw call)
  const moteCount = tier === 'lite' ? 24 : 40;
  const motes = new THREE.InstancedMesh(
    track(new THREE.SphereGeometry(0.022, 8, 8)),
    track(new THREE.MeshBasicMaterial({ color: 0xf0d2a8, transparent: true, opacity: 0.58 })),
    moteCount
  );
  const moteSeeds = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < moteCount; i++) {
    moteSeeds.push({
      radius: 2.38 + Math.random() * 1.35,
      angle: (i / moteCount) * Math.PI * 2 + Math.random() * 0.4,
      y: (Math.random() - 0.5) * 2.5,
      speed: 0.11 + Math.random() * 0.16,
      scale: 0.6 + Math.random() * 1.1
    });
  }
  scene.add(motes);

  const texLoader = new THREE.TextureLoader();
  let currentTex = null;
  function setPhoto(url) {
    if (!url) return;
    texLoader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      if (currentTex) currentTex.dispose();
      currentTex = tex;
      photoMat.map = tex;
      photoMat.needsUpdate = true;
    });
  }
  setPhoto(initialPhotoUrl);

  let targetRotY = -0.16;
  let targetRotX = 0.06;
  let curRotY = -0.16;
  let curRotX = 0.06;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let isPaused = false;
  let isVisible = true;
  let isDocVisible = !document.hidden;
  let isContextLost = false;
  let isDisposed = false;
  let rafId = 0;
  let lastRenderTime = 0;
  const minFrameMs = tier === 'lite' ? 32 : 16;

  function onPointerDown(e) { isDragging = true; lastX = e.clientX; lastY = e.clientY; }
  function onPointerMove(e) {
    if (!isDragging) {
      const rect = hostEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && e.pointerType === 'mouse') {
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        targetRotY = Math.max(-0.44, Math.min(0.44, nx * 0.32));
        targetRotX = Math.max(-0.22, Math.min(0.22, ny * 0.16));
      }
      return;
    }
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    targetRotY = Math.max(-0.78, Math.min(0.78, targetRotY + dx * 0.0075));
    targetRotX = Math.max(-0.36, Math.min(0.36, targetRotX + dy * 0.005));
  }
  function onPointerUp() { isDragging = false; }
  function onDoubleClick() { targetRotY = -0.15; targetRotX = 0.06; }
  function onResize() {
    if (isDisposed || !hostEl) return;
    width = Math.max(hostEl.clientWidth, 300);
    height = Math.max(hostEl.clientHeight, 240);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  function onVisibility() { isDocVisible = !document.hidden; schedule(); }
  function onContextLost(e) { e.preventDefault(); isContextLost = true; }
  function onContextRestored() { isContextLost = false; schedule(); }

  hostEl.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  hostEl.addEventListener('dblclick', onDoubleClick);
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

  const observer = new IntersectionObserver((entries) => {
    isVisible = !!(entries[0] && entries[0].isIntersecting);
    schedule();
  }, { threshold: 0.04 });
  observer.observe(hostEl);

  const clock = new THREE.Clock();

  function tick(now) {
    rafId = 0;
    if (isDisposed || isPaused || !isVisible || !isDocVisible || isContextLost) return;
    rafId = requestAnimationFrame(tick);
    if (now - lastRenderTime < minFrameMs) return;
    lastRenderTime = now;

    const t = clock.getElapsedTime();
    haloMat.uniforms.uTime.value = t;
    bulbMat.emissiveIntensity = 1.25 + 0.35 * Math.sin(t * 1.4);

    curRotY += (targetRotY + Math.sin(t * 0.44) * 0.075 - curRotY) * 0.07;
    curRotX += (targetRotX + Math.cos(t * 0.34) * 0.025 - curRotX) * 0.07;
    rig.rotation.y = curRotY;
    rig.rotation.x = curRotX;
    frameGroup.position.y = Math.sin(t * 0.85) * 0.045;

    for (let i = 0; i < moteCount; i++) {
      const m = moteSeeds[i];
      const a = m.angle + t * m.speed;
      dummy.position.set(
        Math.cos(a) * m.radius,
        m.y + Math.sin(t * 0.55 + i) * 0.15,
        Math.sin(a) * 0.9 - 0.5
      );
      dummy.scale.setScalar(m.scale);
      dummy.updateMatrix();
      motes.setMatrixAt(i, dummy.matrix);
    }
    motes.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
  }

  function schedule() {
    if (!rafId && !isDisposed && !isPaused && isVisible && isDocVisible && !isContextLost) {
      claimWebGLLoop(ownerId, (p) => { isPaused = p; });
      rafId = requestAnimationFrame(tick);
    }
  }

  renderer.render(scene, camera);
  schedule();
  if (typeof callbacks.onReady === 'function') callbacks.onReady();

  return {
    supported: true,
    setPhoto,
    setPaused(flag) { isPaused = !!flag; if (!isPaused) schedule(); },
    resetCamera() { onDoubleClick(); },
    dispose() {
      isDisposed = true;
      releaseWebGLLoop(ownerId);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      hostEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      hostEl.removeEventListener('dblclick', onDoubleClick);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      if (currentTex) currentTex.dispose();
      for (const item of disposables) {
        if (item && typeof item.dispose === 'function') item.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === hostEl) hostEl.removeChild(renderer.domElement);
    }
  };
}

/* ==========================================================================
   2. ADMIN COMMAND CENTER — 3D Rose-Gold & Mulberry Geodesic Vanity Sphere
   ========================================================================== */
export async function mountAdminVanitySphere3D(hostEl, activityScore = 1) {
  const tier = detectTier();
  if (tier === 'none' || !hostEl) {
    return { supported: false, setActivity() {}, dispose() {} };
  }

  let THREE;
  try {
    THREE = await loadThree();
  } catch (_) {
    return { supported: false, setActivity() {}, dispose() {} };
  }

  const ownerId = 'gl-admin-sphere-' + Math.random().toString(36).slice(2, 8);
  const disposables = [];
  const track = (obj) => {
    if (obj) disposables.push(obj);
    return obj;
  };

  let width = Math.max(hostEl.clientWidth, 180);
  let height = Math.max(hostEl.clientHeight, 180);

  const renderer = new THREE.WebGLRenderer({
    antialias: tier !== 'lite',
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier === 'high' ? 2 : 1.5));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  hostEl.innerHTML = '';
  hostEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 30);
  camera.position.set(0, 0, 5.2);

  scene.add(new THREE.AmbientLight(0xfaf8f4, 0.72));
  const key = new THREE.DirectionalLight(0xdfb98a, 2.1);
  key.position.set(3, 4, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0x6d213c, 3.6, 12);
  rim.position.set(-3.5, -2.5, 2.5);
  scene.add(rim);

  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  const coreMesh = new THREE.Mesh(
    track(new THREE.IcosahedronGeometry(1.06, 1)),
    track(new THREE.MeshStandardMaterial({
      color: 0x3b1826,
      metalness: 0.74,
      roughness: 0.25,
      flatShading: true
    }))
  );
  rootGroup.add(coreMesh);

  const wireGeo = track(new THREE.IcosahedronGeometry(1.42, 1));
  rootGroup.add(new THREE.Mesh(
    wireGeo,
    track(new THREE.MeshBasicMaterial({ color: 0xdfb98a, wireframe: true, transparent: true, opacity: 0.36 }))
  ));
  rootGroup.add(new THREE.Points(
    wireGeo,
    track(new THREE.PointsMaterial({ color: 0xfaf8f4, size: 0.075, transparent: true, opacity: 0.9 }))
  ));

  const ring1 = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.78, 0.022, 12, 64)),
    track(new THREE.MeshStandardMaterial({ color: 0xdfb98a, metalness: 0.9, roughness: 0.2 }))
  );
  ring1.rotation.x = 1.15;
  rootGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.96, 0.018, 12, 64)),
    track(new THREE.MeshStandardMaterial({ color: 0x6d213c, metalness: 0.6, roughness: 0.32 }))
  );
  ring2.rotation.y = 0.95;
  ring2.rotation.x = -0.55;
  rootGroup.add(ring2);

  const satCount = 14;
  const sats = new THREE.InstancedMesh(
    track(new THREE.SphereGeometry(0.045, 10, 10)),
    track(new THREE.MeshBasicMaterial({ color: 0xdfb98a })),
    satCount
  );
  const satSeeds = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < satCount; i++) {
    satSeeds.push({
      radius: 1.62 + (i % 3) * 0.24,
      angle: (i / satCount) * Math.PI * 2,
      tilt: ((i % 5) - 2) * 0.38,
      speed: 0.45 + (i % 4) * 0.14
    });
  }
  rootGroup.add(sats);

  let velY = 0.004;
  let velX = 0.0015;
  let speedFactor = Math.max(0.8, Math.min(2.2, 0.8 + activityScore * 0.05));
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let isPaused = false;
  let isVisible = true;
  let isDocVisible = !document.hidden;
  let isContextLost = false;
  let isDisposed = false;
  let rafId = 0;
  let lastRenderTime = 0;
  const minFrameMs = tier === 'lite' ? 32 : 16;

  function onDown(e) { isDragging = true; lastX = e.clientX; lastY = e.clientY; }
  function onMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    velY = dx * 0.008;
    velX = dy * 0.006;
    rootGroup.rotation.y += velY;
    rootGroup.rotation.x += velX;
  }
  function onUp() { isDragging = false; }
  function onDbl() { velY = 0.065; velX = -0.02; }
  function onResize() {
    if (isDisposed || !hostEl) return;
    width = Math.max(hostEl.clientWidth, 180);
    height = Math.max(hostEl.clientHeight, 180);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  function onVisibility() { isDocVisible = !document.hidden; schedule(); }
  function onContextLost(e) { e.preventDefault(); isContextLost = true; }
  function onContextRestored() { isContextLost = false; schedule(); }

  hostEl.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
  hostEl.addEventListener('dblclick', onDbl);
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

  const observer = new IntersectionObserver((entries) => {
    isVisible = !!(entries[0] && entries[0].isIntersecting);
    schedule();
  }, { threshold: 0.05 });
  observer.observe(hostEl);

  const clock = new THREE.Clock();

  function tick(now) {
    rafId = 0;
    if (isDisposed || isPaused || !isVisible || !isDocVisible || isContextLost) return;
    rafId = requestAnimationFrame(tick);
    if (now - lastRenderTime < minFrameMs) return;
    lastRenderTime = now;

    const t = clock.getElapsedTime();
    if (!isDragging) {
      velY = velY * 0.96 + 0.0045 * speedFactor * 0.04;
      velX = velX * 0.95 + 0.0012 * 0.05;
      rootGroup.rotation.y += velY;
      rootGroup.rotation.x += velX;
    }

    coreMesh.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04);
    ring1.rotation.z = t * 0.28 * speedFactor;
    ring2.rotation.z = -t * 0.22 * speedFactor;

    for (let i = 0; i < satCount; i++) {
      const s = satSeeds[i];
      const a = s.angle + t * s.speed * speedFactor;
      dummy.position.set(
        Math.cos(a) * s.radius,
        Math.sin(a) * Math.sin(s.tilt) * s.radius,
        Math.sin(a) * Math.cos(s.tilt) * s.radius
      );
      dummy.scale.setScalar(0.85 + Math.sin(t * 2 + i) * 0.25);
      dummy.updateMatrix();
      sats.setMatrixAt(i, dummy.matrix);
    }
    sats.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function schedule() {
    if (!rafId && !isDisposed && !isPaused && isVisible && isDocVisible && !isContextLost) {
      claimWebGLLoop(ownerId, (p) => { isPaused = p; });
      rafId = requestAnimationFrame(tick);
    }
  }

  renderer.render(scene, camera);
  schedule();

  return {
    supported: true,
    setActivity(score) { speedFactor = Math.max(0.8, Math.min(2.4, 0.8 + Number(score || 0) * 0.05)); },
    dispose() {
      isDisposed = true;
      releaseWebGLLoop(ownerId);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      hostEl.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      hostEl.removeEventListener('dblclick', onDbl);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      for (const item of disposables) {
        if (item && typeof item.dispose === 'function') item.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === hostEl) hostEl.removeChild(renderer.domElement);
    }
  };
}
