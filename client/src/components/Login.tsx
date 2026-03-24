import React, { useState, useRef } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, fbErr } from '@/services/firebase';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const pRef = useRef<HTMLInputElement>(null);

  const go = async () => {
    setErr('');
    if (!email.trim() || !pass) {
      setErr('Preencha todos os campos.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setErr('Informe seu nome.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
      }
    } catch (e: any) {
      setErr(fbErr(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>💸</div>
          <div className="title" style={{ fontSize: 25 }}>Financy</div>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 5 }}>Controle financeiro pessoal</div>
        </div>

        <div className="pills" style={{ marginBottom: 22 }}>
          <button
            className={`pill ${mode === 'login' ? 'p-fi' : ''}`}
            onClick={() => {
              setMode('login');
              setErr('');
            }}
          >
            Entrar
          </button>
          <button
            className={`pill ${mode === 'register' ? 'p-fi' : ''}`}
            onClick={() => {
              setMode('register');
              setErr('');
            }}
          >
            Criar conta
          </button>
        </div>

        {mode === 'register' && (
          <div className="f-wrap" style={{ marginBottom: 12 }}>
            <label className="f-lbl">Seu nome</label>
            <input
              className="field"
              type="text"
              placeholder="Como quer ser chamado?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && pRef.current?.focus()}
            />
          </div>
        )}
        <div className="f-wrap" style={{ marginBottom: 12 }}>
          <label className="f-lbl">E-mail</label>
          <input
            className="field"
            type="email"
            inputMode="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && pRef.current?.focus()}
          />
        </div>
        <div className="f-wrap" style={{ marginBottom: 16 }}>
          <label className="f-lbl">
            Senha {mode === 'register' && <span style={{ color: 'var(--dim)', fontWeight: 400 }}>(mín. 6 caracteres)</span>}
          </label>
          <input
            ref={pRef}
            className="field"
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && go()}
          />
        </div>

        {err && <div className="err">{err}</div>}

        <button className="btn btn-primary" style={{ width: '100%', height: 50, fontSize: 15, opacity: loading ? 0.6 : 1 }} onClick={go} disabled={loading}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--dim)' }}>
          🔒 Dados sincronizados com Firebase
        </div>
      </div>
    </div>
  );
};
