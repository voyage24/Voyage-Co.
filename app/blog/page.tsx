"use client";

import Link from "next/link";
import { BLOG_POSTS } from "@/lib/mock-data";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function BlogPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="text-center mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{t("blog.theJournal")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{t("blog.storiesInspiration")}</h1>
        <p className="text-ink-muted font-light">{t("blog.subtitle")}</p>
      </div>

      {/* Featured */}
      <Link href={`/blog/${BLOG_POSTS[0].slug}`} className="block bg-vc-800 rounded-2xl p-6 sm:p-10 mb-10 border border-vc-700 hover:border-[#b09e74]/50 transition-colors group">
        <span className="text-[10px] tracking-[0.18em] uppercase text-[#b09e74] border border-[#b09e74]/40 px-3 py-1 rounded-sm">{t("blog.featured")}</span>
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#ece7dd] mt-4 mb-2 group-hover:text-[#b09e74] transition-colors">{BLOG_POSTS[0].title}</h2>
        <p className="text-[#9aa4ab] text-sm mb-4 font-light max-w-2xl leading-relaxed">{BLOG_POSTS[0].excerpt}</p>
        <div className="flex items-center gap-4 text-xs text-[#687781]">
          <span>{BLOG_POSTS[0].date}</span>
          <span>·</span>
          <span>{BLOG_POSTS[0].readTime} {t("blog.read")}</span>
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BLOG_POSTS.slice(1).map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-panel rounded-2xl border border-line hover:border-gold/40 shadow-card transition-colors p-6 cursor-pointer group">
            <span className="text-[10px] tracking-[0.12em] uppercase font-medium text-gold border border-gold/30 bg-gold/5 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
            <h3 className="font-serif text-xl font-light text-ink mt-3 mb-2 leading-snug group-hover:text-gold transition-colors">{post.title}</h3>
            <p className="text-sm text-ink-muted line-clamp-2 mb-4 font-light">{post.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-ink-faint font-light">
              <span>{post.date}</span>
              <span>{post.readTime} {t("blog.read")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
