"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarWithSuggestionsProps {
  initialValue?: string;
  subject?: string;
}

export function SearchBarWithSuggestions({
  initialValue = "",
  subject = "",
}: SearchBarWithSuggestionsProps) {
  const [q, setQ] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state with initialValue when it changes (e.g. URL change)
  useEffect(() => {
    setQ(initialValue);
  }, [initialValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (q.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(q)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [q]);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    // Keep subject if it exists
    if (subject) {
      params.set("subject", subject);
    }
    
    router.push(`/courses?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      if (highlightedIndex > -1) {
        const selected = suggestions[highlightedIndex];
        setQ(selected);
        handleSearch(selected);
      } else {
        handleSearch(q);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition shadow-sm">
        <div className="relative flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setShowSuggestions(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search courses, instructors…"
          className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 font-medium"
          autoComplete="off"
        />
        <button
          onClick={() => handleSearch(q)}
          className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-700 transition shadow-sm active:scale-95"
        >
          Search
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                  index === highlightedIndex
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setQ(suggestion);
                  handleSearch(suggestion);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
                  index === highlightedIndex ? "bg-violet-100" : "bg-gray-100"
                }`}>
                  <Search className={`h-3 w-3 ${
                    index === highlightedIndex ? "text-violet-600" : "text-gray-400"
                  }`} />
                </div>
                <span className="flex-1 truncate">{suggestion}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-50 bg-gray-50/50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Suggestions
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
