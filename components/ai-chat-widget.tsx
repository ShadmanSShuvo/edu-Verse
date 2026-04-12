'use client';

import { useState, useRef, useEffect } from 'react';
import { type Message } from 'ai';
import { useChat } from 'ai/react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [initialMessages, setInitialMessages] = useState<Message[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: '/api/ai/chat',
        initialMessages: initialMessages,
    });

    useEffect(() => {
    // Fetch history once on mount — not on every open/close toggle.
    // Previously this re-fetched every time isOpen changed, causing duplicate API calls.
    async function fetchHistory() {
            try {
                const res = await fetch(`${window.location.origin}/api/ai/chat/history`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMessages([]);
                        setInitialMessages(data);
                        setTimeout(() => {
                            setMessages(data);
                        }, 50);
                    }
                } else {
                    // Silently fail for 401/404, or log other errors
                    if (res.status !== 401) {
                      console.warn(`Failed to fetch chat history: ${res.status}`);
                    }
                    setMessages([]);
                    setInitialMessages([]);
                }
            } catch (error) {
                console.error("Failed to load history", error);
                setMessages([]);
                setInitialMessages([]);
            } finally {
                setIsLoadingHistory(false);
            }
        }
        fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // ← empty deps: runs exactly once on mount
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                    aria-label="Open AI Assistant"
                >
                    <MessageCircle className="h-6 w-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:w-[400px]">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <Bot className="h-5 w-5" /> AI Assistant
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    if (confirm("Are you sure you want to clear your chat history?")) {
                                        await fetch('/api/ai/chat/clear', { method: 'POST' });
                                        setMessages([]);
                                        setInitialMessages([]);
                                    }
                                }}
                                className="text-[10px] font-semibold bg-white/10 px-2 py-1 rounded-md hover:bg-white/20 transition-colors"
                            >
                                Clear History
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full bg-white/10 p-1.5 transition-colors hover:bg-white/20"
                                aria-label="Close Chat"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
                        {isLoadingHistory ? (
                            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                                <Bot className="mb-2 h-8 w-8 text-violet-300 animate-pulse" />
                                <p>Loading history...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                                <Bot className="mb-2 h-8 w-8 text-violet-300" />
                                <p>Hello! How can I help you today?</p>
                            </div>
                        ) : (
                            messages.map((m: Message) => (
                                <div
                                    key={m.id}
                                    className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                        }`}
                                >
                                    <div
                                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${m.role === 'user'
                                            ? 'bg-indigo-100 text-indigo-600'
                                            : 'bg-violet-100 text-violet-600'
                                            }`}
                                    >
                                        {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                                            } whitespace-pre-wrap`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex items-start gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                    <Bot className="h-4 w-4 animate-pulse" />
                                </div>
                                <div className="flex min-h-[36px] items-center gap-1 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-2 text-gray-500 shadow-sm">
                                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }} />
                                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-2 border-t border-gray-100 bg-white p-3"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Ask me anything..."
                            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
