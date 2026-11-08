export const THEME_STORAGE_KEY = "la-barra-theme";

// Se ejecuta en <head> antes de pintar: usa el tema guardado o, si no hay, el del sistema.
// La hidratación de React borra data-theme de <html>; el MutationObserver lo vuelve a poner al instante.
// Evita que la página se vea blanca un instante antes de pasar a modo oscuro.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var d=document.documentElement;window.__laBarraTheme=t;var a=function(){d.dataset.theme=window.__laBarraTheme;d.style.colorScheme=window.__laBarraTheme};a();new MutationObserver(function(){if(d.dataset.theme!==window.__laBarraTheme)a()}).observe(d,{attributes:true,attributeFilter:["data-theme"]})}catch(e){}})();`;

// Mismo criterio que el script, para usarlo en React (la hidratación borra el atributo de <html>).
export function resolveInitialTheme(): "light" | "dark" {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}
