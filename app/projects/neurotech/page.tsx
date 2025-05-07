import Link from "next/link";
import Image from "next/image";

export default function NeurotechPage() {
	return (
		<div className="mx-auto max-w-2xl pb-12">
			<article className="prose prose-invert prose-zinc max-w-none">
				<h1 className="text-4xl font-mono mb-2">NeuroTech ML</h1>
				<p className="text-zinc-500 font-mono mb-6">
					EEG Analysis of Stress Anticipation
				</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 text-center">
					<div className="bg-zinc-800/50 p-4 rounded-lg">
						<p className="text-3xl font-mono text-zinc-200">76.48%</p>
						<p className="text-sm text-zinc-400 font-mono">
							Avg. Classification Accuracy
						</p>
					</div>
					<div className="bg-zinc-800/50 p-4 rounded-lg">
						<p className="text-3xl font-mono text-zinc-200">81.67%</p>
						<p className="text-sm text-zinc-400 font-mono">Highest Accuracy</p>
					</div>
					<div className="bg-zinc-800/50 p-4 rounded-lg">
						<p className="text-3xl font-mono text-zinc-200">8</p>
						<p className="text-sm text-zinc-400 font-mono">EEG Channels</p>
					</div>
				</div>

				<div className="flex flex-wrap gap-2 mb-8">
					{["Python", "MNE", "Machine Learning"].map((tech) => (
						<span
							key={tech}
							className="px-3 py-1 bg-zinc-800 rounded-full text-sm font-mono"
						>
							{tech}
						</span>
					))}
				</div>
				<Link
					href="https://github.com/nf-projects/neurotech_ml"
					className="text-zinc-400 hover:text-white underline font-mono block mb-12"
					target="_blank"
					rel="noopener noreferrer"
				>
					github.com/nf-projects/neurotech_ml
				</Link>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					A machine learning project for analyzing EEG data to detect and
					classify stress response anticipation during delayed auditory
					stimulus.
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					This project examines how the brain responds to stress when
					anticipating delayed auditory stimuli. The analysis focuses on the
					relationship between delta (1-4 Hz) and beta (13-30 Hz) frequency
					bands, which has been linked to stress regulation.
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					The experiment presented participants with two types of auditory
					beeps:
				</p>
				<ul className="list-disc pl-6 space-y-2 mt-3">
					<li>DelayedBeep: Stress-inducing delayed tone</li>
					<li>NonDelayedBeep: Control, normal tone</li>
				</ul>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					Using EEG recordings from multiple participants (Andy, Joycelynn,
					Okyanus), we analyzed the brain's electrical activity to classify
					these different states.
				</p>
				<h2 className="text-2xl font-mono mt-8">Key Findings</h2>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					All recordings achieved above-chance accuracy, ranging from 68.33% to
					81.67%, with the highest accuracy of 81.67% from the JoycelynModerate2
					dataset.
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					This demonstrates that the EEG patterns associated with delayed and
					non-delayed conditions are distinct and can be reliably differentiated
					using Common Spatial Patterns (CSP) and Linear Discriminant Analysis
					(LDA) techniques.
				</p>
				<h2 className="text-2xl font-mono mt-8">Technical Details</h2>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					The analysis pipeline includes:
				</p>
				<ul className="list-disc pl-6 space-y-2 mt-3">
					<li>Loading and preprocessing EEG data</li>
					<li>Extracting and cleaning event markers</li>
					<li>Creating MNE Raw objects and applying filters (1-30 Hz)</li>
					<li>Performing ICA for artifact removal</li>
					<li>Creating epochs around events of interest</li>
					<li>Computing band power (delta and beta)</li>
					<li>ML classification using CSP + LDA</li>
					<li>Visualization of evoked responses</li>
				</ul>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">EEG Channels:</b> P4, Pz, P3, C3, Cz, C4, F3,
					F4
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">Sampling Rate:</b> 250 Hz
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">Filtering:</b> 1.0-30.0 Hz
				</p>
				<p className="text-zinc-300 leading-relaxed font-mono mt-6">
					<b className="underline">Epoch Window:</b> -0.5 to 1.5 seconds around
					events
				</p>
			</article>
		</div>
	);
}
