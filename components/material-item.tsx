"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Video, FileText, File as FileIcon, ImageIcon, Loader2, RefreshCw, PlayCircle } from "lucide-react";
import { VideoPlayerModal } from "./video-player-modal";

interface MaterialLinkProps {
    url: string;
    name: string;
    typeName: string;
    className?: string;
    iconClassName?: string;
    showIcon?: boolean;
    muxPlaybackId?: string;
    muxStatus?: string;
}

function getFileIcon(url: string, typeName: string, className?: string) {
    const lowerUrl = url.toLowerCase();
    const lowerType = typeName.toLowerCase();
    
    if (lowerType === "video" || lowerUrl.endsWith(".mp4") || lowerUrl.endsWith(".webm")) {
        return <Video className={className} />;
    }
    if (lowerType === "image" || lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".png") || lowerUrl.endsWith(".svg") || lowerUrl.endsWith(".webp")) {
        return <ImageIcon className={className} />;
    }
    if (lowerType === "pdf" || lowerUrl.endsWith(".pdf")) {
        return <FileText className={className} />;
    }
    return <FileIcon className={className} />;
}

export function MaterialLink({ url, name, typeName, className, iconClassName, showIcon = true, muxPlaybackId, muxStatus }: MaterialLinkProps) {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const isVideo = typeName.toLowerCase() === "video" || url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm");
    const isMuxPending = isVideo && muxStatus === "pending" && !muxPlaybackId;

    const handleClick = (e: React.MouseEvent) => {
        if (isVideo && muxPlaybackId) {
            e.preventDefault();
            setIsVideoOpen(true);
        } else if (isMuxPending) {
            e.preventDefault();
        }
    };

    const handleSync = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSyncing(true);
        try {
            await fetch("/api/video/sync");
            router.refresh();
        } finally {
            setIsSyncing(false);
        }
    };

    if (isMuxPending) {
        return (
            <span
                className={`${className} flex items-center gap-1.5 cursor-default opacity-60`}
                title="Video is being processed by Mux"
            >
                <Loader2 className={`${iconClassName ?? "h-3.5 w-3.5"} animate-spin`} />
            </span>
        );
    }

    return (
        <>
            <a
                href={muxPlaybackId ? "#" : url}
                target={isVideo ? "_self" : "_blank"}
                rel="noopener noreferrer"
                onClick={handleClick}
                className={className}
                title={isVideo ? "Play video" : "Open material"}
            >
                {showIcon && getFileIcon(url, typeName, iconClassName)}
            </a>
            <VideoPlayerModal 
                url={url} 
                title={name} 
                isOpen={isVideoOpen} 
                onClose={() => setIsVideoOpen(false)} 
                playbackId={muxPlaybackId}
            />
        </>
    );
}

export function StudentMaterialItem({ 
    url, name, typeName, muxPlaybackId, muxStatus 
}: { 
    url: string; name: string; typeName: string; muxPlaybackId?: string; muxStatus?: string; 
}) {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const isVideo = typeName.toLowerCase() === "video" || url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm");
    const isMuxPending = isVideo && !muxPlaybackId && muxStatus === "pending";
    const isMuxReady = isVideo && !!muxPlaybackId;

    const handleClick = (e: React.MouseEvent) => {
        if (isMuxReady) {
            e.preventDefault();
            setIsVideoOpen(true);
        } else if (isMuxPending) {
            e.preventDefault();
        }
    };

    const handleSync = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSyncing(true);
        try {
            await fetch("/api/video/sync");
            router.refresh();
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <li>
            <div
                onClick={isMuxReady ? () => setIsVideoOpen(true) : undefined}
                className={`group/mat flex items-center gap-2 rounded-lg border px-3 py-2 transition
                    ${isMuxPending
                        ? "border-amber-200 bg-amber-50/60 dark:bg-amber-900/10 dark:border-amber-500/20 cursor-default"
                        : "border-gray-100 bg-gray-50 dark:bg-slate-900/50 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer"
                    }`}
            >
                {isMuxPending ? (
                    <Loader2 className="h-3.5 w-3.5 flex-shrink-0 text-amber-500 animate-spin" />
                ) : isMuxReady ? (
                    <PlayCircle className="h-3.5 w-3.5 flex-shrink-0 text-violet-500 group-hover/mat:text-violet-600" />
                ) : (
                    getFileIcon(url, typeName, "h-3.5 w-3.5 flex-shrink-0 text-gray-400 group-hover/mat:text-blue-500")
                )}

                <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-semibold ${isMuxPending ? "text-amber-700 dark:text-amber-400" : "text-gray-800 dark:text-gray-200 group-hover/mat:text-blue-700 dark:group-hover/mat:text-blue-400"}`}>
                        {name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                        {isMuxPending ? "Processing… video is encoding" : typeName}
                    </p>
                </div>

                {/* Sync button for pending Mux videos */}
                {isMuxPending && (
                    <button
                        onClick={handleSync}
                        title="Check if video is ready"
                        className="ml-auto rounded-md p-1 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition flex-shrink-0"
                    >
                        {isSyncing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3 w-3" />
                        )}
                    </button>
                )}
            </div>
            
            {isMuxReady && (
                <VideoPlayerModal 
                    url={url} 
                    title={name} 
                    isOpen={isVideoOpen} 
                    onClose={() => setIsVideoOpen(false)} 
                    playbackId={muxPlaybackId}
                />
            )}
        </li>
    );
}
