import Link from "next/link";
import Image from "next/image";
import { Github, Mail, Linkedin } from "lucide-react";
import { ProjectList } from "./components/project-list";
import { BlogList } from "./components/blog-list";

export default function Page() {
	return (
		<div className="mx-auto max-w-4xl px-6 py-12">
			<main className="space-y-24">
				<section id="about" className="space-y-4">
					{/* <h2 className="text-4xl font-bold mb-8">ABOUT</h2> */}
					<p className="text-zinc-400 leading-relaxed max-w-2xl">
						Hi, I'm Nils 👋
					</p>
					<p className="text-zinc-400 leading-relaxed max-w-2xl">
						I'm a freshman at UC Davis studying Computer Science. I'm from the
						Bay Area and like building software projects in my free time.
						Recently I have also been tinkering with language model fine-tuning
						and custom evals.
					</p>
					<p className="text-zinc-400 leading-relaxed max-w-2xl">
						Goal: help humanity reach{" "}
						<a
							href="https://en.wikipedia.org/wiki/Longevity_escape_velocity"
							className="text-blue-300 underline"
						>
							longevity escape velocity
						</a>
					</p>
					<p className="text-zinc-400 leading-relaxed max-w-2xl">
						Site last updated: Jan 25, 2025
					</p>
				</section>

				<section id="currently" className="space-y-4">
					<h2 className="text-4xl font-bold mb-8">Currently</h2>

					<div className="space-y-1">
						<h3 className="text-3xl font-mono">Founder</h3>
						<Link
							href="/projects/mcmetrics"
							className="flex items-center gap-2 hover:text-primary transition-colors"
						>
							<div className="w-6 h-6 bg-zinc-800"></div>
							<span className="font-mono">MCMetrics.net</span>
						</Link>
						<p className="font-mono text-zinc-500">Nov 2022 - Present</p>
					</div>

					<div className="space-y-12">
						<div className="space-y-1">
							<h3 className="text-3xl font-mono">SWE Intern</h3>
							<Link
								href="https://orgorg.com"
								className="flex items-center gap-2 hover:text-primary transition-colors"
							>
								<div className="w-6 h-6 bg-zinc-800"></div>
								<span className="font-mono">OrgOrg</span>
							</Link>
							<p className="font-mono text-zinc-500">May 2024 - Present</p>
						</div>

						<div className="space-y-1">
							<h3 className="text-3xl font-mono">Project Manager</h3>
							<Link
								href="https://www.codelabdavis.com/"
								className="flex items-center gap-2 hover:text-primary transition-colors"
							>
								<div className="w-6 h-6 bg-zinc-800"></div>
								<span className="font-mono">Codelab@Davis</span>
							</Link>
							<p className="font-mono text-zinc-500">Jan 2025 - Present</p>
						</div>

						<div className="space-y-1">
							<h3 className="text-3xl font-mono">
								Freshman - Computer Science
							</h3>
							<Link
								href="https://cs.ucdavis.edu/"
								className="flex items-center gap-2 hover:text-primary transition-colors"
							>
								<div className="w-6 h-6 bg-zinc-800"></div>
								<span className="font-mono">
									UC Davis College of Engineering
								</span>
							</Link>
							<p className="font-mono text-zinc-500">Sep 2024 - Present</p>
						</div>
					</div>
				</section>

				<section id="projects" className="space-y-8">
					<h2 className="text-2xl font-mono text-zinc-500">PROJECTS</h2>
					<ProjectList
						projects={[
							{
								title: "MCMetrics (Current)",
								description: "Google Analytics SaaS for Minecraft servers",
								slug: "mcmetrics",
								technologies: ["Next.js", "Clickhouse", "ML", "LLMs"],
								website: "mcmetrics.net",
							},
							{
								title: "MCMetrics (Current)",
								description: "Analytics platform for Minecraft servers",
								slug: "mcmetrics",
								technologies: ["Next.js", "Clickhouse", "Machine Learning"],
								website: "mcmetrics.net",
							},
							{
								title: "MCMetrics (Current)",
								description: "Analytics platform for Minecraft servers",
								slug: "mcmetrics",
								technologies: ["Next.js", "TypeScript", "Machine Learning"],
								website: "mcmetrics.net",
							},
							{
								title: "MCMetrics (Current)",
								description: "Analytics platform for Minecraft servers",
								slug: "mcmetrics",
								technologies: ["Next.js", "TypeScript", "Machine Learning"],
								website: "mcmetrics.net",
							},
							// Add other projects as needed
						]}
					/>
				</section>

				<section id="blog" className="space-y-8">
					<h2 className="text-2xl font-mono text-zinc-500">BLOG</h2>
					<BlogList
						posts={[
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
							{
								title: "Implementing Real-time Analytics",
								slug: "real-time-analytics",
								date: "December 15, 2023",
							},
							{
								title: "Machine Learning in Game Analytics",
								slug: "ml-game-analytics",
								date: "December 1, 2023",
							},
							// Add more blog posts as needed
						]}
					/>
				</section>

				<section id="contact" className="space-y-8">
					<h2 className="text-2xl font-mono text-zinc-500">LINKS</h2>
					<div className="flex gap-6">
						<Link
							href="https://github.com/nf-projects"
							className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Github className="h-5 w-5" />
							<span>GitHub</span>
						</Link>
						<Link
							href="https://linkedin.com/in/nils-fleig"
							className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Linkedin className="h-5 w-5" />
							<span>LinkedIn</span>
						</Link>
						<Link
							href="mailto:nbfleig@ucdavis.edu"
							className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors"
						>
							<Mail className="h-5 w-5" />
							<span>nbfleig@ucdavis.edu</span>
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
}
