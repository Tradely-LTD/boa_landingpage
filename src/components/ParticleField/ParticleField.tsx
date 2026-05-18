import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 8;

    // ── Layer 1 — gold foreground grain particles ────────────────────────────
    const COUNT_A = 1400;
    const posA = new Float32Array(COUNT_A * 3);
    const velA = new Float32Array(COUNT_A);
    for (let i = 0; i < COUNT_A; i++) {
      posA[i * 3]     = (Math.random() - 0.5) * 26;
      posA[i * 3 + 1] = (Math.random() - 0.5) * 18;
      posA[i * 3 + 2] = (Math.random() - 0.5) * 6;
      velA[i]         = 0.003 + Math.random() * 0.005;
    }
    const geoA = new THREE.BufferGeometry();
    geoA.setAttribute('position', new THREE.BufferAttribute(posA, 3));
    const matA = new THREE.PointsMaterial({ color: 0xf5a623, size: 0.055, sizeAttenuation: true, transparent: true, opacity: 0.7 });
    const pointsA = new THREE.Points(geoA, matA);
    scene.add(pointsA);

    // ── Layer 2 — distant white dust (depth) ────────────────────────────────
    const COUNT_B = 500;
    const posB = new Float32Array(COUNT_B * 3);
    for (let i = 0; i < COUNT_B; i++) {
      posB[i * 3]     = (Math.random() - 0.5) * 34;
      posB[i * 3 + 1] = (Math.random() - 0.5) * 22;
      posB[i * 3 + 2] = (Math.random() - 0.5) * 4 - 5;
    }
    const geoB = new THREE.BufferGeometry();
    geoB.setAttribute('position', new THREE.BufferAttribute(posB, 3));
    const matB = new THREE.PointsMaterial({ color: 0xd1fae5, size: 0.022, sizeAttenuation: true, transparent: true, opacity: 0.22 });
    const pointsB = new THREE.Points(geoB, matB);
    scene.add(pointsB);

    // ── Layer 3 — faint large glows (bokeh feel) ────────────────────────────
    const COUNT_C = 80;
    const posC = new Float32Array(COUNT_C * 3);
    for (let i = 0; i < COUNT_C; i++) {
      posC[i * 3]     = (Math.random() - 0.5) * 20;
      posC[i * 3 + 1] = (Math.random() - 0.5) * 14;
      posC[i * 3 + 2] = (Math.random() - 0.5) * 3 - 2;
    }
    const geoC = new THREE.BufferGeometry();
    geoC.setAttribute('position', new THREE.BufferAttribute(posC, 3));
    const matC = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.28, sizeAttenuation: true, transparent: true, opacity: 0.09 });
    const pointsC = new THREE.Points(geoC, matC);
    scene.add(pointsC);

    // ── Resize ───────────────────────────────────────────────────────────────
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize);
    resize();

    // ── Scroll-driven camera zoom (cinematic pull-back) ──────────────────────
    let targetZ = 8;
    const onScroll = () => {
      const heroEl = canvas.parentElement;
      const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
      const progress = Math.min(window.scrollY / heroHeight, 1);
      targetZ = 8 + progress * 5; // 8 (at top) → 13 (hero scrolled away)
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Animation loop ───────────────────────────────────────────────────────
    let raf = 0;
    let t = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.001;

      // Smooth lerp toward scroll-driven camera z
      camera.position.z += (targetZ - camera.position.z) * 0.04;

      // Drift layer A upward, loop
      const pA = geoA.attributes.position.array as Float32Array;
      for (let i = 0; i < COUNT_A; i++) {
        pA[i * 3 + 1] += velA[i];
        if (pA[i * 3 + 1] > 9) pA[i * 3 + 1] = -9;
      }
      geoA.attributes.position.needsUpdate = true;

      // Slow rotation for subtle motion
      pointsA.rotation.y = t * 0.06;
      pointsB.rotation.y = -t * 0.025;
      pointsC.rotation.z = t * 0.012;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      renderer.dispose();
      geoA.dispose(); matA.dispose();
      geoB.dispose(); matB.dispose();
      geoC.dispose(); matC.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen', opacity: 0.55 }}
    />
  );
}
