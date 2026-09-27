export interface AplxProvider {
  id: string;
  name: string;
  /** Accent color used in the catalog UI */
  color: string;
  /** Example models available through this provider */
  models: string[];
}

export const PROVIDERS: AplxProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    color: "#34d399",
    models: ["GPT-5", "GPT-4o", "o3", "GPT-4.1"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    color: "#a1a1aa",
    models: ["Claude Opus 4", "Claude Sonnet 4", "Claude Haiku 3.5"],
  },
  {
    id: "google",
    name: "Google",
    color: "#a1a1aa",
    models: ["Gemini 2.5 Pro", "Gemini 2.5 Flash"],
  },
  {
    id: "meta",
    name: "Meta",
    color: "#a1a1aa",
    models: ["Llama 4 Maverick", "Llama 3.3 70B"],
  },
  {
    id: "mistral",
    name: "Mistral",
    color: "#a1a1aa",
    models: ["Mistral Large", "Codestral", "Mistral Small"],
  },
  {
    id: "xai",
    name: "xAI",
    color: "#a1a1aa",
    models: ["Grok 4", "Grok 3 Mini"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    color: "#a1a1aa",
    models: ["DeepSeek V3", "DeepSeek R1"],
  },
  {
    id: "cohere",
    name: "Cohere",
    color: "#a1a1aa",
    models: ["Command R+", "Embed v3"],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: "#a1a1aa",
    models: ["Sonar Pro", "Sonar Reasoning"],
  },
  {
    id: "groq",
    name: "Groq",
    color: "#a1a1aa",
    models: ["Llama 70B (speed)", "Mixtral (speed)"],
  },
  {
    id: "ollama",
    name: "Ollama",
    color: "#a1a1aa",
    models: ["Local models", "Custom GGUF"],
  },
];

export const LAUNCH_URL = "https://aplx-web.vercel.app";
export const GITHUB_URL = "https://github.com/aplx-renz-sudo/Aplx-Website";

export const TOTAL_MODELS = PROVIDERS.reduce((n, p) => n + p.models.length, 0);
