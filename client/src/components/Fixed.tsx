import React, { useState } from 'react';
import { Ic } from './Icons';
import { fmt, FB } from '@/services/firebase';
import { AddFixedSheet } from './AddFixedSheet';

interface Installment {
  id: string;
  paid: boolean;
}

interface FixedItem {
  id: string;
  desc: string;
  val: number;
  parcelas: number;
  emoji: string;
  createdAt: string;
  installments: Installment[];
}

interface FixedProps {
  user: any;
  fixed: FixedItem[];
  setFixed: (fn: (prev: FixedItem[]) => FixedItem[]) => void;
}

export const Fixed: React.FC<FixedProps> = ({ user, fixed, setFixed }) => {
  const [show, setShow] = useState(false);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const [viewMonth, setViewMonth] = useState({ y: currentYear, m: currentMonth });

  const prevMonth = () => {
    let { y, m } = viewMonth;
    m--;
    if (m < 0) {
      m = 11;
      y--;
    }
    setViewMonth({ y, m });
  };

  const nextMonth = () => {
    let { y, m } = viewMonth;
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
    setViewMonth({ y, m });
  };

  const monthlyTotal = fixed.reduce((s, f) => {
    const createdDate = new Date(f.createdAt);
    const createdMonth = createdDate.getMonth();
    const createdYear = createdDate.getFullYear();

    // Calcula quantos meses se passaram desde a criacao ate o mes visualizado
    const monthsDiff = (viewMonth.y - createdYear) * 12 + (viewMonth.m - createdMonth);

    // Verifica se a conta foi criada no mes visualizado ou antes
    if (monthsDiff >= 0) {
      // Calcula qual parcela vence neste mes (1-indexed)
      const installmentNumberThisMonth = monthsDiff + 1;

      // Verifica se ainda ha parcelas a pagar neste mes
      if (installmentNumberThisMonth <= f.parcelas) {
        const installmentForThisMonth = f.installments[monthsDiff];
        if (installmentForThisMonth && !installmentForThisMonth.paid) {
          const valuePerInstallment = f.val / f.parcelas;
          return s + valuePerInstallment;
        }
      }
    }
    return s;
  }, 0);

  const togglePaid = async (fixedId: string, installmentId: string) => {
    const fixed_item = fixed.find((f) => f.id === fixedId);
    if (!fixed_item) return;

    const inst = fixed_item.installments.find((i) => i.id === installmentId);
    if (!inst) return;

    const updated = {
      ...fixed_item,
      installments: fixed_item.installments.map((i) => (i.id === installmentId ? { ...i, paid: !i.paid } : i)),
    };

    await FB.updateFixed(user.uid, fixedId, { installments: updated.installments });
    setFixed((p) => p.map((f) => (f.id === fixedId ? updated : f)));
  };

  const delFixed = async (fixedId: string) => {
    await FB.delFixed(user.uid, fixedId);
    setFixed((p) => p.filter((f) => f.id !== fixedId));
  };

  const getMonthlyInstallmentValue = (f: FixedItem) => {
    return f.val / f.parcelas;
  };

  const addFixed = async (f: any) => {
    const id = await FB.addFixed(user.uid, f);
    setFixed((p) => [...p, { ...f, id }]);
  };

  return (
    <div className="page">
      <div className="pg-hdr">
        <div>
          <div className="label">Contas Fixas</div>
          <div className="title" style={{ marginTop: 3 }}>Parcelas</div>
        </div>
        <button className="icon-btn" onClick={() => setShow(true)}>
          <Ic n="plus" size={18} />
        </button>
      </div>

      <div className="mnav">
        <button className="icon-btn" onClick={prevMonth}>
          <Ic n="cL" size={15} />
        </button>
        <div className="mlbl">
          {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][viewMonth.m]} {viewMonth.y}
        </div>
        <button className="icon-btn" onClick={nextMonth}>
          <Ic n="cR" size={15} />
        </button>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="label" style={{ marginBottom: 8 }}>Total a pagar em {['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][viewMonth.m]}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--indigo)', letterSpacing: '-.8px' }}>{fmt(monthlyTotal)}</div>
        <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 6 }}>Apenas parcelas não quitadas</div>
      </div>

      {fixed.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">📋</div>
          <div className="empty-t">Nenhuma conta fixa</div>
          <div className="empty-s">Adicione contas com parcelas</div>
        </div>
      ) : (
        fixed.map((f) => (
          <div key={f.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 24 }}>{f.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{f.desc}</div>
                  <div style={{ fontSize: 12, color: 'var(--sub)' }}>Parcela: {fmt(getMonthlyInstallmentValue(f))}</div>
                </div>
              </div>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => delFixed(f.id)}>
                <Ic n="tr" size={13} />
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 8 }}>
                Parcelas ({f.installments.filter((i) => i.paid).length}/{f.parcelas}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {f.installments.map((inst) => (
                  <button
                    key={inst.id}
                    className="ip"
                    style={{
                      background: inst.paid ? 'rgba(16,185,129,.15)' : 'var(--s2)',
                      borderColor: inst.paid ? 'rgba(16,185,129,.4)' : 'var(--border2)',
                      color: inst.paid ? 'var(--green)' : 'var(--sub)',
                    }}
                    onClick={() => togglePaid(f.id, inst.id)}
                  >
                    {inst.paid ? '✓' : '○'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      {show && <AddFixedSheet userId={user.uid} onClose={() => setShow(false)} onAdd={(f) => { addFixed(f); setShow(false); }} />}
    </div>
  );
};
