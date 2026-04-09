import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips, guides, and stories for families living abroad.',
};

interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
}

function getBlogPosts(): PostMeta[] {
  const dir = path.join(process.cwd(), 'content/blog');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  const posts: PostMeta[] = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
    const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
    const dateMatch = content.match(/date:\s*['"]([^'"]+)['"]/);
    return {
      slug,
      title: titleMatch?.[1] ?? slug,
      description: descMatch?.[1] ?? '',
      date: dateMatch?.[1] ?? '',
    };
  });
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="container py-20 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Blog</h1>
      <p className="text-muted-foreground mb-10">
        Tips, guides, and stories for families living abroad.
      </p>
      <div className="space-y-10">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-10">
            {post.date && (
              <time className="text-sm text-muted-foreground">
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            <h2 className="text-2xl font-semibold mt-1 mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            {post.description && (
              <p className="text-muted-foreground">{post.description}</p>
            )}
            <Link
              href={`/blog/${post.slug}`}
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
