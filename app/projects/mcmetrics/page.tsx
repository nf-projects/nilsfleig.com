import Link from "next/link";
import Image from "next/image";
import { Statistics } from "@/app/components/statistics";

export default function MCMetricsPage() {
	return (
		<div className="mx-auto max-w-2xl pb-12">
			<article className="prose prose-invert prose-zinc max-w-none">
				<h1 className="text-4xl font-mono mb-2">MCMetrics</h1>
				<p className="text-zinc-500 font-mono mb-6">
					Analytics platform for Minecraft servers, 3 million + users tracked
				</p>

				<Statistics />

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
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					"Google Analytics for Minecraft servers"
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					Minecraft is a massive industry of hundreds of businesses operating
					Minecraft servers (essentially creating games on top of Minecraft)
					with revenue ranging from a few thousand dollars to tens of millions
					of dollars.
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					But business intelligence tools in this industry are about 20 years
					behind. I know this because I used to run my own server.
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					MCMetrics offers a business intelligence dashboard to give Minecraft
					servers access to the same level of analytics that a large tech
					company would have:
				</p>
				<ul className="list-disc pl-6 space-y-2 mt-3">
					<li>Player Activity Metrics, Retention Curve, etc.</li>
					<li>A/B Testing Suite</li>
					<li>Marketing campaign attribution & measuring</li>
					<li>AI natural language queries</li>
				</ul>
				<h2 className="text-2xl font-mono mt-8">Technical Details</h2>
				<Image
					src="/images/mcmetrics_architecture.png"
					alt="MCMetrics Dashboard"
					width={1896}
					height={1460}
					className="rounded-lg"
				/>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					MCMetrics's tech stack is modern, simple, cheap, and fast. Everything
					is self-hosted on Ubuntu machines to avoid ridiculously high cloud
					costs (except for Vercel's free plan for the dashboard frontend). All
					data is constantly backed up incrementally and every service has
					1-click deployment with Github Actions.
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">Java Gradle Plugin:</b> This plugin is
					installed on the Minecraft server by my customers. It constantly sends
					data to the ingest API so it can be queried for the dashboard.
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">Express Ingest Server:</b> Authenticates
					requests from the plugin and stores it in the Clickhouse database. It
					also queues machine learning inference (Atlas) for some data points
					and converts IP addresses to latitude/longitude coordinates. Handles
					10s of thousands of requests per second.
				</p>

				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">Atlas ML:</b> Some data points need
					additional features to be calculated. For example, chat messages need
					to have sentiment analysis, toxicity levels, and topics extracted.
					This runs on a separate server which uses public HF models and custom
					models.
				</p>

				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">Clickhouse Analytical DB:</b> Self-hosted
					Clickhouse is the perfect choice for this use case because it's cheap,
					unbelievably fast even with hundreds of QPS, has storage detached from
					compute, and has great backup solutions.
				</p>

				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">Supabase Transactional DB:</b> Supabase
					handles customer data, business logic, authentication, storage, and
					other transactional data.
				</p>

				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">Next.js Dashboard</b> The customer-facing
					dashboard uses Next.js because it's fast and speeds up development.
					The UI uses Shadcn and Tailwind for a minimalistic feel. Pages are
					server rendered but fetch data from client components using server
					actions.
				</p>
				<h2 className="text-2xl font-mono mt-8">History of MCMetrics</h2>
				<ul className="list-disc pl-6 space-y-2">
					<li>Late 2022: Started working on the first prototype</li>
					<li>April 2023: Launched the first beta test of MCMetrics V1</li>
					<li>June 2023: Launched MCMetrics V1</li>
					<li>August 2024: Started working on a complete recode (V2)</li>
					<li>January 2025: Launched MCMetrics V2</li>
				</ul>
			</article>
		</div>
	);
}
