export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <h1>{params.slug}</h1>
      <p>Coming soon.</p>
    </main>
  );
}
