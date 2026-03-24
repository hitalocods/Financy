import React, { useState, useRef } from 'react';
import { Ic } from './Icons';
import { uid } from '@/services/firebase';

const FX_EMOJIS = ['🏠', '🚗', '💊', '📱', '🎓', '📺', '🏋️', '🎮', '☕', '🍕'];
const PRESET_N = [1, 3, 6, 12];

interface AddFixedSheetProps {
  userId: string;
  onClose: () => void;
  onAdd: (fixed: any) => void;
}

export const AddFixedSheet: React.FC<AddFixedSheetProps> = ({ userId, onClose, onAdd }) => {
  const [total, setTotal] = useState('');
  const [desc, setDesc] = useState('');
  const [n, setN] = useState('1');
  const [emoji, setEmoji] = useState(FX_EMOJIS[0]);
  const [saving, setSaving] = useState(false);
  const valRef = useRef<HTMLInputElement>(null);

  const tN = parseFloat(total) || 0;
  const nN = parseInt(n) || 1;
  const per = tN > 0 ? tN / nN : 0;
  const ok = tN > 0 && desc.trim() && nN > 0;

  const submit = async () => {
    if (!ok) return;
    setSaving(true);
    try {
      const installments = Array.from({ length: nN }, () => ({
        id: uid(),
        paid: false,
      }));
      const fixed = {
        desc: desc.trim(),
        val: tN,
        parcelas: nN,
        emoji,
        createdAt: new Date().toISOString(),
        installments,
      };
      onAdd(fixed);
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
          <div className="sheet-title">Adicionar conta fixa</div>
          <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={onClose}>
            <Ic n="x" size={14} />
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

        <div style={{ marginBottom: per ? 14 : 20 }}>
          <div className="f-lbl" style={{ marginBottom: 10 }}>Número de parcelas</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 8 }}>
            {PRESET_N.map((v) => (
              <button
                key={v}
                onClick={() => setN(String(v))}
                style={{
                  height: 40,
                  borderRadius: 'var(--r-sm)',
                  border: `1.5px solid ${String(v) === n ? 'var(--indigo)' : 'var(--border2)'}`,
                  background: String(v) === n ? 'var(--indigo-bg)' : 'var(--s2)',
                  color: String(v) === n ? 'var(--indigo)' : 'var(--sub)',
                  fontFamily: 'var(--font)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {v}×
              </button>
            ))}
          </div>
          <input className="field" type="number" inputMode="numeric" placeholder="Outro número de parcelas" min="1" step="1" value={n} onChange={(e) => setN(e.target.value)} />
        </div>

        {per > 0 && (
          <div style={{ background: 'var(--indigo-bg)', border: '1px solid var(--indigo-border)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="f-lbl" style={{ color: 'rgba(99,102,241,.6)', marginBottom: 4 }}>Por parcela</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--indigo)', letterSpacing: '-.4px' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(per)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="f-lbl" style={{ color: 'rgba(99,102,241,.6)', marginBottom: 4 }}>em {nN}× de</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tN)}</div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <div className="f-lbl" style={{ marginBottom: 8 }}>Ícone</div>
          <div className="eg">
            {FX_EMOJIS.map((e) => (
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
