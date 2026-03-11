"use client";
import React, { useRef, useEffect } from "react";

export default function DNAHelix() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext("2d")!; let raf: number, t = 0;
        const resize = () => {
            c.width = c.offsetWidth * devicePixelRatio;
            c.height = c.offsetHeight * devicePixelRatio;
            ctx.scale(devicePixelRatio, devicePixelRatio);
        };
        resize(); window.addEventListener("resize", resize);
        const W = () => c.offsetWidth, H = () => c.offsetHeight;
        const draw = () => {
            ctx.clearRect(0, 0, W(), H()); t += 0.008;
            const cx = W() / 2, amp = W() * 0.28, steps = 80, sh = H() / steps;
            for (let s = 0; s < 2; s++) {
                const off = s === 0 ? 0 : Math.PI;
                const pts: [number, number][] = [];
                for (let i = 0; i <= steps; i++) pts.push([cx + amp * Math.sin(i * 0.18 + t + off), i * sh]);
                const g = ctx.createLinearGradient(0, 0, 0, H());
                if (s === 0) { g.addColorStop(0, "rgba(255,0,0,0)"); g.addColorStop(.3, "rgba(255,0,0,.6)"); g.addColorStop(.7, "rgba(255,80,0,.6)"); g.addColorStop(1, "rgba(255,0,0,0)"); }
                else { g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.3, "rgba(255,255,255,.1)"); g.addColorStop(.7, "rgba(255,255,255,.1)"); g.addColorStop(1, "rgba(255,255,255,0)"); }
                ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
                for (let i = 1; i < pts.length - 1; i++) {
                    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
                    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
                }
                ctx.strokeStyle = g; ctx.lineWidth = s === 0 ? 2 : 1; ctx.stroke();
            }
            for (let i = 2; i <= steps - 2; i++) {
                if (i % 3 !== 0) continue;
                const y = i * sh, x0 = cx + amp * Math.sin(i * 0.18 + t), x1 = cx + amp * Math.sin(i * 0.18 + t + Math.PI);
                const b = (Math.sin(i * 0.18 + t) + 1) / 2;
                const rg = ctx.createLinearGradient(x0, y, x1, y);
                rg.addColorStop(0, `rgba(255,0,0,${.15 + b * .4})`); rg.addColorStop(.5, `rgba(255,${Math.floor(b * 120)},0,${.3 + b * .3})`); rg.addColorStop(1, `rgba(255,255,255,${.05 + b * .1})`);
                ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.strokeStyle = rg; ctx.lineWidth = 1; ctx.stroke();
                ctx.beginPath(); ctx.arc(x0, y, 2.5 + b * 1.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,0,0,${.4 + b * .6})`; ctx.fill();
                ctx.beginPath(); ctx.arc(x1, y, 1.5 + b, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${.1 + b * .2})`; ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);
    return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}
