import React, { useMemo } from 'react';
import { fmt, MO, mkKey } from '@/services/firebase';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  val: number;
  desc: string;
  emoji: string;
  date: string;
}

interface AnalyticsProps {
  tx: { [key: string]: Transaction[] };
  vm: { y: number; m: number };
  setVm: (vm: { y: number; m: number }) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ tx, vm, setVm }) => {
  const now = new Date();
  const key = mkKey(vm.y, vm.m);
  const txs = tx[key] || [];

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

  const expensesByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    txs.filter((t) => t.type === 'expense').forEach((t) => {
      categories[t.desc] = (categories[t.desc] || 0) + t.val;
    });
    return Object.entries(categories)
      .map(([desc, val]) => ({ desc, val }))
      .sort((a, b) => b.val - a.val);
  }, [txs]);

  const incomeByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    txs.filter((t) => t.type === 'income').forEach((t) => {
      categories[t.desc] = (categories[t.desc] || 0) + t.val;
    });
    return Object.entries(categories)
      .map(([desc, val]) => ({ desc, val }))
      .sort((a, b) => b.val - a.val);
  }, [txs]);

  const totalExpense = expensesByCategory.reduce((s, c) => s + c.val, 0);
  const totalIncome = incomeByCategory.reduce((s, c) => s + c.val, 0);

  return (
    <div className="page">
      <div className="pg-hdr">
        <div>
          <div className="label">Análise</div>
          <div className="title" style={{ marginTop: 3 }}>Gastos e Ganhos</div>
        </div>
      </div>

      <div className="mnav">
        <button className="icon-btn" onClick={prev}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="mlbl">
          {MO[vm.m]} {vm.y}
        </div>
        <button className="icon-btn" onClick={next} disabled={isCur} style={{ opacity: isCur ? 0.35 : 1 }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div className="card">
          <div className="label" style={{ color: 'rgba(244,63,94,.55)', marginBottom: 8 }}>Total de Gastos</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--red)', letterSpacing: '-.4px' }}>{fmt(totalExpense)}</div>
        </div>
        <div className="card">
          <div className="label" style={{ color: 'rgba(16,185,129,.55)', marginBottom: 8 }}>Total de Ganhos</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', letterSpacing: '-.4px' }}>{fmt(totalIncome)}</div>
        </div>
      </div>

      {expensesByCategory.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Gastos por Categoria</div>
          {expensesByCategory.map((cat) => {
            const pct = (cat.val / totalExpense) * 100;
            return (
              <div key={cat.desc} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{cat.desc}</span>
                  <span style={{ color: 'var(--sub)' }}>{fmt(cat.val)}</span>
                </div>
                <div className="prog">
                  <div className="prog-fill" style={{ width: `${pct}%`, background: 'var(--red)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {incomeByCategory.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Ganhos por Categoria</div>
          {incomeByCategory.map((cat) => {
            const pct = (cat.val / totalIncome) * 100;
            return (
              <div key={cat.desc} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{cat.desc}</span>
                  <span style={{ color: 'var(--sub)' }}>{fmt(cat.val)}</span>
                </div>
                <div className="prog">
                  <div className="prog-fill" style={{ width: `${pct}%`, background: 'var(--green)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
