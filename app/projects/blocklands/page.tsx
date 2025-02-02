import Link from "next/link";
import Image from "next/image";

export default function BlocklandsPage() {
	return (
		<div className="mx-auto max-w-2xl pb-12">
			<article className="prose prose-invert prose-zinc max-w-none">
				<h1 className="text-4xl font-mono mb-2">Blocklands.org</h1>
				<p className="text-zinc-500 font-mono mb-6">
					Skyblock Minecraft Server
				</p>

				<div className="flex flex-wrap gap-2 mb-8">
					{["React", "Node.js"].map((tech) => (
						<span
							key={tech}
							className="px-3 py-1 bg-zinc-800 rounded-full text-sm font-mono"
						>
							{tech}
						</span>
					))}
				</div>

				<Link
					href="https://blocklands.org"
					className="text-zinc-400 hover:text-white underline font-mono block mb-12"
					target="_blank"
					rel="noopener noreferrer"
				>
					blocklands.org
				</Link>

				{/* <Image
					src="https://picsum.photos/800/400"
					alt="Blocklands"
					width={800}
					height={400}
					className="rounded-lg mb-8"
				/> */}

				<div className="space-y-6">
					<p className="text-zinc-300 leading-relaxed font-mono">
						Blocklands was a Skyblock Minecraft server that I ran from
						2021-2024. I advertised it with organic TikTok & Youtube videos
						which reached over 20 million people. More than 100,000 unique
						players from around the world played on this server across hundreds
						of thousands of playtime hours.
					</p>

					<p className="text-zinc-300 leading-relaxed font-mono">
						I wrote over 70,000 lines of Java code for the gameplay on
						Blocklands and coordinated freelance and part time developers and
						asset artists for gameplay updates. Blocklands was monetized with
						in-game cosmetic and gameplay items which were purchased by over
						1,000 unique paying users.
					</p>
				</div>
			</article>
		</div>
	);
}
