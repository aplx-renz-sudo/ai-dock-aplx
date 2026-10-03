export interface VileDocxProvider {
  id: string;
  name: string;
  /** Accent color used in the catalog UI */
  color: string;
  /**
   * One flagship model per provider. The catalog is intentionally curated
   * rather than exhaustive: a short list of names people already recognise
   * communicates what the dock does faster than a long list of SKUs does.
   */
  models: string[];
  /** True when the provider publishes open weights you can run yourself. */
  open?: boolean;
}

export const PROVIDERS: VileDocxProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    color: "#34d399",
    models: ["GPT-4o"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    color: "#a1a1aa",
    models: ["Claude Sonnet 4"],
  },
  {
    id: "google",
    name: "Google",
    color: "#a1a1aa",
    models: ["Gemini 2.5 Pro"],
  },
  {
    id: "meta",
    name: "Meta",
    color: "#a1a1aa",
    open: true,
    models: ["Llama 4"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    color: "#a1a1aa",
    open: true,
    models: ["DeepSeek R1"],
  },
  {
    id: "mistral",
    name: "Mistral",
    color: "#a1a1aa",
    open: true,
    models: ["Mistral Large"],
  },
  {
    id: "xai",
    name: "xAI",
    color: "#a1a1aa",
    models: ["Grok 4"],
  },
  {
    id: "ollama",
    name: "Ollama",
    color: "#a1a1aa",
    open: true,
    models: ["Local GGUF"],
  },
];

export const LAUNCH_URL = "https://viledocx.ai.studio";
export const GITHUB_URL = "https://github.com/aplx-renz-sudo/Aplx-Website";

export const TOTAL_MODELS = PROVIDERS.reduce((n, p) => n + p.models.length, 0);
export const OPEN_PROVIDERS = PROVIDERS.filter((p) => p.open).length;
