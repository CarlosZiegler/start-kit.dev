import type { Plugin } from "vite";

const REFLECT_POLYFILL = `
if (typeof Reflect.getMetadata !== "function") {
  const m = new WeakMap();
  const get = (t, p) => m.get(t)?.get(p);
  const set = (t, p) => {
    let a = m.get(t); if (!a) { a = new Map(); m.set(t, a); }
    let b = a.get(p); if (!b) { b = new Map(); a.set(p, b); }
    return b;
  };
  const find = (k, t, p) => { const x = get(t, p); if (x?.has(k)) return x.get(k); const pr = Object.getPrototypeOf(t); return pr ? find(k, pr, p) : undefined; };
  Reflect.getMetadata = (k, t, p) => find(k, t, p);
  Reflect.getOwnMetadata = (k, t, p) => get(t, p)?.get(k);
  Reflect.defineMetadata = (k, v, t, p) => set(t, p).set(k, v);
  Reflect.hasMetadata = (k, t, p) => find(k, t, p) !== undefined;
  Reflect.hasOwnMetadata = (k, t, p) => get(t, p)?.has(k) ?? false;
  Reflect.metadata = (k, v) => (t, p) => set(t, p).set(k, v);
}
`;

export function reflectPolyfillPlugin(): Plugin {
	return {
		name: "reflect-polyfill",
		renderChunk(code, chunk) {
			if (chunk.fileName.includes("passkey")) {
				return REFLECT_POLYFILL + code;
			}
			return null;
		},
	};
}
