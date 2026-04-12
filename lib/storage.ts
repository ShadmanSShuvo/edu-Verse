const BUCKET_NAME = "eduVerse-materials";
const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_SIZE_MB = 5;

export async function uploadAvatar(file: File, userId: number): Promise<string> {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Supabase environment variables are not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
        throw new Error(`File too large. Maximum allowed size is ${MAX_AVATAR_SIZE_MB}MB.`);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed for avatars.");
    }

    const ext = file.name.split(".").pop() || "jpg";
    // Overwrite same path per user so old avatars are replaced automatically
    const filePath = `user-${userId}/avatar.${ext}`;

    const url = `${SUPABASE_URL}/storage/v1/object/${AVATAR_BUCKET}/${filePath}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": file.type,
            "x-upsert": "true", // overwrite existing avatar
        },
        body: Buffer.from(await file.arrayBuffer()),
    });

    if (!response.ok) {
        let errMsg: string;
        try {
            const json = await response.json();
            if (json.error === "Bucket not found") {
                errMsg = `The '${AVATAR_BUCKET}' storage bucket does not exist. Please create a public bucket named '${AVATAR_BUCKET}' in your Supabase dashboard under Storage.`;
            } else {
                errMsg = json.message || JSON.stringify(json);
            }
        } catch {
            errMsg = await response.text();
        }
        throw new Error(errMsg);
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/${filePath}`;
}

export async function uploadToSupabase(file: File, bucketParam?: string): Promise<string> {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase configuration");
    }

    const bucket = bucketParam || BUCKET_NAME;
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/\s+/g, "_");
    const filePath = `${timestamp}-${cleanFileName}`;

    const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": file.type || "application/octet-stream",
            "x-upsert": "true",
        },
        body: Buffer.from(await file.arrayBuffer()),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload to Supabase: ${error}`);
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
}
