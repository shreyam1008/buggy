import { useEffect, useRef } from 'react';

/**
 * NebulaCanvas — a lightweight WebGL-free particle nebula.
 * - ~140 particles with twinkle + gentle drift
 * - Connection lines between near neighbours (constellation-style)
 * - DPR aware, pauses when tab is hidden, respects prefers-reduced-motion
 */
export default function NebulaCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0, raf = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number; phase: number };
    let particles: P[] = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(140, Math.floor((w * h) / 9000));
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.4,
        hue: 200 + Math.random() * 160,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      // Dim background glow
      const g = ctx.createRadialGradient(w / 2, h / 3, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      g.addColorStop(0, 'rgba(80, 50, 120, 0.08)');
      g.addColorStop(0.5, 'rgba(20, 10, 40, 0.04)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        const twinkle = 0.5 + 0.5 * Math.sin(p.phase + t * 0.002);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 80%, ${65 + twinkle * 20}%, ${0.35 + twinkle * 0.45})`;
        ctx.arc(p.x, p.y, p.r * (0.8 + twinkle * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }

      // Constellation lines (sparse — only closest pairs for perf)
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < Math.min(i + 6, particles.length); j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 8100) {
            const o = 1 - d2 / 8100;
            ctx.strokeStyle = `rgba(170, 140, 240, ${o * 0.18})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    if (!reduced) raf = requestAnimationFrame(draw);
    else draw(0); // one frame, no loop

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="me-nebula" aria-hidden="true" />;
}
