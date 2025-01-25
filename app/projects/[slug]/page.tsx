import Link from "next/link"

interface Project {
  title: string
  description: string
  content: string
  technologies: string[]
  website?: string
}

const projects: Record<string, Project> = {
  mcmetrics: {
    title: "MCMetrics",
    description: "Analytics platform for Minecraft servers",
    technologies: ["Next.js", "TypeScript", "Machine Learning"],
    website: "mcmetrics.net",
    content: `
      MCMetrics is an analytics platform designed specifically for Minecraft servers, providing deep insights into player behavior, server performance, and community engagement.

      Key Features:

      1. Real-time player tracking
      2. Performance metrics and optimization suggestions
      3. Community engagement analytics
      4. Custom event tracking

      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

      Technical Implementation:

      The platform is built using Next.js and TypeScript, with a focus on performance and scalability. Machine learning models are used to predict player behavior and identify patterns in server performance.

      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    `,
  },
  orgorg: {
    title: "OrgOrg Project",
    description: "Internal developer tools and automation",
    technologies: ["Python", "AWS", "DevOps"],
    content: `
      OrgOrg Project is a suite of internal developer tools and automation solutions designed to streamline development workflows and improve team productivity.

      Key Features:

      1. Automated deployment pipelines
      2. Development environment management
      3. Code quality monitoring
      4. Infrastructure as Code templates

      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

      Technical Implementation:

      The project leverages Python for automation scripts, AWS for cloud infrastructure, and modern DevOps practices for continuous integration and deployment.

      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    `,
  },
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects[params.slug]

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="inline-block mb-12 text-zinc-500 hover:text-primary transition-colors font-mono">
          ← Back
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          <h1 className="text-4xl font-mono mb-2">{project.title}</h1>
          <p className="text-zinc-500 font-mono mb-6">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.technologies.map((tech) => (
              <span key={tech} className="px-3 py-1 bg-zinc-800 rounded-full text-sm font-mono">
                {tech}
              </span>
            ))}
          </div>

          {project.website && (
            <Link
              href={`https://${project.website}`}
              className="text-zinc-400 hover:text-white underline font-mono block mb-12"
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.website}
            </Link>
          )}

          {project.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-zinc-300 leading-relaxed mb-6 font-mono">
              {paragraph}
            </p>
          ))}
        </article>
      </div>
    </div>
  )
}

