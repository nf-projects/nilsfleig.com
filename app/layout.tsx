import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
	title: "Nils",
	description: "Nils Personal Site",
	viewport: {
		width: "device-width",
		initialScale: 1,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body className="min-h-screen bg-zinc-950 font-mono text-zinc-100 antialiased">
				<div className="mx-auto max-w-4xl px-6">
					<header className="py-6 md:py-12 mb-8 md:mb-16 flex flex-wrap items-center justify-between gap-4">
						<Link href="/" className="text-2xl font-bold">
							Nils Fleig
						</Link>
						<nav className="flex flex-wrap gap-4 sm:gap-6">
							<Link
								href="/#about"
								className="hover:text-primary transition-colors"
							>
								About
							</Link>
							<Link
								href="/#projects"
								className="hover:text-primary transition-colors"
							>
								Projects
							</Link>
							<Link
								href="/#blog"
								className="hover:text-primary transition-colors"
							>
								Blog
							</Link>
							<Link
								href="/#contact"
								className="hover:text-primary transition-colors"
							>
								Contact
							</Link>
						</nav>
					</header>
					{children}
					<footer className="py-8 mt-16 border-t border-zinc-800">
						<div className="flex justify-center">
							<Link
								href="/book"
								className="text-zinc-400 hover:text-primary transition-colors text-sm"
							>
								Book Converter
							</Link>
						</div>
					</footer>
				</div>
			</body>
		</html>
	);
}
