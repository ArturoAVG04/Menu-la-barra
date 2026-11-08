export const THEME_STORAGE_KEY = "la-barra-theme";

// Se ejecuta en <head> antes de pintar: usa el tema guardado o, si no hay, el del sistema.
// Evita que la página se vea blanca un instante antes de pasar a modo oscuro.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t}catch(e){}})();`;
