import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  Auth,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD76nps-JKmF4ep7kufGrT_ES4D9Bwz1tY',
  authDomain: 'financy-app-67fb5.firebaseapp.com',
  databaseURL: 'https://financy-app-67fb5-default-rtdb.firebaseio.com',
  projectId: 'financy-app-67fb5',
  storageBucket: 'financy-app-67fb5.firebasestorage.app',
  messagingSenderId: '585412705989',
  appId: '1:585412705989:web:a62d2a3898cbc8c12cbaac',
  measurementId: 'G-L6BTRHWQYZ',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firebase helpers
export const FB = {
  // Transactions: /users/{uid}/transactions/{id}
  async addTx(userId: string, tx: any) {
    const ref = await addDoc(collection(db, 'users', userId, 'transactions'), tx);
    return ref.id;
  },
  async delTx(userId: string, txId: string) {
    await deleteDoc(doc(db, 'users', userId, 'transactions', txId));
  },
  async getTxs(userId: string) {
    const snap = await getDocs(collection(db, 'users', userId, 'transactions'));
    const result: any = {};
    snap.forEach((d: any) => {
      const t = { id: d.id, ...d.data() };
      const k = mkKey(new Date(t.date).getFullYear(), new Date(t.date).getMonth());
      if (!result[k]) result[k] = [];
      result[k].push(t);
    });
    return result;
  },
  // Fixed: /users/{uid}/fixed/{id}
  async addFixed(userId: string, f: any) {
    const ref = await addDoc(collection(db, 'users', userId, 'fixed'), f);
    return ref.id;
  },
  async delFixed(userId: string, fId: string) {
    await deleteDoc(doc(db, 'users', userId, 'fixed', fId));
  },
  async updateFixed(userId: string, fId: string, data: any) {
    await updateDoc(doc(db, 'users', userId, 'fixed', fId), data);
  },
  async getFixed(userId: string) {
    const snap = await getDocs(collection(db, 'users', userId, 'fixed'));
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  },
  // User display name
  async setName(displayName: string) {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
    }
  },
};

// Utility functions
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const fmt = (n: number | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);

export const MO = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
export const MS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const mkKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, '0')}`;

// Error mapping
export const fbErr = (code: string) =>
  ({
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente novamente.',
    'auth/network-request-failed': 'Sem conexão com a internet.',
  })[code] || 'Ocorreu um erro. Tente novamente.';

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
};
