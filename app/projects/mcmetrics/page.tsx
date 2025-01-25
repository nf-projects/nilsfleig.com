import Link from "next/link";
import Image from "next/image";

export default function MCMetricsPage() {
	return (
		<div className="mx-auto max-w-2xl pb-12">
			<article className="prose prose-invert prose-zinc max-w-none">
				<h1 className="text-4xl font-mono mb-2">MCMetrics</h1>
				<p className="text-zinc-500 font-mono mb-6">
					Analytics platform for Minecraft servers
				</p>

				<div className="mb-6">
					<p className="text-zinc-400">Related Blog Posts:</p>
					<ul className="list-disc pl-6">
						<li>
							<Link
								href="/blog/self-host-mcmetrics"
								className="text-blue-500 underline"
							>
								How I Self Host MCMetrics.net
							</Link>
						</li>
						<li>
							<Link
								href="/blog/sentence-transformer-centroids"
								className="text-blue-500 underline"
							>
								Using Sentence Transformer Centroids to Detect Message Topics
							</Link>
						</li>
						<li>
							<Link
								href="/blog/llm-query-database"
								className="text-blue-500 underline"
							>
								How I Securely Let an LLM Query My Database
							</Link>
						</li>
					</ul>
				</div>

				<div className="flex flex-wrap gap-2 mb-8">
					{["Next.js", "TypeScript", "Machine Learning"].map((tech) => (
						<span
							key={tech}
							className="px-3 py-1 bg-zinc-800 rounded-full text-sm font-mono"
						>
							{tech}
						</span>
					))}
				</div>

				<Link
					href="https://mcmetrics.net"
					className="text-zinc-400 hover:text-white underline font-mono block mb-12"
					target="_blank"
					rel="noopener noreferrer"
				>
					mcmetrics.net
				</Link>

				<Image
					src="/projects/mcmetrics/dashboard.png"
					alt="MCMetrics Dashboard"
					width={800}
					height={400}
					className="rounded-lg mb-8"
				/>

				<div className="space-y-6">
					<p className="text-zinc-300 leading-relaxed font-mono">
						MCMetrics is an analytics platform designed specifically for
						Minecraft servers, providing deep insights into player behavior,
						server performance, and community engagement.
					</p>

					<h2 className="text-2xl font-mono mt-8">Key Features</h2>
					<ul className="list-disc pl-6 space-y-2">
						<li>Real-time player tracking</li>
						<li>Performance metrics and optimization suggestions</li>
						<li>Community engagement analytics</li>
						<li>Custom event tracking</li>
					</ul>

					<h2 className="text-2xl font-mono mt-8">Technical Implementation</h2>
					<p className="text-zinc-300 leading-relaxed font-mono">
						The platform is built using Next.js and TypeScript, with a focus on
						performance and scalability. Machine learning models are used to
						predict player behavior and identify patterns in server performance.
					</p>
				</div>
			</article>
		</div>
	);
}
