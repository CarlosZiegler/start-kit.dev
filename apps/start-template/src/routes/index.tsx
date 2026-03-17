import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	BarChart3,
	CheckCircle2,
	HardDrive,
	Layers,
	LineChart,
	Mail,
	MessageCircle,
	PaletteIcon,
	Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { FeatureSpotlight } from "@/features/landing/landing-feature-spotlight";
import { Section } from "@/features/landing/landing-section";
import { LandingSpotlightCodeTabs } from "@/features/landing/landing-spotlight-code-tabs";
import { TECH_STACK } from "@/features/landing/tech-stack.data";
import { TechStackMarquee } from "@/features/landing/tech-stack-marquee";
import { DEFAULT_SITE_NAME, SITE_URL, seo } from "@/utils/seo";

const AI_CODE_TABS = [
	{
		value: "backend",
		label: "Backend",
		language: "ts",
		code: `import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createFileRoute } from "@tanstack/react-router";

type Provider = "openai" | "anthropic" | "gemini";

function getModel(provider: Provider, modelId: string) {
  switch (provider) {
    case "anthropic": return anthropic(modelId);
    case "gemini": return google(modelId);
    default: return openai(modelId);
  }
}

export const Route = createFileRoute("/api/chat/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, provider = "openai", model = "gpt-5-mini" } =
          await request.json() as { messages: UIMessage[]; provider?: Provider; model?: string };

        const result = streamText({
          model: getModel(provider, model),
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});`,
	},
	{
		value: "frontend",
		label: "Frontend",
		language: "ts",
		code: `import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { provider: "openai", model: "gpt-5-mini" },
    }),
  });

  return (
    <div>
      <button
        disabled={status !== "ready"}
        type="button"
        onClick={() => sendMessage({ text: "Hello!" })}
      >
        Send
      </button>
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.parts.map((part, i) =>
            part.type === "text" ? <p key={i}>{part.text}</p> : null
          )}
        </div>
      ))}
    </div>
  );
}`,
	},
] as const;

const AUTH_CODE_TABS = [
	{
		value: "server",
		label: "Server",
		language: "ts",
		code: `import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { auth } from "@/lib/auth/auth";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    return next({ context: { session } });
  }
);

export const getCurrentUserFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => context.session);`,
	},
	{
		value: "client",
		label: "Client",
		language: "ts",
		code: `import { authClient } from "@/lib/auth/auth-client";

export function SessionBadge() {
  const { data: session } = authClient.useSession();
  if (!session?.user) return <span>Signed out</span>;
  return <span>Signed in as {session.user.email}</span>;
}`,
	},
] as const;

const ORPC_CODE_TABS = [
	{
		value: "server",
		label: "Server",
		language: "ts",
		code: `import { ORPCError, os } from "@orpc/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export const createORPCContext = async ({ headers }: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers });
  return { db, session };
};

export const orpc = os.$context<Awaited<ReturnType<typeof createORPCContext>>>();

export const protectedProcedure = orpc.middleware(async ({ context, next }) => {
  if (!context.session?.user) throw new ORPCError("UNAUTHORIZED");
  return await next();
});`,
	},
	{
		value: "client",
		label: "Client",
		language: "ts",
		code: `import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const link = new RPCLink({
  url: "/api/rpc",
  fetch(url, options) {
    return fetch(url, { ...options, credentials: "include" });
  },
});

export const orpc = createTanstackQueryUtils(createORPCClient(link));`,
	},
] as const;

const STORAGE_CODE_TABS = [
	{
		value: "bun-s3",
		label: "Bun S3Client",
		language: "ts",
		code: `import { S3Client } from "bun";
import { env } from "@/lib/env.server";

const s3 = new S3Client({
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  bucket: env.S3_BUCKET?.toLowerCase(),
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
});

export const storage = {
  async upload(key: string, data: Uint8Array, contentType?: string) {
    await s3.file(key).write(data, { type: contentType });
    return { key, size: data.length, contentType };
  },
};`,
	},
	{
		value: "presign",
		label: "Presign",
		language: "ts",
		code: `import { S3Client } from "bun";

const s3 = new S3Client({ /* env config */ });

export const getUrl = (key: string, expiresIn = 86_400) =>
  s3.file(key).presign({ expiresIn });

export const presignUpload = (key: string, expiresIn = 3_600) =>
  s3.file(key).presign({ expiresIn, method: "PUT" });`,
	},
] as const;

