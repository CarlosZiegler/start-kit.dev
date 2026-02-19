/** biome-ignore-all lint/complexity/noArguments: <explanation> */
/** biome-ignore-all lint/complexity/useOptionalChain: <explanation> */
/** biome-ignore-all lint/complexity/noForEach: <explanation> */
/** biome-ignore-all lint/performance/noDelete: <explanation> */
export const themeScript = (() => {
  /*
   * Avoid flickering screen when refreshing on dark mode
   * https://dev.to/izznatsir/flicker-free-dark-mode-in-vite-spa-180o
   */

  function themeFn() {
    const classList = document.documentElement.classList;
    const style = document.documentElement.style;
    const dark = window.matchMedia("(prefers-color-scheme: dark)");

    const update = () => {
      if (
        localStorage.theme === "dark" ||
        (!localStorage.theme && dark.matches)
      ) {
        classList.add("dark");
        style.colorScheme = "dark";
      } else {
        classList.remove("dark");
        style.colorScheme = "light";
      }
    };
    update();

    if (dark instanceof EventTarget) {
      dark.addEventListener("change", () => {
        delete localStorage.theme;
        update();
      });
    } else {
      // @ts-expect-error
      dark.addListener(() => {
        delete localStorage.theme;
        update();
      });
    }
    window.addEventListener("storage", update);
  }
  return `(${themeFn.toString()})();`;
})();

export default function applyGoogleTranslateDOMPatch() {
  if (typeof Node === "function" && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;
    // @ts-expect-error
    Node.prototype.removeChild = function (child) {
      if (child.parentNode !== this) {
        if (console) {
          console.error(
            "Cannot remove a child from a different parent",
            child,
            this
          );
        }
        return child;
      }
      // @ts-expect-error
      return originalRemoveChild.apply(this, arguments);
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    // @ts-expect-error
    Node.prototype.insertBefore = function (newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (console) {
          console.error(
            "Cannot insert before a reference node from a different parent",
            referenceNode,
            this
          );
        }
        return newNode;
      }
      // @ts-expect-error
      return originalInsertBefore.apply(this, arguments);
    };
  }
}
