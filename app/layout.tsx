import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
	title: "Portfolio",
	description: "Personal portfolio website",
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
					<header className="py-12 mb-16 flex items-center justify-between">
						<Link href="/" className="text-2xl font-bold">
							Nils Fleig
						</Link>
						<nav className="flex gap-6">
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
				</div>
			</body>
		</html>
	);
}
