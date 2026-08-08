import { NextResponse, type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/server/auth";

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL?.trim(),
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash"
].filter((model, index, models): model is string => Boolean(model) && models.indexOf(model) === index);

function getGeminiApiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

type GenerateDescriptionRequest = {
  productName?: string;
  categoryName?: string;
  notes?: string;
  previousDescription?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

function cleanInput(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function buildPrompt({
  productName,
  categoryName,
  notes,
  previousDescription
}: {
  productName: string;
  categoryName: string;
  notes: string;
  previousDescription: string;
}) {
  return [
    'Eres el mesero estrella de "La Barra". Conoces el menú, hablas como alguien real y sabes vender comida sin sonar exagerado ni falso.',
    "Tu tarea es escribir UNA descripción nueva para un producto del menú digital, usando el nombre, la categoría y las notas del administrador.",
    "",
    "Objetivo:",
    "- Que el cliente entienda rápido qué es.",
    "- Que se le antoje.",
    "- Que cierre con una invitación sutil a pedirlo, sin sonar desesperado.",
    "",
    "Reglas de redacción obligatorias:",
    "1. Escribe 2 oraciones. Máximo 45 palabras en total.",
    "2. Primera oración: describe el producto con ingredientes o preparación.",
    "3. Segunda oración: remata con el valor del platillo y una invitación natural a pedirlo.",
    "4. Usa español mexicano natural, cálido y directo.",
    "5. No inventes ingredientes. Si no hay notas, usa sólo el nombre/categoría y habla de preparación/sabor de forma general.",
    "6. Evita duplicar ideas o palabras vecinas: no escribas pares como jugosa y suculenta, crujiente y crocante, deliciosa y sabrosa.",
    "7. No uses signos de exclamación.",
    "8. No uses clichés ni frases de IA: claro que sí, por supuesto, presentamos, deleita tu paladar, festín de sabores, sinfonía, explosión de sabor, no te lo pierdas.",
    "9. No menciones que eres IA, mesero, asistente ni modelo.",
    "10. Devuelve únicamente la descripción final, sin títulos, comillas, listas ni explicación.",
    previousDescription
      ? "11. Texto anterior a evitar: genera una versión distinta, con otra estructura y otras palabras. No lo copies, no lo edites mínimamente y no conserves el mismo cierre."
      : "11. Crea una versión pulida desde cero.",
    "",
    `Producto: ${productName}`,
    `Categoría: ${categoryName || "Sin categoría"}`,
    `Notas/Ingredientes del administrador: ${notes || "Sin notas adicionales"}`,
    previousDescription ? `Descripción anterior que debes evitar: ${previousDescription}` : ""
  ].join("\n");
}

function extractDescription(payload: GeminiResponse | null) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || ""
  );
}

function normalizeForCompare(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAdjacentRedundancy(value: string) {
  const words = normalizeForCompare(value).split(" ");
  return words.some((word, index) => index > 0 && word.length > 4 && word === words[index - 1]);
}

async function requestGeminiDescription({
  apiKey,
  model,
  productName,
  categoryName,
  notes,
  previousDescription,
  attempt
}: {
  apiKey: string;
  model: string;
  productName: string;
  categoryName: string;
  notes: string;
  previousDescription: string;
  attempt: number;
}) {
  const response = await fetch(`${getGeminiApiUrl(model)}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                buildPrompt({ productName, categoryName, notes, previousDescription }),
                attempt > 1
                  ? "Esta es una regeneración. Piensa otra ruta creativa y evita repetir la respuesta anterior."
                  : ""
              ].join("\n")
            }
          ]
        }
      ],
      generationConfig: {
        temperature: attempt > 1 ? 0.9 : 0.78,
        topP: 0.92,
        maxOutputTokens: 120
      }
    })
  });

  const responseBody = (await response.json().catch(() => null)) as GeminiResponse | null;
  return { response, responseBody, description: extractDescription(responseBody) };
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser(request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No autorizado." },
      { status: 401 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY no está configurada en el servidor." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as GenerateDescriptionRequest | null;
  const productName = cleanInput(body?.productName, 120);
  const categoryName = cleanInput(body?.categoryName, 80);
  const notes = cleanInput(body?.notes, 600);
  const previousDescription = cleanInput(body?.previousDescription, 600);

  if (!productName) {
    return NextResponse.json({ error: "productName es obligatorio." }, { status: 400 });
  }

  let lastError = "Error en la integración con Gemini.";
  let description = "";

  for (const model of GEMINI_MODELS) {
    for (const attempt of [1, 2]) {
      const result = await requestGeminiDescription({
        apiKey,
        model,
        productName,
        categoryName,
        notes,
        previousDescription: attempt === 1 ? previousDescription : previousDescription || description,
        attempt
      });

      if (!result.response.ok) {
        lastError = `${model}: ${result.responseBody?.error?.message || lastError}`;
        break;
      }

      description = result.description;
      const normalizedDescription = normalizeForCompare(description);
      const normalizedPrevious = normalizeForCompare(previousDescription);

      if (
        description &&
        !hasAdjacentRedundancy(description) &&
        (!normalizedPrevious || normalizedDescription !== normalizedPrevious)
      ) {
        break;
      }
    }

    if (description) {
      break;
    }
  }

  if (!description) {
    return NextResponse.json({ error: lastError }, { status: 502 });
  }

  return NextResponse.json({ description });
}
