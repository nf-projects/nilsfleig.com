"use client";

import { useState } from "react";
import Link from "next/link";

interface BlogPost {
	title: string;
	slug: string;
	date: string;
}

interface BlogListProps {
	posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
	const [showAll, setShowAll] = useState(false);

	return (
		<div className="space-y-4">
			{posts.slice(0, 2).map((post) => (
				<BlogCard key={post.slug} post={post} />
			))}

			{!showAll && posts.length > 2 && (
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/70 to-zinc-950 pointer-events-none" />
					<BlogCard post={posts[2]} />
					<button
						onClick={() => setShowAll(true)}
						className="absolute inset-x-0 bottom-0 w-full py-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent text-white font-mono hover:from-zinc-900 hover:via-zinc-900/90 transition-colors"
					>
						View all posts
					</button>
				</div>
			)}

			{showAll &&
				posts.slice(2).map((post) => <BlogCard key={post.slug} post={post} />)}
		</div>
	);
}

function BlogCard({ post }: { post: BlogPost }) {
	return (
		<Link
			href={`/blog/${post.slug}`}
			className="block p-8 rounded-lg bg-zinc-900 hover:bg-zinc-800/50 transition-colors group"
		>
			<div className="space-y-2">
				<h3 className="text-xl font-mono group-hover:text-primary group-hover:underline transition-colors">
					{post.title}
				</h3>
				<p className="text-zinc-500 font-mono">{post.date}</p>
			</div>
		</Link>
	);
}