const DB_CODE_TABS = [
	{
		value: "drizzle",
		label: "Drizzle",
		language: "ts",
		code: `import { relations } from "drizzle-orm";
import { bigint, index, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const file = pgTable(
  "file",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    provider: text("provider").notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
    mimeType: text("mime_type").notNull(),
    fileName: text("file_name").notNull(),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("file_key_idx").on(table.key)]
);

export const fileRelations = relations(file, ({ one }) => ({
  user: one(/* ... */),
}));`,
	},
] as const;

const REACT_QUERY_CODE_TABS = [
	{
		value: "query-options",
		label: "queryOptions",
		language: "ts",
		code: `import { queryOptions } from "@tanstack/react-query";

export const repoStarsOptions = queryOptions({
  queryKey: ["repo", "tanstack-query"],
  queryFn: async () => {
    const res = await fetch("https://api.github.com/repos/tanstack/query");
    if (!res.ok) throw new Error("Request failed");
    return await res.json() as { stargazers_count: number };
  },
  staleTime: 60_000,
});`,
	},
	{
		value: "use-query",
		label: "useQuery",
		language: "ts",
		code: `import { useQuery } from "@tanstack/react-query";

type Repo = { stargazers_count: number };

async function fetchRepo(): Promise<Repo> {
  const res = await fetch("https://api.github.com/repos/tanstack/query");
  if (!res.ok) throw new Error("Request failed");
  return await res.json();
}

export function RepoStars() {
  const repoQuery = useQuery({
    queryKey: ["repo", "tanstack-query"],
    queryFn: fetchRepo,
    staleTime: 60_000,
  });

  return <div>⭐ {repoQuery.data?.stargazers_count ?? "—"}</div>;
}`,
	},
] as const;

export const Route = createFileRoute("/")({
	head: () => {
		const title = `${DEFAULT_SITE_NAME} - The Ultimate Boilerplate`;
		const description =
			"An open-source, production-ready template featuring Authentication, Payments, Database, i18n, and more. Built with Start Kit, React 19, and Tailwind v4.";

		const { meta, links } = seo({
			title,
			description,
			keywords:
				"Start Kit, TanStack Start, React, SaaS starter, Better Auth, Drizzle ORM, oRPC, Tailwind, Resend, AI SDK, AI Elements",
			url: "/",
			canonicalUrl: "/",
			image: "/images/landing/hero-bg.png",
		});

		const jsonLd = [
			{
				"@context": "https://schema.org",
				"@type": "Organization",
				name: DEFAULT_SITE_NAME,
				url: SITE_URL,
				logo: `${SITE_URL}/android-chrome-512x512.png`,
			},
			{
				"@context": "https://schema.org",
				"@type": "WebSite",
				name: DEFAULT_SITE_NAME,
				url: SITE_URL,
				potentialAction: {
					"@type": "SearchAction",
					target: `${SITE_URL}/?q={search_term_string}`,
					"query-input": "required name=search_term_string",
				},
			},
		];

		return {
			meta,
			links,
			scripts: [
				{
					type: "application/ld+json",
					children: JSON.stringify(jsonLd),
				},
			],
		};
	},
	component: LandingPage,
});

