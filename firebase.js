// Firebase 연동: 누구나 보기, 로그인한 허용 계정만 수정 (권한은 Firestore 보안 규칙에서 검사)
// app.js 와는 window.cloud + 'cloud:*' 이벤트로 통신합니다.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, doc, onSnapshot, writeBatch, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAlA0ZATxnhEvUh-ADkFCc8IujRCc2fTZo',
  authDomain: 'move-in-plan.firebaseapp.com',
  projectId: 'move-in-plan',
  storageBucket: 'move-in-plan.firebasestorage.app',
  messagingSenderId: '547009818520',
  appId: '1:547009818520:web:f5dad303123f5d2adc45ed',
};

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const itemsCol = collection(db, 'plans', 'main', 'items');
  const metaDoc = doc(db, 'plans', 'main');

  window.cloud = {
    user: null,
    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signOut: () => signOut(auth),
    async commit({ upserts = [], deletes = [], meta = null }) {
      // Firestore 배치는 최대 500건
      const ops = [
        ...upserts.map(it => b => b.set(doc(itemsCol, it.id), { ...it, _by: auth.currentUser?.displayName || '', _at: serverTimestamp() })),
        ...deletes.map(id => b => b.delete(doc(itemsCol, id))),
      ];
      if (meta) ops.push(b => b.set(metaDoc, { ...meta, _at: serverTimestamp() }, { merge: true }));
      for (let i = 0; i < ops.length; i += 450) {
        const b = writeBatch(db);
        ops.slice(i, i + 450).forEach(f => f(b));
        await b.commit();
      }
    },
  };

  onAuthStateChanged(auth, user => {
    window.cloud.user = user;
    emit('cloud:auth', user ? { name: user.displayName, email: user.email, photo: user.photoURL } : null);
  });
  onSnapshot(itemsCol, { includeMetadataChanges: false }, snap => {
    emit('cloud:items', {
      items: snap.docs.map(d => { const { _by, _at, ...it } = d.data(); return it; }),
      fromCache: snap.metadata.fromCache,
    });
  }, err => emit('cloud:error', { where: 'items', code: err.code, message: err.message }));
  onSnapshot(metaDoc, snap => emit('cloud:meta', snap.exists() ? snap.data() : null),
    err => emit('cloud:error', { where: 'meta', code: err.code, message: err.message }));
  emit('cloud:ready');
} catch (e) {
  emit('cloud:error', { where: 'init', code: 'init', message: e.message });
}
