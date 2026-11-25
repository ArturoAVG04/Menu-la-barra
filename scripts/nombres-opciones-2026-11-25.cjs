// Corrige nombres de personalizaciones (Elije→Elige, Coca-Cola 400 ml, espacios). Respaldo: second-brain/03-la-barra/datos/respaldo-productos-2026-11-25.json
const path = require('path');
const { cert, initializeApp } = require(path.join(process.cwd(), 'node_modules/firebase-admin/lib/app'));
const { getFirestore } = require(path.join(process.cwd(), 'node_modules/firebase-admin/lib/firestore'));
initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n') }) });
const fix = (t) => (t || '').trim().replace(/^Elije\b/, 'Elige').replace(/^Coca cola 400ml$/i, 'Coca-Cola 400 ml');
const fixMod = (m) => ({ ...m, name: fix(m.name), options: (m.options || []).map((o) => ({ ...o, name: fix(o.name) })) });
(async () => {
  const db = getFirestore(); const batch = db.batch(); let n = 0;
  for (const b of (await db.collection('sucursales').get()).docs) {
    for (const d of (await b.ref.collection('modifiers').get()).docs) {
      const nuevo = fixMod(d.data()); if (JSON.stringify(nuevo) !== JSON.stringify(d.data())) { batch.set(d.ref, nuevo); n++; }
    }
    for (const d of (await b.ref.collection('products').get()).docs) {
      const p = d.data(); const mods = (p.modifiers || []).map(fixMod); const name = fix(p.name);
      if (JSON.stringify(mods) !== JSON.stringify(p.modifiers || []) || name !== p.name) { batch.update(d.ref, { modifiers: mods, name }); n++; }
    }
  }
  if (process.argv.includes('--aplicar')) { await batch.commit(); console.log('Aplicado:', n); } else console.log('Prueba:', n);
})();
