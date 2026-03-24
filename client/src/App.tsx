import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, FB } from '@/services/firebase';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Login } from '@/components/Login';
import { Home } from '@/components/Home';
import { Fixed } from '@/components/Fixed';
import { Analytics } from '@/components/Analytics';
import { Ic } from '@/components/Icons';

interface User {
  uid: string;
  email: string;
  displayName: string;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  val: number;
  desc: string;
  emoji: string;
  date: string;
}

interface FixedItem {
  id: string;
  desc: string;
  val: number;
  parcelas: number;
  emoji: string;
  createdAt: string;
  installments: Array<{ id: string; paid: boolean }>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'home' | 'fixed' | 'analytics'>('home');
  const [tx, setTx] = useState<{ [key: string]: Transaction[] }>({});
  const [fixed, setFixed] = useState<FixedItem[]>([]);
  const [vm, setVm] = useState({ y: new Date().getFullYear(), m: new Date().getMonth() });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
        });

        // Load transactions
        try {
          setSyncing(true);
          const txs = await FB.getTxs(firebaseUser.uid);
          setTx(txs);
        } catch (e) {
          console.error('Error loading transactions:', e);
        }

        // Load fixed
        try {
          const fixedData = await FB.getFixed(firebaseUser.uid);
          setFixed(fixedData);
        } catch (e) {
          console.error('Error loading fixed:', e);
        } finally {
          setSyncing(false);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setTx({});
      setFixed([]);
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div style={{ color: 'var(--sub)', fontSize: 14 }}>Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="screen">
            <div className="page">
              {tab === 'home' && <Home user={user} tx={tx} setTx={setTx} vm={vm} setVm={setVm} syncing={syncing} />}
              {tab === 'fixed' && <Fixed user={user} fixed={fixed} setFixed={setFixed} />}
              {tab === 'analytics' && <Analytics tx={tx} vm={vm} setVm={setVm} />}
            </div>

            <nav className="nav">
              <button
                className={`nav-btn ${tab === 'home' ? 'on' : ''}`}
                onClick={() => setTab('home')}
              >
                <Ic n="home" size={22} />
                Início
              </button>
              <button
                className={`nav-btn ${tab === 'fixed' ? 'on' : ''}`}
                onClick={() => setTab('fixed')}
              >
                <Ic n="card" size={22} />
                Parcelas
              </button>
              <button
                className={`nav-btn ${tab === 'analytics' ? 'on' : ''}`}
                onClick={() => setTab('analytics')}
              >
                <Ic n="bar" size={22} />
                Análise
              </button>
              <button
                className="nav-btn"
                onClick={handleLogout}
              >
                <Ic n="out" size={22} />
                Sair
              </button>
            </nav>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
