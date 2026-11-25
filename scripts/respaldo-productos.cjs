// Respalda sucursales/*/products y categories a un JSON. Uso: node --env-file=.env.local scripts/respaldo-productos.cjs <salida.json>
const path = require('path');
const { cert, initializeApp } = require(path.join(process.cwd(), 'node_modules/firebase-admin/lib/app'));
const { getFirestore } = require(path.join(process.cwd(), 'node_modules/firebase-admin/lib/firestore'));
initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n') }) });
(async () => {
  const db = getFirestore(); const out = {};
  for (const b of (await db.collection('sucursales').get()).docs) {
    const [c, p] = await Promise.all([b.ref.collection('categories').get(), b.ref.collection('products').get()]);
    out[b.id] = { nombre: b.data().nombre || b.data().name, categories: c.docs.map(d => ({ id: d.id, ...d.data() })), products: p.docs.map(d => ({ id: d.id, ...d.data() })) };
  }
  require('fs').writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
  for (const [id, s] of Object.entries(out)) console.log(id, s.nombre, s.products.length, 'productos');
})();
