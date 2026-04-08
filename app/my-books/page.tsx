"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSession, useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";

interface Favorite {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  ol_key: string;
  created_at: string;
}

export default function MyBooksPage() {
  const { session } = useSession();
  const { user } = useUser();

  const supabase = useMemo(
    () => createClerkSupabaseClient(() => session?.getToken() ?? null),
    [session]
  );

  const [books, setBooks] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setBooks(data ?? []);
        setLoading(false);
      });
  }, [user, supabase]);

  async function handleDelete(id: string) {
    setDeleting((prev) => new Set(prev).add(id));
    const { error } = await supabase.from("favorites").delete().eq("id", id);
    if (!error) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
    setDeleting((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          我的收藏
        </h1>
        {!loading && (
          <p className="mt-1 text-sm text-zinc-500">
            {books.length} 本书
          </p>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      )}

      {!loading && books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-4xl">📚</p>
          <p className="mt-4 text-base font-medium text-zinc-700 dark:text-zinc-300">
            还没有收藏任何书籍
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            去{" "}
            <a href="/search" className="underline underline-offset-2 hover:text-zinc-700">
              搜索
            </a>{" "}
            找一些喜欢的书吧
          </p>
        </div>
      )}

      {!loading && books.length > 0 && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {books.map((book) => (
            <div key={book.id} className="group flex flex-col gap-3">
              {/* Cover */}
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-100 shadow-sm dark:bg-zinc-800">
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                    无封面
                  </div>
                )}

                {/* Delete overlay */}
                <div className="absolute inset-0 flex items-end p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(book.id)}
                    disabled={deleting.has(book.id)}
                    className="w-full rounded-lg bg-red-600 py-1.5 text-xs font-medium text-white opacity-90 transition hover:opacity-100 disabled:opacity-60"
                  >
                    {deleting.has(book.id) ? "删除中…" : "删除"}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-0.5">
                <p className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {book.title}
                </p>
                {book.author && (
                  <p className="line-clamp-1 text-xs text-zinc-400">
                    {book.author}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
