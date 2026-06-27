import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import T from "@/components/ui/T";

export const revalidate = 60;

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) notFound();

  const more = await prisma.blogPost.findMany({
    where: { published: true, slug: { not: post.slug } },
    take: 3,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <Link href="/blog" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink mb-6 transition-colors">
        <ArrowLeft size={15} /> <T k="blog.theJournal" />
      </Link>

      <span className="text-[10px] tracking-[0.18em] uppercase font-medium text-gold border border-gold/30 bg-gold/5 px-2.5 py-1 rounded-full">
        {post.category}
      </span>

      <h1 className="font-serif text-4xl sm:text-5xl font-light text-ink mt-4 mb-4 leading-tight">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-ink-faint font-light mb-8">
        <span>{post.author}</span>
        <span>·</span>
        <span>{post.date}</span>
        <span>·</span>
        <span>{post.readTime} <T k="blog.read" /></span>
      </div>

      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-10">
        <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
      </div>

      <div className="space-y-5">
        {post.content.map((para, i) => (
          <p key={i} className="text-base text-ink-muted font-light leading-relaxed">{para}</p>
        ))}
      </div>

      {more.length > 0 && (
        <div className="mt-16 pt-10 border-t border-line">
          <h2 className="font-serif text-2xl font-light text-ink mb-6"><T k="detail.moreFromJournal" /></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {more.map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-3">
                  <Image src={p.image} alt={p.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="text-[10px] tracking-[0.12em] uppercase text-gold mb-1">{p.category}</p>
                <h3 className="font-serif text-base font-light text-ink leading-snug group-hover:text-gold transition-colors">{p.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
