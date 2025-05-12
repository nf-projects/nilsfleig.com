"use client";

import { useState } from "react";
import Link from "next/link";

interface Project {
	title: string;
	description: string;
	slug: string;
	technologies: string[];
	website?: string;
}

interface ProjectListProps {
	projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
	const [showAll, setShowAll] = useState(false);

	return (
		<div className="space-y-3">
			{projects.slice(0, 2).map((project) => (
				<ProjectCard key={project.slug} project={project} />
			))}

			{!showAll && projects.length > 2 && (
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/70 to-zinc-950 pointer-events-none" />
					<ProjectCard project={projects[2]} />
					<button
						onClick={() => setShowAll(true)}
						className="absolute inset-x-0 bottom-0 w-full py-3 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent text-white font-mono hover:from-zinc-900 hover:via-zinc-900/90 transition-colors"
					>
						View all projects
					</button>
				</div>
			)}

			{showAll &&
				projects
					.slice(2)
					.map((project) => (
						<ProjectCard key={project.slug} project={project} />
					))}
		</div>
	);
}

function ProjectCard({ project }: { project: Project }) {
	return (
		<Link
			href={`/projects/${project.slug}`}
			className="block p-4 rounded-lg bg-zinc-900 hover:bg-zinc-800/50 transition-colors"
		>
			<div className="space-y-2">
				<h3 className="text-2xl font-mono">{project.title}</h3>
				<p className="text-zinc-500 font-mono text-sm">{project.description}</p>
				<div className="flex flex-wrap gap-1">
					{project.technologies.map((tech) => (
						<span
							key={tech}
							className="px-2 py-0.5 bg-zinc-800 rounded-full text-xs font-mono"
						>
							{tech}
						</span>
					))}
				</div>
				<div className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
					<span className="text-xs font-mono underline">Click for details</span>
				</div>
			</div>
		</Link>
	);
}
