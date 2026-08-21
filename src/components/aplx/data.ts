export interface AplxProvider {
  id: string;
  name: string;
  /** Accent color used in 3D + UI */
  color: string;
  /** Example models available through this provider */
  models: string[];
  /** Orbital configuration for the 3D scene */
  orbit: {
    radius: number;
    speed: number;
    tilt: number;
    phase: number;
    incline: number;
  };
}

const orbit = (
  radius: number,
  speed: number,
  tilt: number,
  phase: number,
  incline: number,
) => ({ radius, speed, tilt, phase, incline });

export const PROVIDERS: AplxProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    color: "#7dd3fc",
    models: ["GPT-5", "GPT-4o", "o3", "GPT-4.1"],
    orbit: orbit(3.6, 0.22, 0.18, 0.0, 0.05),
  },
  {
    id: "anthropic",
    name: "Anthropic",
    color: "#c4b5fd",
    models: ["Claude Opus 4", "Claude Sonnet 4", "Claude Haiku 3.5"],
    orbit: orbit(4.15, -0.17, -0.24, 0.57, -0.08),
  },
  {
    id: "google",
    name: "Google",
    color: "#93c5fd",
    models: ["Gemini 2.5 Pro", "Gemini 2.5 Flash"],
    orbit: orbit(4.7, 0.14, 0.32, 1.14, 0.12),
  },
  {
    id: "meta",
    name: "Meta",
    color: "#a5f3fc",
    models: ["Llama 4 Maverick", "Llama 3.3 70B"],
    orbit: orbit(5.2, -0.12, -0.12, 1.71, 0.18),
  },
  {
    id: "mistral",
    name: "Mistral",
    color: "#bae6fd",
    models: ["Mistral Large", "Codestral", "Mistral Small"],
    orbit: orbit(5.65, 0.1, 0.26, 2.28, -0.15),
  },
  {
    id: "xai",
    name: "xAI",
    color: "#ddd6fe",
    models: ["Grok 4", "Grok 3 Mini"],
    orbit: orbit(6.1, -0.09, -0.3, 2.85, 0.09),
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    color: "#99f6e4",
    models: ["DeepSeek V3", "DeepSeek R1"],
    orbit: orbit(6.5, 0.08, 0.14, 3.42, -0.2),
  },
  {
    id: "cohere",
    name: "Cohere",
    color: "#bfdbfe",
    models: ["Command R+", "Embed v3"],
    orbit: orbit(6.9, -0.075, -0.2, 3.99, 0.22),
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: "#cffafe",
    models: ["Sonar Pro", "Sonar Reasoning"],
    orbit: orbit(7.25, 0.065, 0.34, 4.56, 0.04),
  },
  {
    id: "groq",
    name: "Groq",
    color: "#e0e7ff",
    models: ["Llama 70B (speed)", "Mixtral (speed)"],
    orbit: orbit(7.6, -0.06, -0.16, 5.13, -0.06),
  },
  {
    id: "ollama",
    name: "Ollama",
    color: "#c7d2fe",
    models: ["Local models", "Custom GGUF"],
    orbit: orbit(7.95, 0.055, 0.22, 5.7, 0.16),
  },
];

export const LAUNCH_URL = "https://aplx-webapp.vercel.app";
export const GITHUB_URL = "https://github.com/Korentic/Aplx";

export const TOTAL_MODELS = PROVIDERS.reduce((n, p) => n + p.models.length, 0);
