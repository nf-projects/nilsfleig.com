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
					Super simple VSCode extension for AI development
				</p>

				<Link
					href="https://github.com/nf-projects/simple-prompt-tools"
					className="text-zinc-400 hover:text-white underline font-mono block mb-12"
					target="_blank"
					rel="noopener noreferrer"
				>
					github.com/nf-projects/simple-prompt-tools
				</Link>

				{/* Related blog posts */}
				{/* <div className="mb-6">
					<p className="text-zinc-400">Related Blog Posts:</p>
					<ul className="list-disc pl-6">
						<li>
							<Link
								href="/blog/ai-development-workflow"
								className="text-blue-500 underline"
							>
								Simple Prompt Tools: My AI Development Workflow
							</Link>
						</li>
					</ul>
				</div> */}

				{/* <Image
					src="https://picsum.photos/800/400"
					alt="Simple Prompt Tools"
					width={800}
					height={400}
					className="rounded-lg mb-8"
				/> */}

				<div className="space-y-6">
					<p className="text-zinc-300 leading-relaxed font-mono">
						I love using LLMs to assist with coding. They make it more fun and
						much faster. But I'm not a fan of most current solutions like
						Cursor, Copilot, or Devin. Here's why:
					</p>
					<p className="text-zinc-300 leading-relaxed font-mono mt-6">
						<b className="underline">Not enough context:</b> I genuinely believe
						today's LLMs are capable of solving most coding tasks but often fail
						because of a bad prompt. You need to give the LLM a high-level
						overview of the project, your file structure, code standards, and
						any relevant files to give it a chance to spit out useful output.
						Solutions like Copilot's @workspace are trying to solve this by
						generating embeddings for every file, but that doesn't work because
						file contents are not always semantically similar to the prompt.
					</p>
					<p className="text-zinc-300 leading-relaxed font-mono mt-6">
						<b className="underline">Giving up control:</b> A lot of these tools
						abstract away the context, complex system prompts, etc. and even
						apply changes to files for you. That's a nice time saver but comes
						at the cost of sacrificing your "mental model" of the codebase. This
						means that, as time goes on, you won't be familiar with your own
						codebase and won't even be able to properly prompt the LLM for
						future updates.
					</p>
					<p className="text-zinc-300 leading-relaxed font-mono mt-6">
						<b className="underline">Less model experimentation:</b> Cursor,
						Copilot etc let you select different models but I still find it
						really valuable to run the same prompt on Google AI Studio, OpenAI
						playground, etc. with different temperature settings or different
						models and comparing the results. It helps me stay up to date on the
						latest SOTA models.
					</p>
					<h2 className="text-2xl font-mono mt-8">My Workflow</h2>
					<p className="text-zinc-300 leading-relaxed font-mono mt-6">
						To address these problems, I made my own super simple VSCode
						extension which gives you shortcuts to copy codebase context items
						to clipboard:
					</p>
					<Image
						src="/images/prompt_tools.png"
						alt="Prompt Tools"
						width={300}
						height={300}
						className="rounded-lg"
					/>

					<p className="text-zinc-300 leading-relaxed font-mono mt-6">
						Project Prompts are defined per project in a markdown file and
						should be used for a high-level description of the project, code
						style, etc.
					</p>

					<p className="text-zinc-300 leading-relaxed font-mono mt-6">
						Append lets you append new context to the clipboard instead of
						overriding, which enables cool workflows like:
					</p>
					<ol className="list-decimal pl-6 space-y-2">
						<li>copy the project prompt</li>
						<li>append the entire project folder structure</li>
						<li>open all relevant files and append all open editor tabs</li>
						<li>append all errors</li>
					</ol>

					<p className="text-zinc-300 leading-relaxed font-mono mt-6">
						With everything copied to clipboard, you can then just paste into a
						web-based interface like AI Studio or claude.ai. The tradeoff of
						using this extension instead of Cursor or Copilot is that it can get
						tedious to copy and paste files from your browser into your code
						editor, but I think it's worth the upside of having greater control
						and understanding of your codebase.
					</p>
				</div>
			</article>
		</div>
	);
}
