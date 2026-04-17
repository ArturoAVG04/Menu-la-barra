export async function uploadToImgBB(file: File) {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error("Falta NEXT_PUBLIC_IMGBB_API_KEY en el entorno.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("No se pudo subir la imagen a ImgBB.");
  }

  const payload = await response.json();
  return payload.data.url as string;
}

