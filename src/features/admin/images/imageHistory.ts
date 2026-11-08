const IMAGE_HISTORY_STORAGE_KEY = "la-barra-admin-image-history";
const MAX_IMAGES = 60;

/** Quita vacíos y repetidos conservando el orden. */
export function uniqueUrls(urls: (string | undefined)[]) {
  return [...new Set(urls.filter((url): url is string => Boolean(url?.trim())))];
}

/** Historial de imágenes usadas en este navegador (localStorage). */
export function readImageHistory() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(IMAGE_HISTORY_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? uniqueUrls(parsed).slice(0, MAX_IMAGES) : [];
  } catch {
    return [];
  }
}

export function writeImageHistory(urls: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(IMAGE_HISTORY_STORAGE_KEY, JSON.stringify(uniqueUrls(urls).slice(0, MAX_IMAGES)));
}

/** Imagen soltada o pegada: un archivo de imagen o una URL http(s). */
export function getDroppedImageSource(dataTransfer: DataTransfer) {
  const imageFile = Array.from(dataTransfer.files).find((file) => file.type.startsWith("image/"));
  if (imageFile) return imageFile;

  const url = (dataTransfer.getData("text/uri-list") || dataTransfer.getData("text/plain")).trim();
  return /^https?:\/\//i.test(url) ? url.split("\n")[0] : null;
}
