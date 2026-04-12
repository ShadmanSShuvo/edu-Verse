"use client";

import MuxPlayer from "@mux/mux-player-react";
import { Play } from "lucide-react";

interface LessonPlayerProps {
    playbackId: string;
    title?: string;
    thumbnailTime?: number;
    metadata?: Record<string, any>;
}

export function LessonPlayer({ playbackId, title, thumbnailTime = 0, metadata }: LessonPlayerProps) {
    if (!playbackId) return null;

    return (
        <div className="group relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
            {/* Ambient glow */}
            <div
                aria-hidden
                className="absolute -inset-1 opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500 bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 pointer-events-none"
            />

            <MuxPlayer
                playbackId={playbackId}
                metadata={{
                    video_id: playbackId,
                    video_title: title || "Lesson Video",
                    ...metadata,
                }}
                thumbnailTime={thumbnailTime}
                streamType="on-demand"
                accentColor="#7c3aed"
                style={{
                    aspectRatio: "16 / 9",
                    width: "100%",
                    display: "block",
                }}
            />

            {title && (
                <div className="flex items-center gap-3 border-t border-white/5 bg-slate-900/60 px-4 py-3 backdrop-blur-md">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400">
                        <Play className="h-3.5 w-3.5 fill-current" />
                    </div>
                    <h3 className="text-sm font-bold text-white/90 truncate">{title}</h3>
                </div>
            )}
        </div>
    );
}
