// Reescribe las descripciones del menú (2026-11-25). Respaldo previo: second-brain/03-la-barra/respaldo-productos-2026-11-25.json
// Uso: node --env-file=.env.local scripts/descripciones-2026-11-25.cjs [--aplicar]
const path = require('path');
const { cert, initializeApp } = require(path.join(process.cwd(), 'node_modules/firebase-admin/lib/app'));
const { getFirestore } = require(path.join(process.cwd(), 'node_modules/firebase-admin/lib/firestore'));
initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n') }) });
const D = {
  'Especial': 'La clásica: carne a la plancha, queso amarillo, lechuga, jitomate y aderezo de la casa, en pan jumbo tostadito.',
  'Pollo': 'Pollo empanizado y crujiente con queso amarillo, salsa BBQ, lechuga, jitomate y aderezo de la casa, en pan jumbo.',
  'Cheese Bacon': 'Carne de sirloin con tocino crujiente, salsa BBQ, queso mozzarella y amarillo, lechuga y jitomate.',
  'Hawaiana': 'Carne de sirloin con piña asada, salsa BBQ, queso mozzarella y amarillo, lechuga y jitomate, en pan jumbo.',
  'Champi': 'Carne de sirloin con champiñones, queso mozzarella y amarillo, lechuga y jitomate.',
  'Monstruo': 'Para mucha hambre: doble carne de sirloin, queso asadero y amarillo, aros de cebolla, salsa BBQ, lechuga y jitomate.',
  'Papas a la francesa': 'Papas a la francesa doraditas, con el sazón de la casa.',
  'Orden de 10 alitas': '10 alitas bañadas en la salsa que elijas: BBQ, Mango Habanero, Buffalo o Hot Ranch.',
  'Orden de 20 alitas': '20 alitas para compartir, bañadas en la salsa que elijas: BBQ, Mango Habanero, Buffalo o Hot Ranch.',
  'Boneless (300g)': '300 g de pechuga de pollo empanizada, bañada en la salsa que elijas. Incluye papas a la francesa.',
  'Boneless (500g)': '500 g de pechuga de pollo empanizada, bañada en la salsa que elijas. Incluye papas a la francesa.',
  'Combo 1': 'Hamburguesa Especial con bebida: horchata o Coca-Cola de 400 ml. Cámbiala por Cheese Bacon, Hawaiana o Champi por $29 más.',
  'Combo 2': 'Combo con hamburguesa Especial y bebida: horchata o Coca-Cola de 400 ml. Cámbiala por Cheese Bacon, Hawaiana o Champi por $29 más.',
  'Combo 3': 'Nuestro combo más grande, con hamburguesa Especial. Cámbiala por Cheese Bacon, Hawaiana o Champi por $29 más.',
  'Agua de horchata': 'Agua fresca de horchata, bien fría.',
  'Chimichurri': 'Salsa de perejil, ajo y aceite para darle más sabor a tus papas, alitas o hamburguesa.',
  'Pulled pork sandwich': 'Cerdo deshebrado en pan brioche, con papas a la francesa.',
  'Tender sandwich': 'Tiras de pollo empanizadas en la salsa que elijas, con lechuga y jitomate en pan. Incluye papas a la francesa.',
};
(async () => {
  const db = getFirestore(); const aplicar = process.argv.includes('--aplicar'); const batch = db.batch(); let n = 0;
  for (const b of (await db.collection('sucursales').get()).docs) {
    for (const p of (await b.ref.collection('products').get()).docs) {
      const nombre = (p.data().name || '').trim(); const nueva = D[nombre];
      if (!nueva) { console.log('SIN CAMBIO', nombre); continue; }
      if (p.data().description === nueva) continue;
      console.log(`${nombre}: ${nueva}`); batch.update(p.ref, { description: nueva }); n++;
    }
  }
  if (aplicar) { await batch.commit(); console.log('Aplicado:', n); } else console.log('Prueba (sin --aplicar):', n);
})();
