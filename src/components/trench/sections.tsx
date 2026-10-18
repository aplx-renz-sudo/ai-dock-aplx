import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  Info,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  FAQS,
  FEATURES,
  PROVIDERS,
  STEPS,
  TRENCH_DOCS_URL,
  TRENCH_LICENSE,
  TRENCH_LICENSE_URL,
  TRENCH_REPO_URL,
  TRENCH_URL,
  VERSION_LABEL,
  VILEDOCX_REPO_URL,
  VILEDOCX_URL,
} from "./data";

/* --------------------------------- helpers -------------------------------- */

export function SectionHead({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="tr-section-head">
      <p className="tr-kicker">{kicker}</p>
      <h2 className="tr-h2">{title}</h2>
      {sub ? <p className="tr-sub">{sub}</p> : null}
    </div>
  );
}

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
    >
      {children}
    </a>
  );
}

/* ------------------------------ whale artwork ----------------------------- */

/** Whale-tail mark used as the TRENCH logo. */
export function WhaleMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14.6 6.2c-1.9 3.2-2.9 6.4-2.9 9.8s1 6.6 2.9 9.8c.5.8-.4 1.7-1.2 1.1C9.2 24.4 6.4 20.4 6.4 16S9.2 7.6 13.4 5.1c.8-.5 1.7.4 1.2 1.1Zm2.8 0c1.9 3.2 2.9 6.4 2.9 9.8s-1 6.6-2.9 9.8c-.5.8.4 1.7 1.2 1.1 4.2-2.5 7-6.5 7-10.9s-2.8-8.4-7-10.9c-.8-.5-1.7.4-1.2 1.1Z" />
    </svg>
  );
}

/**
 * Low-contrast whale silhouette for the hero. Deliberately abstract: depth,
 * not decoration.
 */
function WhaleSilhouette() {
  return (
    <svg
      className="tr-whale"
      viewBox="0 0 720 340"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tr-whale-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3ad3e3" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2b7fe3" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <path
        d="M40 186c14-56 76-94 164-96 92-2 166 26 232 70 17 11 34 16 48 10l38-22c10-6 21 1 21 12v36l20 15c9 7 5 20-6 22l-49 8c-58 38-136 58-218 56C166 294 56 254 40 186Z"
        fill="url(#tr-whale-g)"
      />
      <path
        d="M74 224c26 26 66 42 112 48-46-18-86-38-112-48Z"
        fill="#2b7fe3"
        opacity="0.5"
      />
      <circle cx="120" cy="172" r="7" fill="#04070a" />
    </svg>
  );
}

/* ---------------------------------- hero ---------------------------------- */

