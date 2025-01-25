import Image from "next/image";

export default function BuildingScalableAnalyticsBlog() {
	return (
		<div className="mx-auto max-w-2xl pb-12">
			<article className="prose prose-invert prose-zinc max-w-none">
				<h1 className="text-4xl font-mono mb-2">
					Building a Scalable Analytics Platform
				</h1>
				<p className="text-zinc-500 font-mono mb-12">January 15, 2024</p>

				<Image
					src="https://picsum.photos/800/400"
					alt="Analytics Dashboard"
					width={800}
					height={400}
					className="rounded-lg mb-8"
				/>

				<div className="space-y-6">
					<p className="text-zinc-300 leading-relaxed font-mono">
						Building scalable analytics platforms presents unique challenges
						that require careful consideration of architecture, data storage,
						and processing capabilities. In this post, I'll share my experience
						building MCMetrics, an analytics platform for Minecraft servers.
					</p>

					<h2 className="text-2xl font-mono mt-8">Key Requirements</h2>
					<ul className="list-disc pl-6 space-y-2">
						<li>Real-time data processing</li>
						<li>Horizontal scalability</li>
						<li>Cost-effective storage solutions</li>
						<li>Reliable data aggregation</li>
					</ul>

					{/* Add more content sections as needed */}
				</div>
			</article>
		</div>
	);
}
