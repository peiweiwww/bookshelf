"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { useSession, useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";

interface BookDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
}

export default function SearchPage() {
  const { session } = useSession();
  const { user } = useUser();

  const supabase = useMemo(
    () => createClerkSupabaseClient(() => session?.getToken() ?? null),
    [session]
  );

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setSearchError(null);
    setHasSearched(false);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=12`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data.docs ?? []);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setSearchError("搜索失败，请检查网络后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(book: BookDoc) {
    if (!user) return;
    setSaving((prev) => new Set(prev).add(book.key));
    try {
      const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null;

      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        title: book.title,
        author: book.author_name?.[0] ?? null,
        cover_url: coverUrl,
        ol_key: book.key,
      });

      if (error) throw error;

      setSaved((prev) => new Set(prev).add(book.key));
      showToast(`《${book.title}》已收藏`);
    } catch (err) {
      console.error(err);
      showToast("收藏失败，请重试");
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(book.key);
        return next;
      });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-8">
          搜索书籍
        </h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入书名或作者..."
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-5 py-2.5 text-sm font-medium disabled:opacity-50 hover:opacity-80 transition-opacity"
          >
            {loading ? "搜索中…" : "搜索"}
          </button>
        </form>

        {/* Results grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {results.map((book) => {
              const coverUrl = book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : null;
              const isSaved = saved.has(book.key);
              const isSaving = saving.has(book.key);

              return (
                <div
                  key={book.key}
                  className="flex flex-col gap-3 bg-white dark:bg-zinc-900 rounded-xl p-3 shadow-sm"
                >
                  {/* Cover */}
                  <div className="relative aspect-[2/3] w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-400 text-xs text-center px-2">
                        无封面
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2">
                      {book.title}
                    </p>
                    {book.author_name?.[0] && (
                      <p className="text-xs text-zinc-500 line-clamp-1">
                        {book.author_name[0]}
                      </p>
                    )}
                  </div>

                  {/* Save button */}
                  <button
                    onClick={() => handleSave(book)}
                    disabled={isSaved || isSaving}
                    className="w-full rounded-lg border text-xs font-medium py-1.5 transition-colors disabled:cursor-default
                      border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300
                      hover:bg-zinc-50 dark:hover:bg-zinc-800
                      disabled:opacity-60"
                  >
                    {isSaved ? "已收藏 ✓" : isSaving ? "收藏中…" : "收藏"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {searchError && (
          <p className="text-sm text-red-500 text-center mt-16">{searchError}</p>
        )}

        {!loading && !searchError && hasSearched && results.length === 0 && (
          <p className="text-sm text-zinc-500 text-center mt-16">
            没有找到相关书籍
          </p>
        )}
      </div>
    </div>
  );
}
