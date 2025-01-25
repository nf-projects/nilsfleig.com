import Link from "next/link";
import Image from "next/image";

export default function CircleMeteredBillingPage() {
	return (
		<div className="mx-auto max-w-2xl pb-12">
			<article className="prose prose-invert prose-zinc max-w-none">
				<h1 className="text-4xl font-mono mb-2">
					Circle Metered Crypto Billing
				</h1>
				<p className="text-zinc-500 font-mono mb-6">
					Billing solution for crypto transactions
				</p>

				<Image
					src="https://picsum.photos/800/400"
					alt="Circle Metered Billing"
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
