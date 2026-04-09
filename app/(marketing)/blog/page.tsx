import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips, guides, and stories for families living abroad.',
};

const posts = [
  {
    slug: 'top-10-cities-for-families-2024',
    title: 'Top 10 Cities for Families in 2024',
    excerpt:
      'We crunched data from thousands of expat families to find the very best cities for raising kids abroad this year.',
    date: '2024-04-01',
    author: 'FamilyRoam Team',
  },
  {
    slug: 'how-to-choose-a-family-friendly-city',
    title: 'How to Choose a Family-Friendly City Abroad',
    excerpt:
      'Safety, schooling, healthcare, cost of living — here's a practical framework for making your next big move.',
    date: '2024-03-15',
    author: 'FamilyRoam Team',
  },
  {
    slug: 'visa-guide-for-digital-nomad-families',
    title: 'The Visa Guide for Digital Nomad Families',
    excerpt:
      'Navigating visas with kids in tow is tricky. This guide breaks down the best options by region.',
    date: '2024-02-28',
    author: 'FamilyRoam Team',
  },
];

export default function BlogPage() {
  return (
    <div className="container py-20 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Blog</h1>
      <p className="text-muted-foreground mb-10">
        Tips, guides, and stories for families living abroad.
      </p>
      <div className="space-y-10">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-10">
            <time className="text-sm text-muted-foreground">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <h2 className="text-2xl font-semibold mt-1 mb-2">
              <a href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </a>
            </h2>
            <p className="text-muted-foreground">{post.excerpt}</p>
            <a
              href={`/blog/${post.slug}`}
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Read more →
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