export function Hero({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  return (
    <section className="tr-hero" id="trench-top">
      <WhaleSilhouette />
      <div className="tr-wrap tr-hero-grid">
        <div className="tr-hero-copy">
          <p className="tr-status tr-reveal">
            <span className="tr-status-dot" />
            {VERSION_LABEL}
          </p>

          <h1 className="tr-title tr-reveal tr-reveal-2">
            GO DEEPER.{" "}
            <em>CODE SMARTER.</em>
          </h1>

          <p className="tr-lead tr-reveal tr-reveal-2">
            TRENCH is a terminal-native AI coding agent. Bring your own API
            keys, choose your model, and work from the command line.
          </p>

          <div className="tr-cta-row tr-reveal tr-reveal-3">
            <ExternalLink
              href={TRENCH_URL}
              className="tr-btn tr-btn-primary"
            >
              <Github size={17} />
              Explore on GitHub
            </ExternalLink>
            <button
              type="button"
              className="tr-btn tr-btn-ghost"
              onClick={() => onScrollTo("trench-features")}
            >
              Explore the Features
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="tr-hero-meta tr-reveal tr-reveal-3">
            <span>
              <a
                className="tr-hero-parent"
                href={VILEDOCX_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                A VileDocx Project
              </a>
            </span>
            <span aria-hidden className="tr-sep" />
            <span>{TRENCH_LICENSE} licensed</span>
            <span aria-hidden className="tr-sep" />
            <span>Not yet released</span>
          </div>
        </div>

        <HeroTerminal />
      </div>
    </section>
  );
}

const STARTUP = `$ trench

          .
          ":"
        ___:____     |"\\/"|
      ,'        \`.    \\  /
      |  O        \\___/  |
    ~^~^~^~^~^~^~^~^~^~^~^~^~^~^

  TRENCH T01                      terminal-native
  provider   google gemini
  model      gemini-3.5-flash
  route      direct -> provider api

  Type /help to see available commands.`;

function HeroTerminal() {
  const lines = STARTUP.split("\n");

  return (
    <div className="tr-term tr-reveal tr-reveal-2">
      <div className="tr-term-bar">
        <span className="tr-term-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="tr-term-title">trench — t01</span>
        <span className="tr-term-tag">startup</span>
      </div>
      <div className="tr-term-body">
        <pre
          className="tr-term-pre"
          role="img"
          aria-label="Illustrative TRENCH startup banner: TRENCH T01, provider Google Gemini, model gemini-3.5-flash, direct requests to the provider API, and a prompt to type /help."
        >
          {lines.map((line, index) => (
            <span key={index} aria-hidden>
              {line === "  TRENCH T01                      terminal-native" ? (
                <>
                  <span className="tr-c-cyan">  TRENCH T01</span>
                  <span className="tr-c-dim">{line.slice(12)}</span>
                </>
              ) : line.startsWith("  provider") ||
                line.startsWith("  model") ||
                line.startsWith("  route") ? (
                <>
                  <span className="tr-c-dim">{line.slice(0, 13)}</span>
                  <span className="tr-c-blue">{line.slice(13)}</span>
                </>
              ) : line.startsWith("  Type") ? (
                <span className="tr-c-dim">{line}</span>
              ) : line.startsWith("$") ? (
                <span className="tr-c-green">{line}</span>
              ) : line.includes("|") || line.includes("~^") ? (
                <span className="tr-c-whale">{line}</span>
              ) : (
                line
              )}
              {"\n"}
            </span>
          ))}
        </pre>
      </div>
      <div className="tr-term-hint">
        <span>illustrative interface · not a live session</span>
        <span className="tr-cursor" aria-hidden />
      </div>
    </div>
  );
}

/* --------------------------- interactive preview -------------------------- */

type DemoLine = { text: string; tone?: "cmd" | "cyan" | "dim" | "whale" };

const DEMO_LINES: DemoLine[] = [
  { text: "$ trench", tone: "cmd" },
  { text: "TRENCH T01", tone: "cyan" },
  { text: "Provider: Google Gemini" },
  { text: "Model: gemini-3.5-flash" },
  { text: "Requests go directly to the selected provider API." },
  { text: "Type /help to see available commands.", tone: "dim" },
  { text: "" },
  { text: "> /help", tone: "cmd" },
  {
    text: "Command reference ships with the T01 build.",
    tone: "dim",
  },
  { text: "Setup instructions coming soon.", tone: "dim" },
  { text: "> ", tone: "cmd" },
];

const TONE_CLASS: Record<NonNullable<DemoLine["tone"]>, string> = {
  cmd: "tr-c-green",
  cyan: "tr-c-cyan",
  dim: "tr-c-dim",
  whale: "tr-c-whale",
};

/* Character offset of each line in the flattened transcript. */
const DEMO_OFFSETS: number[] = [];
let demoCursor = 0;
for (const line of DEMO_LINES) {
  DEMO_OFFSETS.push(demoCursor);
  demoCursor += line.text.length + 1;
}
const DEMO_TOTAL = demoCursor;

export function TerminalPreview() {
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState(DEMO_TOTAL);
  const timer = useRef<number | null>(null);
  const typing = typed < DEMO_TOTAL;

  useEffect(() => {
    if (typed >= DEMO_TOTAL) return;
    timer.current = window.setTimeout(
      () => setTyped((value) => Math.min(DEMO_TOTAL, value + 2)),
      reduceMotion ? 0 : 11,
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [typed, reduceMotion]);

  const restart = () =>
    setTyped(reduceMotion ? DEMO_TOTAL : 0);

  return (
    <section className="tr-section" id="trench-product">
      <div className="tr-wrap">
        <SectionHead
          kicker="Product"
          title="The terminal is the product."
          sub="No dashboard, no chat panel. TRENCH is a command-line environment where you pick a provider, pick a model, and get back to the project you were already in."
        />

        <div className="tr-term" style={{ marginTop: 40 }}>
          <div className="tr-term-bar">
            <span className="tr-term-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="tr-term-title">trench — interactive preview</span>
            <span className="tr-term-tag">simulated</span>
          </div>
          <div className="tr-term-body">
            <pre className="tr-term-pre" aria-hidden>
              {DEMO_LINES.map((line, index) => {
                const start = DEMO_OFFSETS[index];
                if (typed <= start && line.text !== "") return null;
                const visible = line.text.slice(
                  0,
                  Math.max(0, typed - start),
                );
                return (
                  <span key={index}>
                    <span className={line.tone ? TONE_CLASS[line.tone] : ""}>
                      {visible}
                    </span>
                    {index === DEMO_LINES.length - 1 &&
                    typed >= DEMO_TOTAL ? (
                      <span className="tr-cursor" />
                    ) : null}
                    {"\n"}
                  </span>
                );
              })}
            </pre>
          </div>
          <div className="tr-term-hint">
            <span>
              Illustrative preview. Nothing is sent to a provider from this page.
            </span>
            <button
              type="button"
              className="tr-btn tr-btn-ghost tr-btn-sm"
              onClick={restart}
              disabled={typing}
            >
              {typing ? <Play size={13} /> : <RotateCcw size={13} />}
              {typing ? "Typing…" : "Replay session"}
            </button>
          </div>
        </div>

        <p className="tr-note">
          <Info size={15} aria-hidden />
          <span>
            <strong>T01 is under construction.</strong> The transcript above is
            drawn from the project's announced interface, not a recording of a
            shipped build. Command output will be documented when T01 lands.
          </span>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------- features -------------------------------- */

export function Features() {
  return (
    <section className="tr-section" id="trench-features">
      <div className="tr-wrap">
        <SectionHead
          kicker="Features"
          title="Built for people who live in a shell."
          sub="These are the properties T01 is being built around. It is a terminal tool for coding work — not a general-purpose chat product."
        />

        <div className="tr-features">
          {FEATURES.map((feature) => (
            <article className="tr-feature" key={feature.n}>
              <span className="tr-feature-num tr-mono">{feature.n}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>

        <p className="tr-note">
          <Info size={15} aria-hidden />
          <span>
            <strong>Scope note.</strong> This page describes the intended T01
            feature set. No stable release has been published, and features
            still in development are not presented here as finished.
          </span>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------- providers ------------------------------- */

export function Providers() {
  return (
    <section className="tr-section" id="trench-providers">
      <div className="tr-wrap">
        <SectionHead
          kicker="Providers"
          title="Your keys. Your provider. Your bill."
          sub="TRENCH is designed to plug into the provider you already use instead of reselling model access. This is the T01 provider set."
        />

        <div className="tr-providers">
          {PROVIDERS.map((provider) => (
            <div className="tr-provider" key={provider.name}>
              <div className="tr-provider-top">
                <span className="tr-provider-name">{provider.name}</span>
                <span className="tr-provider-kind">{provider.kind}</span>
              </div>
              <span className="tr-provider-note">{provider.note}</span>
              <span className="tr-provider-rule" aria-hidden />
            </div>
          ))}
        </div>

        <p className="tr-note">
          <Info size={15} aria-hidden />
          <span>
            <strong>Provider terms apply.</strong> Provider availability, model
            compatibility, pricing and rate limits all come from the provider
            you choose, not from TRENCH. The provider list may change while T01
            is in development — check the repository for the current state.
          </span>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------ getting started --------------------------- */

export function GettingStarted() {
  return (
    <section className="tr-section" id="trench-setup">
      <div className="tr-wrap">
        <SectionHead
          kicker="Getting started"
          title="Clone the repo. Wait for the setup notes."
          sub="T01 has no packaged release yet, so there is nothing to install from a registry. The honest sequence right now is short."
        />

        <div className="tr-steps">
          {STEPS.map((step) => (
            <div className="tr-step" key={step.n}>
              <span className="tr-step-num tr-mono">{step.n}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              {"href" in step && step.href ? (
                <ExternalLink
                  href={step.href}
                  className="tr-code"
                >
                  {step.code}
                </ExternalLink>
              ) : (
                <code
                  className={
                    step.code.includes("coming soon")
                      ? "tr-code is-pending"
                      : "tr-code"
                  }
                >
                  {step.code}
                </code>
              )}
            </div>
          ))}
        </div>

        <p className="tr-note">
          <Info size={15} aria-hidden />
          <span>
            <strong>No downloads yet.</strong> There is no installer, package or
            release build for T01. When one exists it will be published in the{" "}
            <a
              href={TRENCH_REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: "var(--tr-cyan)", textDecoration: "underline" }}
            >
              official repository
            </a>
            .
          </span>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------- ecosystem ------------------------------- */

export function Ecosystem() {
  return (
    <section className="tr-section" id="trench-ecosystem">
      <div className="tr-wrap tr-eco">
        <div>
          <p className="tr-kicker">Ecosystem</p>
          <h2 className="tr-h2">ONE ECOSYSTEM. DIFFERENT WAYS TO BUILD.</h2>
          <p className="tr-sub">
            TRENCH is part of the VileDocx ecosystem, bringing terminal-native AI
            coding workflows into the broader collection of developer tools.
          </p>
          <p className="tr-sub">
            VileDocx is the dock: one interface for the providers and models you
            already pay for. TRENCH is the command line: the same
            bring-your-own-provider philosophy, pointed at coding work. They are
            related projects, not the same product.
          </p>
        </div>

        <aside className="tr-eco-card">
          <div className="tr-eco-parent">
            <span className="tr-eco-badge">V</span>
            <div>
              <div className="tr-eco-name">VileDocx</div>
              <div className="tr-eco-kind">Parent project · the AI dock</div>
            </div>
          </div>
          <p>
            Unifies major AI providers, their models and your own API keys in one
            interface. TRENCH lives alongside it in the same ecosystem.
          </p>
          <div className="tr-eco-links">
            <ExternalLink href={VILEDOCX_URL} className="tr-btn tr-btn-ghost tr-btn-sm">
              Visit VileDocx
              <ArrowUpRight size={13} />
            </ExternalLink>
            <ExternalLink
              href={VILEDOCX_REPO_URL}
              className="tr-btn tr-btn-ghost tr-btn-sm"
            >
              <Github size={13} />
              Source
            </ExternalLink>
          </div>
          <div className="tr-eco-divider" />
          <div className="tr-eco-rel">
            <Info size={13} aria-hidden />
            <span>
              TRENCH is a subproject. VileDocx remains its own product and is not
              renamed or replaced by TRENCH.
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ----------------------------------- faq ---------------------------------- */

export function Faq() {
  return (
    <section className="tr-section" id="trench-faq">
      <div className="tr-wrap">
        <SectionHead
          kicker="FAQ"
          title="The questions worth answering."
          sub="Short, honest answers about what TRENCH is, what it costs and where it stands."
        />

        <div className="tr-faq">
          {FAQS.map((faq) => (
            <details className="tr-faq-item" key={faq.q}>
              <summary>
                {faq.q}
                <span className="tr-faq-mark" aria-hidden />
              </summary>
              <div className="tr-faq-answer">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- footer --------------------------------- */

export function TrenchFooter({ onClose }: { onClose: () => void }) {
  return (
    <footer className="tr-footer">
      <div className="tr-wrap">
        <div className="tr-footer-grid">
          <div className="tr-footer-brand">
            <div className="tr-brand" style={{ marginRight: 0 }}>
              <span className="tr-mark">
                <WhaleMark />
              </span>
              <span className="tr-wordmark">
                <span className="tr-word">TRENCH</span>
                <span className="tr-word-sub">T01 · CLI coding agent</span>
              </span>
            </div>
            <p>
              A terminal-native AI coding agent. Bring your own provider keys and
              work from the command line.
            </p>
            <ExternalLink href={VILEDOCX_URL} className="tr-footer-parent">
              <span className="tr-parent-dot" aria-hidden />A VileDocx Project
              <ArrowUpRight size={12} />
            </ExternalLink>
          </div>

          <div>
            <h4>Product</h4>
            <ul>
              <li>
                <button className="tr-nav-link" onClick={() => onClose()}>
                  Back to VileDocx
                </button>
              </li>
              <li>
                <ExternalLink href={TRENCH_URL}>GitHub repository</ExternalLink>
              </li>
              <li>
                <ExternalLink href={TRENCH_DOCS_URL}>Documentation</ExternalLink>
              </li>
              <li>
                <ExternalLink href={TRENCH_LICENSE_URL}>
                  License · {TRENCH_LICENSE}
                </ExternalLink>
              </li>
            </ul>
          </div>

          <div>
            <h4>Project</h4>
            <ul>
              <li>
                <ExternalLink href={VILEDOCX_URL}>VileDocx</ExternalLink>
              </li>
              <li>
                <ExternalLink href={VILEDOCX_REPO_URL}>
                  VileDocx source
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href={`${TRENCH_URL}/issues`}>Issues</ExternalLink>
              </li>
            </ul>
          </div>

          <div>
            <h4>Status</h4>
            <ul>
              <li>
                <span>T01 · Trench version 01</span>
              </li>
              <li>
                <span>Under construction</span>
              </li>
              <li>
                <span>No release published</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="tr-footer-bottom">
          <span>© {new Date().getFullYear()} TRENCH — a VileDocx project.</span>
          <span className="tr-footer-status">
            <span className="tr-status-dot" aria-hidden />
            T01 · under construction
          </span>
        </div>
      </div>
    </footer>
  );
}
