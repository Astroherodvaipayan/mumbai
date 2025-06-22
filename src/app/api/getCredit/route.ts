import { NextResponse, NextRequest } from "next/server";
import { getUserById } from "@/lib/user-store";

export async function POST(req: NextRequest) {
    const data = await req.json();

    try {
        const user = getUserById(data.userId);

        if (!user) {
            return NextResponse.json({ message: "User not found" });
        }

        // Default credit value if not set
        const credit = user.credit !== undefined ? user.credit : 10;

        return NextResponse.json({ Credit: credit });
    }
    catch (err) {
        console.error("Error in getCredit API:", err);
        return NextResponse.json({ message: "Error", error: String(err) });
    }
}