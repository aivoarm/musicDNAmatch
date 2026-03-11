"use client";
import React from "react";
import { AXIS_LABELS } from "@/lib/dna";

export function RadarChart({ vector, color = "#FF0000" }: { vector: number[], color?: string }) {
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 30;
    const n = vector.length;

    const getPoint = (idx: number, val: number) => {
        const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
        const x = cx + Math.cos(angle) * val * maxR;
        const y = cy + Math.sin(angle) * val * maxR;
        return { x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1.0];
    const points = (Array.isArray(vector) ? vector : []).map((v, i) => getPoint(i, Number(v) || 0));
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : "255,0,0";
    };

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto overflow-visible">
            {gridLevels.map(level => {
                const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
                return <path key={level} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
            })}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
            })}
            <path d={pathD} fill={`rgba(${hexToRgb(color)},0.15)`} stroke={color} strokeWidth="2" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
            ))}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1.18);
                const label = AXIS_LABELS[i]?.replace(/_/g, " ") || "";
                const short = label.split(" ").map(w => w.charAt(0).toUpperCase()).join("");
                return (
                    <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                        className="fill-white/80 font-black" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
                        {short}
                    </text>
                );
            })}
        </svg>
    );
}

export function DualRadarChart({ v1, v2, c1 = "#FF0000", c2 = "#3B82F6" }: { v1: number[], v2: number[], c1?: string, c2?: string }) {
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 30;
    const n = Math.max(v1.length, v2.length);

    const getPoint = (idx: number, val: number) => {
        const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
        const x = cx + Math.cos(angle) * val * maxR;
        const y = cy + Math.sin(angle) * val * maxR;
        return { x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1.0];

    const pts1 = v1.map((v, i) => getPoint(i, Number(v) || 0));
    const path1 = pts1.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const pts2 = v2.map((v, i) => getPoint(i, Number(v) || 0));
    const path2 = pts2.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : "255,0,0";
    };

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto overflow-visible">
            {gridLevels.map(level => {
                const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
                return <path key={level} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
            })}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
            })}

            <path d={path1} fill={`rgba(${hexToRgb(c1)},0.2)`} stroke={c1} strokeWidth="2" />
            <path d={path2} fill={`rgba(${hexToRgb(c2)},0.2)`} stroke={c2} strokeWidth="2" />

            {pts1.map((p, i) => <circle key={`c1-${i}`} cx={p.x} cy={p.y} r="2.5" fill={c1} />)}
            {pts2.map((p, i) => <circle key={`c2-${i}`} cx={p.x} cy={p.y} r="2.5" fill={c2} />)}

            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1.18);
                const label = AXIS_LABELS[i]?.replace(/_/g, " ") || "";
                const short = label.split(" ").map(w => w.charAt(0).toUpperCase()).join("");
                return (
                    <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                        className="fill-white/80 font-black" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
                        {short}
                    </text>
                );
            })}
        </svg>
    );
}
