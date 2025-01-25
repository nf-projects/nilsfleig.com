import Link from "next/link"
import Image from "next/image"

interface BlogPost {
  title: string
  date: string
  content: string
  image: string
}

const blogPosts: Record<string, BlogPost> = {
  "building-scalable-analytics": {
    title: "Building a Scalable Analytics Platform",
    date: "January 15, 2024",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8DGF1Q6X0YI1T1LVBjCJ4OQFmTzRHu.png",
    content: `
      Building scalable analytics platforms presents unique challenges that require careful consideration of architecture, data storage, and processing capabilities. In this post, I'll share my experience building MCMetrics, an analytics platform for Minecraft servers.

      When approaching this problem, I identified several key requirements:

      1. Real-time data processing
      2. Horizontal scalability
      3. Cost-effective storage solutions
      4. Reliable data aggregation

      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8DGF1Q6X0YI1T1LVBjCJ4OQFmTzRHu.png"
        alt="Analytics Dashboard"
        width={600}
        height={400}
        className="my-8 rounded-lg"
      />

      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    `,
  },
  "future-of-developer-tools": {
    title: "The Future of Developer Tools",
    date: "January 1, 2024",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bEaWMjzr62wirFd6KTASeC7bmF9fIm.png",
    content: `
      As we move into 2024, the landscape of developer tools is rapidly evolving. With the rise of AI-powered development assistants and cloud-native development environments, we're seeing a fundamental shift in how developers work.

      Key trends to watch:

      1. AI-powered code completion and generation
      2. Cloud development environments
      3. Integrated testing and deployment pipelines
      4. Cross-platform development tools

      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bEaWMjzr62wirFd6KTASeC7bmF9fIm.png"
        alt="Developer Tools"
        width={600}
        height={400}
        className="my-8 rounded-lg"
      />

      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    `,
  },
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug]

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="inline-block mb-12 text-zinc-500 hover:text-primary transition-colors font-mono">
          ← Back
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          <h1 className="text-4xl font-mono mb-2">{post.title}</h1>
          <p className="text-zinc-500 font-mono mb-12">{post.date}</p>

          {post.content.split("\n\n").map((paragraph, index) => {
            if (paragraph.startsWith("<Image")) {
              return <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
            }
            return (
              <p key={index} className="text-zinc-300 leading-relaxed mb-6 font-mono">
                {paragraph}
              </p>
            )
          })}
        </article>
      </div>
    </div>
  )
}

