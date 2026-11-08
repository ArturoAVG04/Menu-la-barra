import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { LEGAL_OWNER } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Aviso de privacidad | La Barra",
  description: "Cómo La Barra trata los datos personales de sus clientes."
};

export default function PrivacidadPage() {
  const o = LEGAL_OWNER;
  return (
    <LegalPage title="Aviso de privacidad">
      <p>
        Este aviso se emite conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
        Particulares y su normativa aplicable.
      </p>

      <h2>1. Responsable</h2>
      <p>
        {o.ownerName}, quien opera el negocio <strong>{o.businessName}</strong>, con domicilio en {o.address}, es
        responsable del tratamiento de tus datos personales. Contacto: WhatsApp{" "}
        <a href={o.whatsappHref}>{o.whatsapp}</a>.
      </p>

      <h2>2. Datos que recabamos</h2>
      <ul>
        <li>Nombre (o el nombre con el que quieras identificar tu pedido).</li>
        <li>Número de teléfono.</li>
        <li>
          Dirección o referencias de entrega, solo si las escribes en la nota del pedido o nos las envías por
          WhatsApp.
        </li>
        <li>Contenido de tu pedido, notas, propina, fecha y hora.</li>
        <li>Si lo autorizas en tu navegador, un identificador técnico para enviarte notificaciones del pedido.</li>
      </ul>
      <p>
        <strong>No recabamos datos personales sensibles</strong> ni datos bancarios: los pagos se hacen en efectivo
        o con terminal física al recibir o recoger tu pedido. Te pedimos no escribir información sensible en las
        notas.
      </p>

      <h2>3. Para qué usamos tus datos</h2>
      <p>
        <strong>Finalidades necesarias</strong> (sin ellas no podemos atender tu pedido):
      </p>
      <ul>
        <li>Recibir, preparar y entregar tu pedido o tenerlo listo para que lo recojas.</li>
        <li>Contactarte por teléfono o WhatsApp sobre tu pedido (confirmación, cambios, aclaraciones).</li>
        <li>Mostrarte el estado de tu pedido y, si lo autorizas, enviarte notificaciones.</li>
        <li>Atender quejas, aclaraciones y cumplir obligaciones legales.</li>
      </ul>
      <p>
        <strong>Finalidades opcionales:</strong> enviarte promociones de {o.businessName} por WhatsApp. Solo lo
        haremos si nos lo pides o aceptas expresamente, y puedes pedir que dejemos de hacerlo en cualquier momento
        respondiendo &quot;BAJA&quot; o escribiéndonos.
      </p>

      <h2>4. Con quién se comparten</h2>
      <p>
        <strong>No vendemos ni compartimos tus datos con terceros</strong> para sus propios fines. Para operar el
        menú usamos proveedores tecnológicos que guardan o procesan la información únicamente por cuenta nuestra:
        Google Firebase (base de datos y notificaciones), Vercel (alojamiento del sitio) y WhatsApp (si eliges
        enviarnos tu pedido por ese medio). Podremos entregar datos a autoridades cuando una ley u orden
        competente lo exija.
      </p>

      <h2>5. Cuánto tiempo los guardamos</h2>
      <p>
        Los pedidos en línea (con nombre y teléfono) <strong>se eliminan automáticamente a los 3 días</strong> de
        haberse creado. Para nuestra contabilidad solo conservamos el registro de la venta (productos y monto), sin
        tus datos de contacto. Si nos escribes por WhatsApp, la conversación se conserva en el teléfono del negocio
        mientras sea útil para atenderte; puedes pedir que la borremos. En tu dispositivo, el navegador guarda tu nombre y teléfono para no pedírtelos de
        nuevo; puedes borrarlos limpiando los datos del sitio en tu navegador.
      </p>

      <h2>6. Tus derechos (ARCO) y cómo revocar tu consentimiento</h2>
      <p>
        Puedes <strong>acceder</strong> a tus datos, <strong>rectificarlos</strong>, <strong>cancelarlos</strong>,{" "}
        <strong>oponerte</strong> a su uso o <strong>revocar</strong> tu consentimiento. Envía tu solicitud por
        WhatsApp al <a href={o.whatsappHref}>{o.whatsapp}</a> indicando tu nombre, el teléfono que usaste, qué
        derecho quieres ejercer y, si aplica, el pedido relacionado. Podremos pedirte confirmar tu identidad.
        Responderemos dentro de los plazos que marca la ley.
      </p>
      <p>
        Si consideras que tu derecho a la protección de datos fue vulnerado, puedes acudir a la autoridad
        competente en materia de protección de datos personales.
      </p>

      <h2>7. Almacenamiento local y cookies</h2>
      <p>
        El sitio usa el almacenamiento local de tu navegador para recordar tu carrito, tus datos de contacto y el
        pedido en curso. No usamos cookies de publicidad ni rastreadores de terceros.
      </p>

      <h2>8. Cambios a este aviso</h2>
      <p>
        Cualquier cambio se publicará en esta misma página con su fecha de actualización. Consulta también
        nuestros <Link href="/terminos">Términos y condiciones</Link>.
      </p>
    </LegalPage>
  );
}
