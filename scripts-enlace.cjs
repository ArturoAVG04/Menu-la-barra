const path = require('path');
const { cert, initializeApp } = require(path.join(process.cwd(), 'node_modules/firebase-admin/lib/app'));
const { getFirestore } = require(path.join(process.cwd(), 'node_modules/firebase-admin/lib/firestore'));
const [slug, url] = process.argv.slice(2);
initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n') }) });
const ref = getFirestore().collection('enlaces').doc(slug);
ref.get().then(s => { console.log('antes:', s.data()); return ref.set({ url }, { merge: true }); })
  .then(() => ref.get()).then(s => console.log('ahora:', s.data()));
