'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Target, Trophy, Clock, GraduationCap, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AutoQuizProps {
    modules: { 
        module_id: number; 
        title: string; 
        course_title: string;
    }[];
}

const inputCls = "w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/20 transition";

export function AutoQuizGenerator({ modules }: AutoQuizProps) {
    const [moduleId, setModuleId] = useState('');
    const [title, setTitle] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [duration, setDuration] = useState(30);
    const [marks, setMarks] = useState(10);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleId || !prompt || !title) return;

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/ai/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module_id: parseInt(moduleId, 10),
                    title,
                    num_questions: numQuestions,
                    duration,
                    marks,
                    prompt,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate quiz');
            }

            setMessage(`Successfully created exam "${title}" with ${numQuestions} AI questions!`);
            setPrompt('');
            setTitle('');
            router.refresh(); 
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (modules.length === 0) return null;

    return (
        <div className="mt-8 rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-gradient-to-b from-violet-50/50 to-white dark:from-violet-500/5 dark:to-slate-900/40 p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-none">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">AI Exam Generator</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Automate your quiz creation process with Gemini AI</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Select Module *
                        </label>
                        <select
                            value={moduleId}
                            onChange={(e) => setModuleId(e.target.value)}
                            required
                            className={inputCls}
                        >
                            <option value="" className="dark:bg-slate-900">Choose a module to add exam to...</option>
                            {modules.map((m) => (
                                <option key={m.module_id} value={m.module_id} className="dark:bg-slate-900">
                                    {m.course_title} › {m.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Exam Title *
                        </label>
                        <div className="relative">
                           <Trophy className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                           <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="e.g. Midterm Quiz on Chapter 1"
                                className={`${inputCls} pl-10`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Number of Questions
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                            required
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Time Limit (minutes)
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                required
                                className={`${inputCls} pl-10`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Total Marks
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={marks}
                            onChange={(e) => setMarks(parseInt(e.target.value))}
                            required
                            className={inputCls}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Topic or Content Prompt *
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        required
                        rows={5}
                        placeholder="Paste course content here or describe the topics. AI will generate questions based on this..."
                        className="w-full resize-none rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/20 transition"
                    />
                </div>

                {message && (
                    <div className={`flex items-center gap-2 rounded-lg p-3 text-xs font-semibold ${message.startsWith('Error') ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                        <Target className="h-4 w-4" />
                        {message}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-sm font-bold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Generating Exam...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" /> Generate Exam with AI
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
