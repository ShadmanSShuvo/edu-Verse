"use client";

import { X } from "lucide-react";
import { LessonPlayer } from "./lesson-player";

interface VideoPlayerModalProps {
    url: string;
    title: string;
    isOpen: boolean;
    onClose: () => void;
    playbackId?: string;
}

export function VideoPlayerModal({ url, title, isOpen, onClose, playbackId }: VideoPlayerModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between bg-slate-800/60 px-5 py-3 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white truncate pr-4">{title}</h3>
                    <button 
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition flex-shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                
                {/* Video */}
                <div className="bg-black">
                    {playbackId ? (
                        <LessonPlayer playbackId={playbackId} title={title} />
                    ) : (
                        <div className="relative aspect-video w-full">
                            <video 
                                src={url} 
                                controls 
                                autoPlay 
                                className="h-full w-full object-contain outline-none"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
