"use client";

import { useEffect, useRef } from 'react';

interface Props {
    width: number;
    height: number;
    model: string;
}

export function CabinVisual({ width, height, model }: Props) {
    // A simple visualizer. 
    // We scale the drawing to fit in a 300x300 box.
    const padding = 20;
    const maxDim = Math.max(width, width); // usually width/depth are similar 
    // Wait, width is W, depth is D. If D is missing, D=W.
    const depth = width; // Simplifying for this view if depth implies square

    // Scale factor
    const size = 200;
    const scale = size / Math.max(width, depth);

    const wPx = width * scale;
    const dPx = depth * scale;

    const stroke = "#2563eb"; // blue-600
    const fill = "#eff6ff"; // blue-50
    const wallStroke = "#94a3b8"; // gray-400

    return (
        <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-white mb-6 print:block print:border-none print:mb-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 print:hidden">Şematik Görünüm (Kuşbakışı)</h3>
            <svg width={size + padding * 2} height={size + padding * 2} className="overflow-visible">
                <g transform={`translate(${padding}, ${padding})`}>

                    {/* Walls */}
                    <line x1={0} y1={0} x2={0} y2={size} stroke={wallStroke} strokeWidth="4" strokeDasharray="4 4" />
                    <line x1={0} y1={0} x2={size} y2={0} stroke={wallStroke} strokeWidth="4" strokeDasharray="4 4" />

                    {/* Cabin Shape */}
                    {model === 'kose' && (
                        <path d={`M 0 ${dPx} L ${wPx} ${dPx} L ${wPx} 0`} fill="none" stroke={stroke} strokeWidth="4" />
                    )}

                    {model === 'oval' && (
                        <path d={`M 0 ${dPx} Q ${wPx} ${dPx} ${wPx} 0`} fill="none" stroke={stroke} strokeWidth="4" />
                    )}

                    {(model === 'duz_1s1c' || model === 'duz_2s2c') && (
                        // Straight line between walls? usually wall to wall
                        <line x1={0} y1={size / 2} x2={size} y2={size / 2} stroke={stroke} strokeWidth="4" />
                    )}

                    {/* Dimensions Text */}
                    <text x={wPx / 2} y={-5} textAnchor="middle" fontSize="12" fill="black" fontWeight="bold">{width} cm</text>
                    <text x={-5} y={dPx / 2} textAnchor="end" fontSize="12" fill="black" fontWeight="bold" alignmentBaseline="middle">{depth} cm</text>

                </g>
            </svg>
            <p className="text-[10px] text-gray-400 mt-2 print:hidden">* Temsili çizimdir.</p>
        </div>
    );
}
