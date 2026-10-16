import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Three looks for the whole app:
 *  - dark      the original dark mode (no seasonal decoration)
 *  - halloween the current release theme (trees, pumpkins, blood moon)
 *  - candy     a white light mode washed in pink + yellow
 *
 * The choice is written to <html data-theme="...">, which is what the token
 * blocks and override rules in index.css key off. `.dark` is toggled alongside
 * so the shadcn tokens flip too. Persisted in localStorage.
 */
export type VileTheme = "dark" | "halloween" | "candy";

const STORAGE_KEY = "viledocx-theme";
const DEFAULT_THEME: VileTheme = "halloween";

type ThemeOption = {
  id: VileTheme;
  label: string;
  blurb: string;
  swatch: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "dark",
    label: "Dark",
    blurb: "The original dark mode",
    swatch: "linear-gradient(135deg, #0a0a0a, #3f3f46)",
  },
  {
    id: "halloween",
    label: "Halloween",
    blurb: "Pumpkins, bats & the witch tree",
    swatch: "linear-gradient(135deg, #4c1d95, #f97316)",
  },
  {
    id: "candy",
    label: "Candy (White)",
    blurb: "Light mode in pink & yellow",
    swatch: "linear-gradient(135deg, #f9a8d4, #fde047)",
  },
];

function isTheme(value: string | null): value is VileTheme {
  return value === "dark" || value === "halloween" || value === "candy";
}

const ThemeContext = createContext<{
  theme: VileTheme;
  setTheme: (theme: VileTheme) => void;
}>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<VileTheme>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(saved) ? saved : DEFAULT_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    // Dark and Halloween share the shadcn dark palette; Candy is the light one.
    root.classList.toggle("dark", theme !== "candy");
    root.style.colorScheme = theme === "candy" ? "light" : "dark";
    // Reflect the theme in the browser chrome on mobile.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "candy" ? "#fff6fb" : "#000000");
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage can be unavailable in private mode — the theme still applies */
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * The Settings → Theme picker. Sits in the navbar; opens a small menu of the
 * three themes with a preview swatch and the active one ticked.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open settings"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[12px] font-medium text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
      >
        <Palette className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Settings</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            role="menu"
            aria-label="Theme"
            className="vd-popover absolute right-0 top-10 z-[70] w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Theme
            </p>
            {THEME_OPTIONS.map((option) => {
              const active = option.id === theme;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setTheme(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                    active ? "bg-white/[0.07]" : "hover:bg-white/[0.05]",
                  )}
                >
                  <span
                    aria-hidden
                    className="h-6 w-6 shrink-0 rounded-full border border-white/20"
                    style={{ background: option.swatch }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-white">
                      {option.label}
                    </span>
                    <span className="block truncate text-[11px] text-neutral-500">
                      {option.blurb}
                    </span>
                  </span>
                  {active && (
                    <Check className="h-4 w-4 shrink-0 text-orange-400" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
