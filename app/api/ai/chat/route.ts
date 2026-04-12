// import { google } from '@ai-sdk/google';
// import { streamText } from 'ai';

// export const maxDuration = 30;

// export async function POST(req: Request) {
//     const { messages } = await req.json();

//     const result = streamText({
//         model: google('gemini-1.5-flash'),
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { saveChatMessage } from '@/db/chat';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        console.log("Chat API Key present inside route:", !!apiKey);

        if (!apiKey) {
            return NextResponse.json({
                error: "API key is missing or Next.js development server hasn't picked it up yet. Please restart your 'pnpm dev' terminal!"
            }, { status: 500 });
        }

        const session = await getSession();
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { messages } = await req.json();

        // Save the user's latest message
        const latestMessage = messages[messages.length - 1];
        if (latestMessage.role === 'user') {
            await saveChatMessage(session.user_id, 'user', latestMessage.content);
        }

        const result = streamText({
            model: google('gemini-1.5-flash'),
            messages,
            onFinish: async ({ text }) => {
                await saveChatMessage(session.user_id, 'assistant', text);
            }
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error("Chat API Error from Gemini:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch response" },
            { status: 500 }
        );
    }
}