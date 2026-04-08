import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase-server";

interface Favorite {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: books } = await supabase
    .from("favorites")
    .select("id, title, author, cover_url")
    .order("created_at", { ascending: false });

  const list: Favorite[] = books ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          班级书架
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          同学们收藏的书籍 · {list.length} 本
        </p>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-4xl">📖</p>
          <p className="mt-4 text-base font-medium text-zinc-700 dark:text-zinc-300">
            书架还是空的
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            去{" "}
            <a
              href="/search"
              className="underline underline-offset-2 hover:text-zinc-700"
            >
              搜索
            </a>{" "}
            添加第一本书吧
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((book) => (
            <div key={book.id} className="group flex flex-col gap-3">
              {/* Cover */}
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-100 shadow-sm transition-shadow group-hover:shadow-md dark:bg-zinc-800">
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                    无封面
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-0.5">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-50">
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
