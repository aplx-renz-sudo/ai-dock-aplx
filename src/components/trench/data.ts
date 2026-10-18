import {
  GITHUB_URL as VILEDOCX_GITHUB,
  LAUNCH_URL,
} from "@/components/viledocx/data";

/**
 * Verified facts and marketing copy for the TRENCH site.
 *
 * Everything here was checked against https://github.com/aplx-renz-sudo/Trench
 * (public repo, MIT licence, README still a placeholder, no releases) on
 * 2026-10-18. If the project ships setup docs or a packaged release, update the
 * strings in this file — the UI reads everything from here.
 */

export const TRENCH_URL = "https://github.com/aplx-renz-sudo/Trench";
export const TRENCH_REPO_URL = TRENCH_URL;
export const TRENCH_CLONE_URL = "https://github.com/aplx-renz-sudo/Trench.git";
export const TRENCH_DOCS_URL = `${TRENCH_URL}#readme`;
export const TRENCH_LICENSE_URL = `${TRENCH_URL}/blob/main/LICENSE`;
export const TRENCH_LICENSE = "MIT";

/*
 * The parent project's URLs come straight from the VileDocx site data so the
 * two pages can never drift apart.
 */
export const VILEDOCX_URL = LAUNCH_URL;
export const VILEDOCX_REPO_URL = VILEDOCX_GITHUB;

export const VERSION = "T01";
export const VERSION_LABEL = "T01 · Under Construction";

export type Provider = {
  name: string;
  kind: string;
  note: string;
};

/**
 * T01 provider targets. These are the integrations the project is being built
 * around; T01 has not shipped, so the UI frames them as targets rather than
 * shipped support.
 */
export const PROVIDERS: Provider[] = [
  { name: "OpenAI", kind: "Cloud API", note: "GPT models" },
  { name: "Anthropic", kind: "Cloud API", note: "Claude models" },
  { name: "Google Gemini", kind: "Cloud API", note: "Gemini models" },
  { name: "DeepSeek", kind: "Cloud API", note: "DeepSeek models" },
  { name: "Mistral", kind: "Cloud API", note: "Mistral models" },
  { name: "Moonshot / Kimi", kind: "Cloud API", note: "Kimi models" },
  { name: "Ollama", kind: "Local runtime", note: "Runs on your machine" },
  {
    name: "OpenAI-compatible",
    kind: "Custom endpoint",
    note: "Your own base URL",
  },
];

export type Feature = {
  n: string;
  title: string;
  body: string;
};

export const FEATURES: Feature[] = [
  {
    n: "01",
    title: "Bring Your Own API",
    body: "You supply the credentials for the provider you choose. No shared account and no resold access: the provider you configure is the provider you talk to.",
  },
  {
    n: "02",
    title: "Multi-Provider Support",
    body: "Pick from the provider set targeted for T01 and change the model you are working with, instead of being pinned to a single vendor.",
  },
  {
    n: "03",
    title: "Terminal-Native Workflow",
    body: "Built for the shell — no browser tab, no chat sidebar, no dashboard to keep open. It lives where your build commands already run.",
  },
  {
    n: "04",
    title: "Direct Provider Requests",
    body: "Requests go straight to the selected provider API. There is no TRENCH relay server sitting in the middle of your prompts.",
  },
  {
    n: "05",
    title: "Developer-Centered Design",
    body: "A focused environment: choose a provider, choose a model, stay in the project you are working on instead of context-switching to a web app.",
  },
  {
    n: "06",
    title: "Open-Source Foundations",
    body: `Public repository, ${TRENCH_LICENSE} licensed. The source is online today, so you can read it and follow the commits as T01 is built.`,
  },
];

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "What is TRENCH?",
    a: "TRENCH is a terminal-based AI coding agent: a command-line environment where you bring your own AI provider API key and work with the model you choose. It is currently at T01 and still under construction.",
  },
  {
    q: "Is TRENCH a chatbot?",
    a: "No. TRENCH is designed as a CLI coding environment rather than a web chat interface. There is no TRENCH chat website; the product is the terminal experience.",
  },
  {
    q: "What does Bring Your Own API mean?",
    a: "You create an account with a supported provider and use your own API key. TRENCH does not provide the model access itself, so your usage is governed by the provider's own terms, limits and pricing.",
  },
  {
    q: "Which providers are supported?",
    a: "The T01 provider set is OpenAI, Anthropic / Claude, Google Gemini, DeepSeek, Mistral, Moonshot / Kimi, Ollama for local models, and OpenAI-compatible endpoints. T01 is still being built, so confirm the current list in the repository before configuring keys.",
  },
  {
    q: "Does TRENCH send requests through its own server?",
    a: "No. Requests are sent directly to the provider API you selected. TRENCH does not run an intermediary relay service for your prompts.",
  },
  {
    q: "Is TRENCH free to use?",
    a: "The project is open source under the MIT licence, so the source itself is free to use and inspect. Your chosen provider may charge for API usage, and those charges come from the provider, not from TRENCH.",
  },
  {
    q: "Is TRENCH part of VileDocx?",
    a: "Yes. TRENCH is a subproject of VileDocx, the AI provider dock. TRENCH brings terminal-native coding workflows into the same ecosystem; the two are related but separate tools.",
  },
  {
    q: "Is TRENCH ready for production?",
    a: "No. T01 is under construction and has not been released. There is no packaged release or download yet, and setup instructions will be published with the first build.",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Open the repository",
    body: "The project lives on GitHub. That is the only official source for T01.",
    code: TRENCH_URL.replace("https://", ""),
    href: TRENCH_URL,
  },
  {
    n: "02",
    title: "Clone it",
    body: "The repository is public, so cloning works today. There is no package on a registry yet.",
    code: `git clone ${TRENCH_CLONE_URL}`,
  },
  {
    n: "03",
    title: "Read the setup notes",
    body: "The README is still a placeholder while T01 is being built. Setup instructions are published with the release.",
    code: "Setup instructions coming soon.",
  },
  {
    n: "04",
    title: "Configure a provider",
    body: "Once setup docs land, add the API key for the provider you picked. Keys stay in your environment — never in this website.",
    code: "provider key → your machine",
  },
  {
    n: "05",
    title: "Launch TRENCH",
    body: "The launch command will be documented alongside the first build. Do not trust any other source claiming to ship TRENCH.",
    code: "Launch command: documented at release",
  },
] as const;

export const NAV_LINKS = [
  { label: "Product", target: "trench-product" },
  { label: "Features", target: "trench-features" },
  { label: "Providers", target: "trench-providers" },
  { label: "Setup", target: "trench-setup" },
  { label: "FAQ", target: "trench-faq" },
] as const;
