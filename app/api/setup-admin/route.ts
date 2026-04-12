import { NextResponse } from "next/server";
import { createUser } from "@/db/users";
import { getRoleByName, createRole, assignRoleToUser } from "@/db/roles";
import { hashPassword, generateSalt } from "@/lib/password";

export async function POST(req: Request) {
    try {
        const { name, email, password, secretKey } = await req.json();

        // Protect this route from public access using a secret key
        if (secretKey !== process.env.ADMIN_SETUP_SECRET) {
            return NextResponse.json({ error: "Unauthorized. Invalid secret key." }, { status: 401 });
        }

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Ensure 'admin' role exists
        let adminRole = await getRoleByName("admin");
        if (!adminRole) {
            adminRole = await createRole("admin");
        }

        // 2. Hash the password
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);

        // 3. Create the user
        const user = await createUser(name, email, hashedPassword, salt);
        if (!user) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        // 4. Assign Admin role
        await assignRoleToUser(user.user_id, adminRole.role_id);

        return NextResponse.json({
            success: true,
            message: "Admin created successfully!",
            user_id: user.user_id
        });

    } catch (error: any) {
        console.error("Setup Admin Error:", error);
        return NextResponse.json({
            error: error.message || "Server Error",
            stack: error.stack,
            fullError: error
        }, { status: 500 });
    }
}
