"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { stopProgress } from "@/components/top-loader";

interface MaterialType {
    type_id: number;
    type_name: string;
}

interface AddMaterialFormProps {
    moduleId: number;
    materialTypes: MaterialType[];
    addMaterialAction: (formData: FormData) => Promise<void>;
    onSuccess?: () => void;
}

export function AddMaterialForm({ moduleId, materialTypes, addMaterialAction, onSuccess }: AddMaterialFormProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedType, setSelectedType] = useState<string>("");
    const [uploadMode, setUploadMode] = useState<"link" | "file">("link");
    const [fileName, setFileName] = useState<string>("");
    const formRef = useRef<HTMLFormElement>(null);

    async function pollUntilReady(maxAttempts = 20) {
        setIsProcessing(true);
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 4000));
            try {
                const res = await fetch("/api/video/sync");
                const data = await res.json();
                router.refresh();
                if (data.synced > 0) {
                    // At least one video became ready — stop polling
                    break;
                }
            } catch { /* ignore */ }
        }
        setIsProcessing(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const moduleId = Number(formData.get("module_id"));
        const typeId = Number(formData.get("type_id"));
        const name = (formData.get("name") as string)?.trim();
        const file = formData.get("file") as File | null;

        const isVideo = materialTypes.find(t => t.type_id === typeId)?.type_name.toLowerCase().includes("video");

        try {
            console.log("Starting add material flow...", { name, moduleId, typeId, isVideo, uploadMode });
            setIsUploading(true);
            setIsDone(false);
            
            if (isVideo && uploadMode === "file" && file && file.size > 0) {
                // MUX VIDEO UPLOAD FLOW
                console.log("Mux Video Flow Initialized");
                
                // 1. Get Direct Upload URL from our API
                console.log("Step 1: Fetching Mux upload URL...");
                const resp = await fetch("/api/video/upload-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, moduleId, typeId })
                });
                
                if (!resp.ok) {
                    const errBody = await resp.text();
                    console.error("Mux upload URL fetch failed", resp.status, errBody);
                    throw new Error(`Failed to get Mux upload URL: ${errBody}`);
                }
                const { uploadUrl } = await resp.json();
                console.log("Step 1 Success: Got upload URL", uploadUrl ? "EXISTS" : "MISSING");
                
                // 2. Upload file directly to Mux
                console.log("Step 2: Uploading file directly to Mux...");
                const uploadResp = await fetch(uploadUrl, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type }
                });
                
                if (!uploadResp.ok) {
                    const errBody = await uploadResp.text();
                    console.error("Mux direct upload failed", uploadResp.status, errBody);
                    throw new Error(`Mux upload failed: ${errBody}`);
                }
                console.log("Step 2 Success: Mux upload complete. Syncing and refreshing...");
                // Immediately sync once, then poll in background
                router.refresh();
                fetch("/api/video/sync").then(() => router.refresh());
                // Background polling until Mux marks it ready
                pollUntilReady();

            } else {
                // STANDARD SUPABASE / LINK FLOW
                console.log("Standard Flow Initialized");
                await Promise.all([
                    addMaterialAction(formData),
                    new Promise((resolve) => setTimeout(resolve, 800))
                ]);
            }
            
            console.log("Completed successfully");
            setIsDone(true);
            formRef.current.reset();
            setSelectedType("");
            setUploadMode("link");
            setFileName("");
            
            if (onSuccess) onSuccess();
            
            // Revert success icon after 3 seconds
            setTimeout(() => setIsDone(false), 3000);

        } catch (error: any) {
            console.error("Error adding material details:", error);
            alert(`An error occurred: ${error.message || "Unknown error"}. Check console for details.`);
        } finally {
            setIsUploading(false);
            stopProgress();
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <input type="hidden" name="module_id" value={moduleId} />
            
            <div className="grid grid-cols-2 gap-2">
                <input
                    name="name"
                    required
                    placeholder="Material name *"
                    className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-slate-900/50 dark:border-white/10 px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                />
                <select
                    name="type_id"
                    title="Select material type"
                    aria-label="Select material type"
                    required
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-slate-900/50 dark:border-white/10 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                >
                    <option value="">Select type *</option>
                    {materialTypes.map((t) => (
                        <option key={t.type_id} value={t.type_id}>
                            {t.type_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Upload Mode Toggle */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-slate-800 p-1">
                <button
                    type="button"
                    onClick={() => setUploadMode("link")}
                    className={`flex-1 rounded-md py-1 text-[10px] font-bold transition ${uploadMode === "link" ? "bg-white dark:bg-slate-700 text-violet-600 shadow-sm" : "text-gray-500"}`}
                >
                    Link / URL
                </button>
                <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={`flex-1 rounded-md py-1 text-[10px] font-bold transition ${uploadMode === "file" ? "bg-white dark:bg-slate-700 text-violet-600 shadow-sm" : "text-gray-500"}`}
                >
                    File Upload
                </button>
            </div>

            {uploadMode === "file" ? (
                <div className="flex w-full items-center justify-center">
                    <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-white/10 dark:bg-slate-900/50 py-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                        <div className="flex flex-col items-center justify-center pb-1 pt-1 gap-1">
                            <Upload className={`h-4 w-4 ${fileName ? "text-violet-500" : "text-gray-400"}`} />
                            <p className="text-[10px] text-gray-500 text-center px-4">
                                {fileName ? (
                                    <span className="font-semibold text-violet-600 truncate max-w-[150px] inline-block">{fileName}</span>
                                ) : (
                                    <>
                                        <span className="font-semibold text-violet-600 focus:outline-none">Click to upload</span> or drag and drop
                                    </>
                                )}
                            </p>
                        </div>
                        <input type="file" name="file" className="hidden" onChange={handleFileChange} required />
                    </label>
                    <input type="hidden" name="url" value="pending-upload" />
                </div>
            ) : (
                <input
                    name="url"
                    required
                    placeholder="URL / link *"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 dark:bg-slate-900/50 dark:border-white/10 px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                />
            )}

            {isUploading && (
                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-violet-500 h-full w-1/3 rounded-full animate-upload-progress"></div>
                </div>
            )}

            {isProcessing && !isUploading && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Mux is encoding your video — will auto-refresh when ready
                </p>
            )}

            <button
                type="submit"
                disabled={isUploading}
                className={`flex w-full items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${isDone ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-600/20 dark:border-green-500/50 dark:text-green-400" : "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-600 dark:border-violet-500 dark:text-white hover:bg-violet-100 dark:hover:bg-violet-500"}`}
            >
                {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                    <Plus className="h-3.5 w-3.5" />
                )}
                {isUploading ? "Uploading..." : isDone ? "Material Added!" : "Add Material"}
            </button>
        </form>
    );
}