function LandingPage() {
	const { t } = useTranslation();

	const features = [
		{
			title: t("TEMPLATE_FEATURE_AUTH_TITLE"),
			description: t("TEMPLATE_FEATURE_AUTH_DESC"),
			icon: Layers,
		},
		{
			title: t("TEMPLATE_FEATURE_AI_TITLE"),
			description: t("TEMPLATE_FEATURE_AI_DESC"),
			icon: Sparkles,
		},
		{
			title: t("TEMPLATE_FEATURE_DB_TITLE"),
			description: t("TEMPLATE_FEATURE_DB_DESC"),
			icon: BarChart3,
		},
		{
			title: t("TEMPLATE_FEATURE_EMAILS_TITLE"),
			description: t("TEMPLATE_FEATURE_EMAILS_DESC"),
			icon: Mail,
		},
		{
			title: t("TEMPLATE_FEATURE_PAYMENTS_TITLE"),
			description: t("TEMPLATE_FEATURE_PAYMENTS_DESC"),
			icon: LineChart,
		},
		{
			title: t("TEMPLATE_FEATURE_STORAGE_TITLE"),
			description: t("TEMPLATE_FEATURE_STORAGE_DESC"),
			icon: HardDrive,
		},
		{
			title: t("TEMPLATE_FEATURE_TESTING_TITLE"),
			description: t("TEMPLATE_FEATURE_TESTING_DESC"),
			icon: CheckCircle2,
		},
		{
			title: t("TEMPLATE_FEATURE_I18N_TITLE"),
			description: t("TEMPLATE_FEATURE_I18N_DESC"),
			icon: MessageCircle,
		},
	];

	return (
		<div className="min-h-screen scroll-smooth bg-background text-foreground">
			{/* Navigation */}
			<nav className="fixed top-0 right-0 left-0 z-50 border-border/40 border-b bg-background/60 backdrop-blur-xl">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Link className="flex items-center space-x-2" to="/">
							<Logo className="h-10 w-10 shadow-lg shadow-primary/20" />
							<span className="hidden font-bold text-2xl tracking-tight sm:inline">
								Start Kit
							</span>
						</Link>

						<div className="flex items-center gap-4">
							<Link
								className={buttonVariants({
									variant: "ghost",
									className: "hidden sm:inline-flex",
								})}
								to="/sign-in"
							>
								{t("SIGN_IN")}
							</Link>
							<Link
								className={buttonVariants({
									className:
										"rounded-full bg-primary px-6 shadow-lg shadow-primary/20 hover:bg-primary/90",
								})}
								to="/sign-up"
							>
								{t("GET_STARTED")}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
				<div className="absolute inset-0 z-0">
					<img
						alt="Hero Background"
						className="h-full w-full object-cover opacity-100 mix-blend-soft-light"
						height={1080}
						src="/images/landing/hero-bg.png"
						width={1920}
					/>
					<div className="absolute inset-0 bg-linear-to-b from-background via-background/80 to-background" />
				</div>

				<div className="container relative z-10 mx-auto px-4 text-center">
					<Badge
						className="mb-8 border-primary/80 bg-primary p-4 font-medium text-primary-foreground text-sm hover:bg-primary/20"
						variant="outline"
					>
						{t("TEMPLATE_HERO_BADGE")}
					</Badge>
					<h1 className="mb-8 text-balance font-black text-5xl tracking-tighter md:text-7xl lg:text-8xl">
						{t("TEMPLATE_HERO_TITLE")}
					</h1>
					<p className="mx-auto mb-10 max-w-3xl text-balance font-light text-muted-foreground text-xl md:text-2xl">
						{t("TEMPLATE_HERO_DESC")}
					</p>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Link
							className={buttonVariants({
								className:
									"h-14 rounded-full bg-primary px-10 font-semibold text-lg shadow-primary/25 shadow-xl transition-all duration-300 hover:shadow-primary/40",
							})}
							to="/sign-up"
						>
							{t("TEMPLATE_CTA_PRIMARY")}
							<ArrowRight className="ml-2 h-6 w-6" />
						</Link>
						<a
							className={buttonVariants({
								variant: "outline",
								className:
									"h-14 rounded-full border-border/60 px-10 font-medium text-lg transition-all hover:bg-accent/50",
							})}
							href="https://github.com/CarlosZiegler/start-kit.dev"
							rel="noreferrer"
							target="_blank"
						>
							{t("TEMPLATE_CTA_SECONDARY")}
						</a>
					</div>
				</div>
			</section>

			{/* Tech Stack Marquee-like section */}
			<Section className="py-12 md:py-16" variant="subtle">
				<div className="mb-12 text-center">
					<h2 className="mb-2 font-bold text-primary text-sm uppercase tracking-widest">
						{t("TEMPLATE_TECH_STACK_TITLE")}
					</h2>
					<p className="text-muted-foreground">
						{t("TEMPLATE_TECH_STACK_SUBTITLE")}
					</p>
				</div>
				<TechStackMarquee className="opacity-90" items={TECH_STACK} />
			</Section>

			{/* Theme Customizer CTA */}
			<Section>
				<div className="mx-auto max-w-6xl">
					<div className="grid items-center gap-12 lg:grid-cols-2">
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6 }}
							viewport={{ once: true }}
							className="overflow-hidden rounded-2xl border border-border/40 shadow-2xl shadow-primary/5"
						>
							<img
								src="/images/landing/theme-customizer-preview.png"
								alt="Theme Customizer Preview"
								className="h-auto w-full"
								width={1400}
								height={900}
							/>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 30 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							viewport={{ once: true }}
						>
							<div className="bg-primary/10 mb-6 flex size-14 items-center justify-center rounded-2xl">
								<PaletteIcon className="text-primary size-7" />
							</div>
							<h2 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl">
								Make It Yours
							</h2>
							<p className="text-muted-foreground mb-8 max-w-lg text-lg leading-relaxed">
								Customize colors, radius, and fonts with our live theme editor.
								Preview changes in real-time, then copy the CSS or share your
								theme via URL.
							</p>
							<div className="mb-6 flex flex-wrap gap-4">
								<Link
									to="/themes"
									className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
								>
									<PaletteIcon className="size-4" />
									Open Theme Customizer
								</Link>
							</div>
							<div className="text-muted-foreground flex flex-col gap-3 text-sm">
								<span className="flex items-center gap-2">
									<CheckCircle2 className="size-4 text-primary" />
									21 color themes with light &amp; dark mode
								</span>
								<span className="flex items-center gap-2">
									<CheckCircle2 className="size-4 text-primary" />
									Live preview with real components
								</span>
								<span className="flex items-center gap-2">
									<CheckCircle2 className="size-4 text-primary" />
									Copy CSS, CLI command, or share via URL
								</span>
							</div>
						</motion.div>
					</div>
				</div>
			</Section>

			{/* Feature Spotlights */}
			<Section>
				<div className="space-y-32">
					<FeatureSpotlight
						description={t("TEMPLATE_SPOTLIGHT_AI_DESC")}
						title={t("TEMPLATE_SPOTLIGHT_AI_TITLE")}
						visual={<LandingSpotlightCodeTabs tabs={AI_CODE_TABS} />}
					/>

					<FeatureSpotlight
						description={t("TEMPLATE_SPOTLIGHT_AUTH_DESC")}
						reverse
						title={t("TEMPLATE_SPOTLIGHT_AUTH_TITLE")}
						visual={<LandingSpotlightCodeTabs tabs={AUTH_CODE_TABS} />}
					/>

					<FeatureSpotlight
						description={t("TEMPLATE_SPOTLIGHT_ORPC_DESC")}
						title={t("TEMPLATE_SPOTLIGHT_ORPC_TITLE")}
						visual={<LandingSpotlightCodeTabs tabs={ORPC_CODE_TABS} />}
					/>

					<FeatureSpotlight
						description={t("TEMPLATE_SPOTLIGHT_STORAGE_DESC")}
						reverse
						title={t("TEMPLATE_SPOTLIGHT_STORAGE_TITLE")}
						visual={<LandingSpotlightCodeTabs tabs={STORAGE_CODE_TABS} />}
					/>

					<FeatureSpotlight
						description={t("TEMPLATE_SPOTLIGHT_DB_DESC")}
						title={t("TEMPLATE_SPOTLIGHT_DB_TITLE")}
						visual={<LandingSpotlightCodeTabs tabs={DB_CODE_TABS} />}
					/>

					<FeatureSpotlight
						description={t("TEMPLATE_SPOTLIGHT_REACT_QUERY_DESC")}
						reverse
						title={t("TEMPLATE_SPOTLIGHT_REACT_QUERY_TITLE")}
						visual={<LandingSpotlightCodeTabs tabs={REACT_QUERY_CODE_TABS} />}
					/>
				</div>
			</Section>

			{/* Grid Features */}
			<Section variant="muted">
				<div className="mb-20 text-center">
					<h2 className="mb-6 font-extrabold text-4xl tracking-tight md:text-5xl">
						Everything you need to ship.
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground text-xl">
						A comprehensive ecosystem designed for developers who don't want to
						compromise on quality or speed.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, idx) => (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							key={feature.title}
							transition={{ delay: idx * 0.1 }}
							viewport={{ once: true }}
							whileInView={{ opacity: 1, y: 0 }}
						>
							<Card className="group h-full border-border/40 bg-card/40 backdrop-blur-sm transition-colors hover:border-primary/40">
								<CardHeader>
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
										<feature.icon className="h-6 w-6 text-primary" />
									</div>
									<CardTitle className="text-2xl">{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-base text-muted-foreground leading-relaxed">
										{feature.description}
									</CardDescription>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</Section>

			{/* Developer Experience Spotlight */}
			<FeatureSpotlight
				description={t("TEMPLATE_DX_DESC")}
				image="/images/landing/tanstack-island-dev.png"
				reverse={true}
				title={t("TEMPLATE_DX_TITLE")}
			/>

			{/* How it Works */}
			<Section>
				<div className="mb-20 text-center">
					<h2 className="mb-4 font-bold text-4xl">
						{t("TEMPLATE_HOW_IT_WORKS_TITLE")}
					</h2>
				</div>
				<div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
					<div className="flex flex-col items-center">
						<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-bold text-2xl text-primary">
							1
						</div>
						<h3 className="mb-4 font-bold text-xl">
							{t("TEMPLATE_HOW_IT_WORKS_STEP1_TITLE")}
						</h3>
						<p className="text-muted-foreground">
							{t("TEMPLATE_HOW_IT_WORKS_STEP1_DESC")}
						</p>
					</div>
					<div className="flex flex-col items-center">
						<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-bold text-2xl text-primary">
							2
						</div>
						<h3 className="mb-4 font-bold text-xl">
							{t("TEMPLATE_HOW_IT_WORKS_STEP2_TITLE")}
						</h3>
						<p className="text-muted-foreground">
							{t("TEMPLATE_HOW_IT_WORKS_STEP2_DESC")}
						</p>
					</div>
					<div className="flex flex-col items-center">
						<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-bold text-2xl text-primary">
							3
						</div>
						<h3 className="mb-4 font-bold text-xl">
							{t("TEMPLATE_HOW_IT_WORKS_STEP3_TITLE")}
						</h3>
						<p className="text-muted-foreground">
							{t("TEMPLATE_HOW_IT_WORKS_STEP3_DESC")}
						</p>
					</div>
				</div>
			</Section>

			{/* FAQ */}
			<Section variant="subtle">
				<div className="mx-auto max-w-3xl">
					<h2 className="mb-12 text-center font-bold text-4xl">
						{t("TEMPLATE_FAQ_TITLE")}
					</h2>
					<Accordion className="w-full space-y-4">
						<AccordionItem value="item-1">
							<AccordionTrigger className="text-lg">
								{t("TEMPLATE_FAQ_Q1")}
							</AccordionTrigger>
							<AccordionContent className="text-base text-muted-foreground">
								{t("TEMPLATE_FAQ_A1")}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-2">
							<AccordionTrigger className="text-lg">
								{t("TEMPLATE_FAQ_Q2")}
							</AccordionTrigger>
							<AccordionContent className="text-base text-muted-foreground">
								{t("TEMPLATE_FAQ_A2")}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-3">
							<AccordionTrigger className="text-lg">
								{t("TEMPLATE_FAQ_Q3")}
							</AccordionTrigger>
							<AccordionContent className="text-base text-muted-foreground">
								{t("TEMPLATE_FAQ_A3")}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</Section>

			{/* Support & Sponsorship */}
			<Section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-primary/5" />
				<div className="relative z-10 mx-auto max-w-4xl py-12 text-center">
					<h2 className="mb-6 font-black text-4xl leading-tight md:text-5xl">
						Love this template?
					</h2>
					<p className="mb-10 text-muted-foreground text-xl">
						Supporting open source helps us keep improving. Give it a star or
						buy us a coffee!
					</p>
					<div className="flex flex-col justify-center gap-6 sm:flex-row">
						<a
							className={buttonVariants({
								size: "lg",
								className:
									"h-16 rounded-full px-10 font-bold text-xl shadow-2xl shadow-primary/30",
							})}
							href="https://github.com/CarlosZiegler/start-kit.dev"
							rel="noreferrer"
							target="_blank"
						>
							Star on GitHub
						</a>
						<a
							className={buttonVariants({
								variant: "outline",
								size: "lg",
								className:
									"h-16 rounded-full border-primary/20 px-10 font-medium text-xl hover:bg-primary/5",
							})}
							href="https://buymeacoffee.com/carlosziegler"
							rel="noreferrer"
							target="_blank"
						>
							Buy me a coffee
						</a>
					</div>
				</div>
			</Section>

			{/* Footer */}
			<footer className="border-border/40 border-t bg-background py-16">
				<div className="container mx-auto px-4">
					<div className="pt-8 text-center text-muted-foreground text-sm">
						<p>© 2025 Start Kit Template. {t("ALL_RIGHTS")}</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
