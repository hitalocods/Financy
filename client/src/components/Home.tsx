import React, { useState } from 'react';
import { Ic } from './Icons';
import { AddTxSheet } from './AddTxSheet';
import { fmt, MO, MS, mkKey, FB } from '@/services/firebase';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  val: number;
  desc: string;
  emoji: string;
  date: string;
}

interface HomeProps {
  user: any;
  tx: { [key: string]: Transaction[] };
  setTx: (fn: (prev: any) => any) => void;
  vm: { y: number; m: number };
  setVm: (vm: { y: number; m: number }) => void;
  syncing: boolean;
}

export const Home: React.FC<HomeProps> = ({ user, tx, setTx, vm, setVm, syncing }) => {
  const [sheet, setSheet] = useState<'income' | 'expense' | null>(null);
  const now = new Date();
  const key = mkKey(vm.y, vm.m);
  const txs = tx[key] || [];
  const inc = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.val, 0);
  const exp = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.val, 0);
  const bal = inc - exp;

  const prev = () => {
    let { y, m } = vm;
    m--;
    if (m < 0) {
      m = 11;
      y--;
    }
    setVm({ y, m });
  };

  const next = () => {
    let { y, m } = vm;
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
    setVm({ y, m });
  };

  const isCur = vm.y === now.getFullYear() && vm.m === now.getMonth();

  const addTx = (t: Transaction) => setTx((p: any) => ({ ...p, [key]: [...(p[key] || []), t] }));
  const delTx = async (id: string) => {
    await FB.delTx(user.uid, id);
    setTx((p: any) => ({ ...p, [key]: (p[key] || []).filter((t: Transaction) => t.id !== id) }));
  };

  return (
    <div className="page">
      <div className="pg-hdr">
        <div>
          <div className="label">Bem-vindo</div>
          <div className="title" style={{ marginTop: 3 }}>{user.displayName || user.email.split('@')[0]}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {syncing && (
            <div style={{ fontSize: 11, color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="sync-dot syncing" />
              Salvando
            </div>
          )}
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'var(--s2)', border: '1.5px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sub)' }}>
            <Ic n="usr" size={18} />
          </div>
        </div>
      </div>

      <div className="mnav">
        <button className="icon-btn" onClick={prev}>
          <Ic n="cL" size={15} />
        </button>
        <div className="mlbl">
          {MO[vm.m]} {vm.y}
        </div>
        <button className="icon-btn" onClick={next} disabled={isCur} style={{ opacity: isCur ? 0.35 : 1 }}>
          <Ic n="cR" size={15} />
        </button>
      </div>

      <div className="hero a">
        <div className="label" style={{ marginBottom: 10 }}>Saldo do mês</div>
        <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-1.2px', color: bal > 0 ? 'var(--green)' : bal < 0 ? 'var(--red)' : 'var(--text)', position: 'relative', zIndex: 1 }}>
          {fmt(bal)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 6 }}>{isCur ? 'Mês atual' : `${MS[vm.m]} ${vm.y}`}</div>
      </div>

      <div className="stat-grid a a1">
        <div className="stat stat-in">
          <div className="label" style={{ color: 'rgba(16,185,129,.55)', marginBottom: 8 }}>Ganhos</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--green)', letterSpacing: '-.3px' }}>{fmt(inc)}</div>
          <div style={{ fontSize: 11, color: 'rgba(16,185,129,.55)', marginTop: 4 }}>
            {txs.filter((t) => t.type === 'income').length} entrada{txs.filter((t) => t.type === 'income').length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="stat stat-ex">
          <div className="label" style={{ color: 'rgba(244,63,94,.55)', marginBottom: 8 }}>Gastos</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--red)', letterSpacing: '-.3px' }}>{fmt(exp)}</div>
          <div style={{ fontSize: 11, color: 'rgba(244,63,94,.55)', marginTop: 4 }}>
            {txs.filter((t) => t.type === 'expense').length} saída{txs.filter((t) => t.type === 'expense').length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }} className="a a2">
        <button className="btn" style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', color: 'var(--green)', height: 46 }} onClick={() => setSheet('income')}>
          <Ic n="plus" size={15} /> Ganho
        </button>
        <button className="btn" style={{ background: 'var(--red-bg)', border: '1.5px solid var(--red-border)', color: 'var(--red)', height: 46 }} onClick={() => setSheet('expense')}>
          <Ic n="plus" size={15} /> Gasto
        </button>
      </div>

      <div className="card a a3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Lançamentos</div>
          <div className="label">
            {txs.length} {txs.length === 1 ? 'item' : 'itens'}
          </div>
        </div>
        {txs.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">📭</div>
            <div className="empty-t">Nenhum lançamento</div>
            <div className="empty-s">Adicione ganhos ou gastos acima</div>
          </div>
        ) : (
          [...txs]
            .reverse()
            .map((t) => (
              <div key={t.id} className="tx-row">
                <div className="tx-ico" style={{ background: t.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                  {t.emoji}
                </div>
                <div className="tx-meta">
                  <div className="tx-name">{t.desc}</div>
                  <div className="tx-date">{new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.type === 'income' ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                    {t.type === 'income' ? '+' : '-'}
                    {fmt(t.val)}
                  </div>
                  <button className="icon-btn" style={{ width: 30, height: 30, borderRadius: 8 }} onClick={() => delTx(t.id)}>
                    <Ic n="tr" size={13} />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {sheet && <AddTxSheet userId={user.uid} defaultType={sheet} onClose={() => setSheet(null)} onAdd={(t) => { addTx(t); setSheet(null); }} />}
    </div>
  );
};
