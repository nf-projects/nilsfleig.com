import Link from "next/link";
import Image from "next/image";

export default function SimplePromptToolsPage() {
	return (
		<div className="mx-auto max-w-2xl pb-12">
			<article className="prose prose-invert prose-zinc max-w-none">
				<h1 className="text-4xl font-mono mb-2">
					Simple Prompt Tools Extension
				</h1>
				<p className="text-zinc-500 font-mono mb-6">
					A browser extension for prompt management
				</p>

				{/* Link to related project */}
				<div className="mb-6">
					<p className="text-zinc-400">Related Project:</p>
					<Link
						href="/projects/simple-prompt-tools"
						className="text-blue-500 underline"
					>
						Simple Prompt Tools
					</Link>
				</div>

				<Image
					src="https://picsum.photos/800/400"
					alt="Simple Prompt Tools"
					width={800}
					height={400}
					className="rounded-lg mb-8"
				/>

				<div className="space-y-6">
					<p className="text-zinc-300 leading-relaxed font-mono">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
						eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</p>
				</div>
			</article>
		</div>
	);
}
