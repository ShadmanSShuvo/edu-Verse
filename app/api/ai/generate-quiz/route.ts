import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { createQuestion } from '@/db/question';
import { createExam } from '@/db/exam';

export async function POST(req: Request) {
    try {
        const { prompt, exam_id, module_id, title, num_questions, duration, marks } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Missing 'prompt'" }, { status: 400 });
        }

        let targetExamId = exam_id;

        // If module_id and title are provided, create a new exam first
        if (!targetExamId && module_id && title) {
            const newExam = await createExam(
                Number(module_id), 
                title, 
                Number(marks) || 0, 
                Number(duration) || 0
            );
            targetExamId = newExam.exam_id;
        }

        if (!targetExamId) {
            return NextResponse.json({ error: "Missing 'exam_id' or enough info to create one" }, { status: 400 });
        }

        const count = Number(num_questions) || 5;

        const { object } = await generateObject({
            model: google('gemini-pro-latest'),
            maxRetries: 0, 
            schema: z.object({
                questions: z
                    .array(
                        z.object({
                            ques_statement: z.string().describe("The statement or the question being asked."),
                            options: z
                                .array(z.string())
                                .length(4)
                                .describe("An array of exactly 4 possible multiple choice answers."),
                            correct_ans: z
                                .string()
                                .describe(
                                    "The exact text of the correct option. It MUST precisely match one of the string elements in the options array."
                                ),
                        })
                    )
                    .describe(`A list of ${count} multiple choice questions.`),
            }),
            prompt: `Based on the following learning material, generate ${count} multiple-choice questions. \n\nMaterial:\n${prompt}`,
        });

        const parsedQuestions = object.questions;

        // Use createQuestion to insert into database
        const createdQuestions = [];
        for (const q of parsedQuestions) {
            const inserted = await createQuestion(
                Number(targetExamId),
                q.ques_statement,
                JSON.stringify(q.options),
                q.correct_ans
            );
            createdQuestions.push(inserted);
        }

        return NextResponse.json({ 
            exam_id: targetExamId, 
            questions: createdQuestions 
        }, { status: 200 });
    } catch (error: any) {
        console.error("Quiz Generation Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate quiz" }, { status: 500 });
    }
}
