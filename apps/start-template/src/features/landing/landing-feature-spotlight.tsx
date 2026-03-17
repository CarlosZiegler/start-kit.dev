import { motion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FeatureSpotlightProps {
	description: string;
	image?: string;
	reverse?: boolean;
	title: string;
	visual?: ReactNode;
}

export function FeatureSpotlight({
	title,
	description,
	image,
	visual,
	reverse = false,
}: FeatureSpotlightProps) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 items-center gap-12 px-14 md:grid-cols-2",
				reverse && "md:flex-row-reverse",
			)}
		>
			<motion.div
				className={cn(reverse && "md:order-last")}
				initial={{ opacity: 0, x: reverse ? 50 : -50 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				viewport={{ once: true }}
				whileInView={{ opacity: 1, x: 0 }}
			>
				<h3 className="mb-6 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
					{title}
				</h3>
				<p className="text-lg text-muted-foreground leading-relaxed">
					{description}
				</p>
			</motion.div>
			<motion.div
				className="relative overflow-hidden rounded-3xl border border-border/50 shadow-2xl"
				initial={{ opacity: 0, scale: 0.9 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				viewport={{ once: true }}
				whileInView={{ opacity: 1, scale: 1 }}
			>
				{visual ?? (
					<img
						alt={title}
						className="h-full w-full object-cover"
						height={800}
						src={image}
						width={1200}
					/>
				)}
				<div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-background/20 to-transparent" />
			</motion.div>
		</div>
	);
}
