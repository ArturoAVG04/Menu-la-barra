import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { LEGAL_OWNER } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos y condiciones | La Barra",
  description: "Condiciones para hacer pedidos en el menú digital de La Barra."
};

export default function TerminosPage() {
  const o = LEGAL_OWNER;
  return (
    <LegalPage title="Términos y condiciones">
      <p>
        Estos términos aplican a los pedidos hechos en el menú digital de <strong>{o.businessName}</strong>,
        operado por {o.ownerName}, con domicilio en {o.address}. Contacto: WhatsApp{" "}
        <a href={o.whatsappHref}>{o.whatsapp}</a>. Al enviar un pedido aceptas estos términos y nuestro{" "}
        <Link href="/privacidad">Aviso de privacidad</Link>.
      </p>

      <h2>1. Pedidos</h2>
      <ul>
        <li>Un pedido queda confirmado cuando la sucursal lo acepta; puedes ver su estado en el seguimiento.</li>
        <li>
          Todos los productos están sujetos a disponibilidad. Si algo se agota, te contactaremos para cambiarlo o
          ajustar el pedido.
        </li>
        <li>
          Cada sucursal (Noria Alta, combi en Presa de la Olla, eventos) puede tener productos y horarios
          distintos.
        </li>
      </ul>

      <h2>2. Precios y pagos</h2>
      <ul>
        <li>Los precios están en pesos mexicanos y son los que se muestran en el menú al momento de pedir.</li>
        <li>El pago se hace al recibir o recoger el pedido, en efectivo o con tarjeta en terminal física.</li>
        <li>La propina es voluntaria y puedes elegir 0 %.</li>
        <li>Los precios en aplicaciones de reparto (Uber Eats, Rappi, DiDi) pueden ser distintos a los de este menú.</li>
      </ul>

      <h2>3. Cancelaciones y aclaraciones</h2>
      <ul>
        <li>Puedes cancelar sin costo antes de que empecemos a preparar tu pedido, escribiéndonos por WhatsApp.</li>
        <li>
          Si recibiste un producto incorrecto o en mal estado, avísanos por WhatsApp el mismo día y lo
          resolvemos (reposición o devolución de lo pagado por ese producto).
        </li>
      </ul>

      <h2>4. Alergias e ingredientes</h2>
      <p>
        Nuestra cocina maneja trigo (gluten), lácteos, huevo, soya, cacahuate y otros alérgenos. Si tienes una
        alergia, indícalo en la nota del pedido; aun así no podemos garantizar que no haya contacto cruzado.
      </p>

      <h2>5. Imágenes</h2>
      <p>Las fotos son ilustrativas; la presentación real puede variar ligeramente.</p>

      <h2>6. Quejas</h2>
      <p>
        Cualquier queja la atendemos primero por WhatsApp. Como consumidor también puedes acudir a la
        Procuraduría Federal del Consumidor (PROFECO).
      </p>
    </LegalPage>
  );
}
