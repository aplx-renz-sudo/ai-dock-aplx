import { createContext, useContext } from "react";

/**
 * A lightweight callback that triggers the 3D explosion effect.
 * Components call `trigger()` before navigating to an external link.
 */
export const ExplosionCtx = createContext<() => void>(() => {});

export const useExplosion = () => useContext(ExplosionCtx);
