import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function getPostMeta(slug: string) {
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
  const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
  const dateMatch = content.match(/date:\s*['"]([^'"]+)['"]/);
  return {
    title: titleMatch?.[1] ?? slug,
    description: descMatch?.[1] ?? '',
    date: dateMatch?.[1] ?? '',
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getPostMeta(slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    openGraph: { title: meta.title, description: meta.description },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) notFound();

  const meta = getPostMeta(slug)!;

  // Dynamically import the MDX file
  const { default: Content } = await import(`@/content/blog/${slug}.mdx`);

  return (
    <main className="container py-16 max-w-2xl">
      {meta.date && (
        <time className="text-sm text-muted-foreground">
          {new Date(meta.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      )}
      <article className="prose prose-neutral dark:prose-invert max-w-none mt-2">
        <Content />
      </article>
    </main>
  );
}
