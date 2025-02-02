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
						Recently I've been tinkering with language model fine-tuning and
						custom evals.
					</p>
					<p className="text-zinc-400 leading-relaxed max-w-2xl">
						Site last updated: February 2025
					</p>
				</section>

				<section id="currently" className="space-y-4">
					<h2 className="text-4xl font-bold mb-8">Currently</h2>

					<div className="space-y-1">
						<h3 className="text-3xl font-mono">Founder</h3>
						<Link
							href="https://mcmetrics.net"
							className="flex items-center gap-2 hover:text-primary transition-colors"
						>
							<div className="w-6 h-6 bg-zinc-800"></div>
							<span className="font-mono">mcmetrics.net</span>
						</Link>
						<p className="font-mono text-zinc-500">Nov 2022 - Present</p>
					</div>

					<div className="space-y-12">
						<div className="space-y-1">
							<h3 className="text-3xl font-mono">Software Engineering</h3>
							<Link
								href="https://orgorg.com"
								className="flex items-center gap-2 hover:text-primary transition-colors"
							>
								<div className="w-6 h-6 bg-zinc-800"></div>
								<span className="font-mono">orgorg.com</span>
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
								title: "MCMetrics.net",
								description: "Analytics platform for Minecraft servers",
								slug: "mcmetrics",
								technologies: ["Next.js", "TypeScript", "Machine Learning"],
								website: "mcmetrics.net",
							},
							{
								title: "Simple Prompt Tools Extension",
								description: "My custom workflow for development with LLMs",
								slug: "simple-prompt-tools",
								technologies: ["JavaScript", "Chrome Extension"],
							},
							{
								title: "Blocklands.org",
								description: "Skyblock Minecraft Server",
								slug: "blocklands",
								technologies: ["React", "Node.js"],
								website: "blocklands.org",
							},
						]}
					/>
				</section>

				<section id="blog" className="space-y-8">
					<h2 className="text-2xl font-mono text-zinc-500">BLOG</h2>
					<p className="text-zinc-400 leading-relaxed max-w-2xl">
						Work in progress
					</p>
					{/* <BlogList
						posts={[
							{
								title: "How I Self Host MCMetrics.net",
								slug: "self-host-mcmetrics",
								date: "February 1, 2024",
							},
							// {
							// 	title: "Simple Prompt Tools: My AI Development Workflow",
							// 	slug: "ai-development-workflow",
							// 	date: "February 5, 2024",
							// },
							{
								title:
									"Using Sentence Transformer Centroids to Detect Message Topics",
								slug: "sentence-transformer-centroids",
								date: "February 10, 2024",
							},
							{
								title: "How I Securely Let an LLM Query My Database",
								slug: "llm-query-database",
								date: "February 15, 2024",
							},
						]}
					/> */}
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
