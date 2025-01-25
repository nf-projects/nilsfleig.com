import Link from "next/link"
import Image from "next/image"
import { Github, Mail, Linkedin } from "lucide-react"
import { ProjectList } from "./components/project-list"

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          JD
        </Link>
        <nav className="flex gap-6">
          <Link href="#about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link href="#projects" className="hover:text-primary transition-colors">
            Projects
          </Link>
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <Link href="#contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>
      </header>

      <main className="space-y-24">
        <section id="currently" className="space-y-4">
          <h2 className="text-4xl font-bold mb-8">CURRENTLY</h2>

          <div className="space-y-12">
            <div className="space-y-1">
              <h3 className="text-3xl font-mono">Software Engineer Intern</h3>
              <Link href="https://orgorg.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <div className="w-6 h-6 bg-zinc-800"></div>
                <span className="font-mono">OrgOrg</span>
                <span className="font-mono text-zinc-500">New York</span>
              </Link>
              <p className="font-mono text-zinc-500">2024 - Present</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl font-mono">Founder</h3>
              <Link href="/projects/mcmetrics" className="flex items-center gap-2 hover:text-primary transition-colors">
                <div className="w-6 h-6 bg-zinc-800"></div>
                <span className="font-mono">MCMetrics</span>
                <span className="font-mono text-zinc-500">Remote</span>
              </Link>
              <p className="font-mono text-zinc-500">2023 - Present</p>
            </div>
          </div>
        </section>

        <section id="about" className="space-y-4">
          <h2 className="text-4xl font-bold mb-8">ABOUT</h2>
          <p className="text-zinc-400 leading-relaxed max-w-2xl">
            I'm a full-stack developer with a passion for building beautiful, functional, and user-friendly
            applications. I specialize in React, Next.js, and Node.js, with a strong focus on creating performant and
            accessible web experiences.
          </p>
        </section>

        <section id="projects" className="space-y-8">
          <h2 className="text-2xl font-mono text-zinc-500">PROJECTS</h2>
          <ProjectList projects={projects} />
        </section>

        <section id="blog" className="space-y-8">
          <h2 className="text-2xl font-mono text-zinc-500">BLOG</h2>
          <div className="space-y-4">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block space-y-1 group">
                <h3 className="text-xl font-mono group-hover:text-primary group-hover:underline transition-colors">
                  {post.title}
                </h3>
                <p className="text-zinc-500 font-mono">{post.date}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="contact" className="space-y-8">
          <h2 className="text-2xl font-mono text-zinc-500">CONTACT</h2>
          <div className="flex gap-6">
            <Link
              href="https://github.com"
              className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </Link>
            <Link
              href="https://linkedin.com"
              className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-5 w-5" />
              <span>LinkedIn</span>
            </Link>
            <Link
              href="mailto:hello@example.com"
              className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span>Email</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

const projects = [
  {
    title: "MCMetrics",
    description: "Analytics platform for Minecraft servers",
    slug: "mcmetrics",
    technologies: ["Next.js", "TypeScript", "Machine Learning"],
    website: "mcmetrics.net",
  },
  {
    title: "OrgOrg Project",
    description: "Internal developer tools and automation",
    slug: "orgorg",
    technologies: ["Python", "AWS", "DevOps"],
  },
  {
    title: "Portfolio 3.0",
    description: "Personal portfolio website built with Next.js and TailwindCSS",
    slug: "portfolio",
    technologies: ["Next.js", "TailwindCSS", "TypeScript"],
  },
  {
    title: "Weather App",
    description: "Real-time weather tracking application with global coverage",
    slug: "weather",
    technologies: ["React", "OpenWeather API", "ChartJS"],
  },
  {
    title: "Task Manager",
    description: "Collaborative task management platform for remote teams",
    slug: "task-manager",
    technologies: ["Vue.js", "Firebase", "TailwindCSS"],
  },
]

const blogPosts = [
  {
    title: "Building a Scalable Analytics Platform",
    slug: "building-scalable-analytics",
    date: "January 15, 2024",
  },
  {
    title: "The Future of Developer Tools",
    slug: "future-of-developer-tools",
    date: "January 1, 2024",
  },
]

