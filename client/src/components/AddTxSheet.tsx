import React, { useState, useRef, useEffect } from 'react';
import { Ic } from './Icons';
import { FB, uid } from '@/services/firebase';

const EMOJIS: { [key: string]: string[] } = {
  income: ['💰', '💼', '🎁', '📈', '💵', '🏆', '🤑', '🎯', '🏧', '👔'],
  expense: ['🛒', '🍔', '🏠', '💊', '🚗', '📱', '⚡', '🎬', '👕', '✈️', '🎓', '🍕'],
};

interface AddTxSheetProps {
  userId: string;
  defaultType: 'income' | 'expense';
  onClose: () => void;
  onAdd: (tx: any) => void;
}

export const AddTxSheet: React.FC<AddTxSheetProps> = ({ userId, defaultType, onClose, onAdd }) => {
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [total, setTotal] = useState('');
  const [desc, setDesc] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[defaultType][0]);
  const [saving, setSaving] = useState(false);
  const valRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmoji(EMOJIS[type][0]);
  }, [type]);

  const tN = parseFloat(total) || 0;
  const ok = tN > 0 && desc.trim();

  const submit = async () => {
    if (!ok) return;
    setSaving(true);
    try {
      const tx = {
        id: uid(),
        type,
        val: tN,
        desc: desc.trim(),
        emoji,
        date: new Date().toISOString(),
      };
      const id = await FB.addTx(userId, tx);
      onAdd({ ...tx, id });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <div className="sheet-hdr">
          <div className="sheet-title">{type === 'income' ? 'Adicionar ganho' : 'Adicionar gasto'}</div>
          <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={onClose}>
            <Ic n="x" size={14} />
          </button>
        </div>

        <div className="pills" style={{ marginBottom: 20 }}>
          <button className={`pill ${type === 'income' ? 'p-in' : ''}`} onClick={() => setType('income')}>
            Ganho
          </button>
          <button className={`pill ${type === 'expense' ? 'p-ex' : ''}`} onClick={() => setType('expense')}>
            Gasto
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="f-lbl" style={{ marginBottom: 8 }}>Valor total</div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, fontWeight: 700, color: 'var(--sub)', pointerEvents: 'none', zIndex: 1 }}>R$</span>
            <input
              ref={valRef}
              className="big-val"
              type="number"
              inputMode="decimal"
              placeholder="0,00"
              step="0.01"
              min="0"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              style={{ color: tN > 0 ? 'var(--indigo)' : 'inherit' }}
            />
          </div>
        </div>

        <div className="f-wrap" style={{ marginBottom: 20 }}>
          <label className="f-lbl">Nome da conta</label>
          <input className="field" type="text" placeholder="ex: Financiamento do carro, Netflix…" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="f-lbl" style={{ marginBottom: 10 }}>Ícone</div>
          <div className="eg">
            {EMOJIS[type].map((e) => (
              <button key={e} className={`eb ${emoji === e ? 'on' : ''}`} onClick={() => setEmoji(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
          <button className="btn btn-ghost" style={{ height: 50 }} onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" style={{ height: 50, fontSize: 15, opacity: ok && !saving ? 1 : 0.4 }} onClick={submit}>
            {saving ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <>
              <Ic n="chk" size={16} /> Salvar
            </>}
          </button>
        </div>
      </div>
    </div>
  );
};
