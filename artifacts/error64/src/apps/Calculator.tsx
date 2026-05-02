import { useState, useEffect, useCallback } from 'react';

type Mode = 'Standard' | 'Scientific' | 'Programmer' | 'Date';

const STANDARD_BUTTONS = [
  ['%','CE','C','⌫'],
  ['1/x','x²','√','÷'],
  ['7','8','9','×'],
  ['4','5','6','−'],
  ['1','2','3','+'],
  ['+/−','0','.','='],
];

const SCI_EXTRA = [
  ['sin','cos','tan','π'],
  ['log','ln','e','x^y'],
  ['(',')',  'mod','n!'],
];

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [mode, setMode] = useState<Mode>('Standard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [histOpen, setHistOpen] = useState(false);
  const [waitingOp, setWaitingOp] = useState(false);
  const [lastOp, setLastOp] = useState<string | null>(null);
  const [lastVal, setLastVal] = useState<number | null>(null);
  const [currentVal, setCurrentVal] = useState<number | null>(null);
  // Programmer mode
  const [progBase, setProgBase] = useState<'DEC'|'HEX'|'OCT'|'BIN'>('DEC');

  const appendDigit = useCallback((d: string) => {
    setDisplay(prev => {
      if (waitingOp) { setWaitingOp(false); return d; }
      if (prev === '0' && d !== '.') return d;
      if (d === '.' && prev.includes('.')) return prev;
      return prev + d;
    });
  }, [waitingOp]);

  const calculate = useCallback((a: number, op: string, b: number): number => {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }, []);

  const handleOp = useCallback((op: string) => {
    const val = parseFloat(display);
    if (lastOp && !waitingOp) {
      const result = calculate(lastVal ?? val, lastOp, val);
      const resultStr = isNaN(result) ? 'Error' : String(parseFloat(result.toFixed(10)));
      setDisplay(resultStr);
      setLastVal(result);
      setExpression(`${resultStr} ${op}`);
    } else {
      setLastVal(val);
      setExpression(`${display} ${op}`);
    }
    setLastOp(op);
    setWaitingOp(true);
  }, [display, lastOp, lastVal, waitingOp, calculate]);

  const handleEquals = useCallback(() => {
    if (!lastOp || lastVal === null) return;
    const val = parseFloat(display);
    const result = calculate(lastVal, lastOp, val);
    const resultStr = isNaN(result) ? 'Error' : String(parseFloat(result.toFixed(10)));
    const expr = `${expression} ${display}`;
    setHistory(h => [{ expr, result: resultStr }, ...h].slice(0, 50));
    setExpression('');
    setDisplay(resultStr);
    setLastOp(null);
    setLastVal(null);
    setWaitingOp(true);
  }, [display, lastOp, lastVal, expression, calculate]);

  const handleBtn = useCallback((btn: string) => {
    const val = parseFloat(display);
    switch (btn) {
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
      case '.': case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
        appendDigit(btn); break;
      case '+': case '−': case '×': case '÷':
        handleOp(btn); break;
      case '=': handleEquals(); break;
      case 'C': setDisplay('0'); setExpression(''); setLastOp(null); setLastVal(null); setWaitingOp(false); break;
      case 'CE': setDisplay('0'); setWaitingOp(false); break;
      case '⌫': setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0'); break;
      case '%': setDisplay(String(val / 100)); break;
      case '+/−': setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev); break;
      case '1/x': setDisplay(val === 0 ? 'Error' : String(1 / val)); setWaitingOp(true); break;
      case 'x²': setDisplay(String(val * val)); setWaitingOp(true); break;
      case '√': setDisplay(val < 0 ? 'Error' : String(Math.sqrt(val))); setWaitingOp(true); break;
      case 'sin': setDisplay(String(parseFloat(Math.sin(val * Math.PI / 180).toFixed(10)))); setWaitingOp(true); break;
      case 'cos': setDisplay(String(parseFloat(Math.cos(val * Math.PI / 180).toFixed(10)))); setWaitingOp(true); break;
      case 'tan': setDisplay(String(parseFloat(Math.tan(val * Math.PI / 180).toFixed(10)))); setWaitingOp(true); break;
      case 'log': setDisplay(val <= 0 ? 'Error' : String(Math.log10(val))); setWaitingOp(true); break;
      case 'ln': setDisplay(val <= 0 ? 'Error' : String(Math.log(val))); setWaitingOp(true); break;
      case 'π': setDisplay(String(Math.PI)); setWaitingOp(true); break;
      case 'e': setDisplay(String(Math.E)); setWaitingOp(true); break;
      case 'x^y': handleOp('^'); break;
      case 'mod': handleOp('%op'); break;
      case 'n!': {
        let r = 1; for (let i = 2; i <= Math.floor(val); i++) r *= i;
        setDisplay(String(r)); setWaitingOp(true); break;
      }
      case '(': setExpression(e => e + '('); break;
      case ')': setExpression(e => e + ')'); break;
      case 'MC': setMemory(0); break;
      case 'MR': setDisplay(String(memory)); setWaitingOp(true); break;
      case 'M+': setMemory(m => m + val); break;
      case 'M-': setMemory(m => m - val); break;
      case 'MS': setMemory(val); break;
    }
  }, [appendDigit, handleOp, handleEquals, display, memory]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if ('0123456789.'.includes(e.key)) { e.preventDefault(); appendDigit(e.key); }
      if (e.key === '+') { e.preventDefault(); handleOp('+'); }
      if (e.key === '-') { e.preventDefault(); handleOp('−'); }
      if (e.key === '*') { e.preventDefault(); handleOp('×'); }
      if (e.key === '/') { e.preventDefault(); handleOp('÷'); }
      if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); handleEquals(); }
      if (e.key === 'Escape') { e.preventDefault(); handleBtn('C'); }
      if (e.key === 'Backspace') { e.preventDefault(); handleBtn('⌫'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [appendDigit, handleOp, handleEquals, handleBtn]);

  const getDisplayValue = () => {
    if (mode !== 'Programmer') return display;
    const n = parseInt(display);
    if (isNaN(n)) return display;
    if (progBase === 'HEX') return n.toString(16).toUpperCase();
    if (progBase === 'OCT') return n.toString(8);
    if (progBase === 'BIN') return n.toString(2);
    return display;
  };

  const btnStyle = (btn: string): React.CSSProperties => {
    const isOp = ['+','−','×','÷','='].includes(btn);
    const isEq = btn === '=';
    const isFunc = ['%','CE','C','1/x','x²','√','⌫'].includes(btn);
    return {
      padding: '0', height: '56px', border: 'none', cursor: 'pointer', fontSize: '16px',
      fontFamily: "'Segoe UI', sans-serif",
      background: isEq ? '#0078D4' : isOp ? '#e0e0e0' : isFunc ? '#f0f0f0' : '#fafafa',
      color: isEq ? '#fff' : '#1a1a1a',
      borderRadius: '0',
      transition: 'background 100ms',
    };
  };

  const modes: Mode[] = ['Standard', 'Scientific', 'Programmer', 'Date'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', userSelect: 'none', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 4px', position: 'relative' }}>
        <button onClick={() => setMenuOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }}>≡</button>
        <span style={{ fontSize: '14px', fontWeight: 400 }}>{mode}</span>
        <button onClick={() => setHistOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}>⏱</button>

        {menuOpen && (
          <div style={{ position: 'absolute', top: '40px', left: '8px', background: '#fff', border: '1px solid #ddd', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '180px' }}>
            {modes.map(m => (
              <div key={m} onClick={() => { setMode(m); setMenuOpen(false); }}
                style={{ padding: '10px 20px', cursor: 'pointer', background: mode === m ? '#e8f0fe' : 'transparent', fontWeight: mode === m ? 600 : 400, fontSize: '13px' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e8f0fe')}
                onMouseLeave={e => (e.currentTarget.style.background = mode === m ? '#e8f0fe' : '')}
              >{m}</div>
            ))}
          </div>
        )}
      </div>

      {/* Display */}
      <div style={{ padding: '4px 16px 8px', textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: '#888', minHeight: '18px' }}>{expression}</div>
        <div style={{ fontSize: display.length > 12 ? '24px' : '40px', fontWeight: 300, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getDisplayValue()}
        </div>
      </div>

      {/* Memory buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid #e0e0e0' }}>
        {['MC','MR','M+','M-','MS'].map(m => (
          <button key={m} onClick={() => handleBtn(m)} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: memory === 0 && ['MC','MR'].includes(m) ? '#bbb' : '#666' }}>{m}</button>
        ))}
      </div>

      {/* Programmer base buttons */}
      {mode === 'Programmer' && (
        <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', background: '#f5f5f5' }}>
          {(['HEX','DEC','OCT','BIN'] as const).map(b => (
            <button key={b} onClick={() => setProgBase(b)} style={{ flex: 1, padding: '4px', border: `1px solid ${b === progBase ? '#0078D4' : '#ddd'}`, background: b === progBase ? '#0078D4' : '#fff', color: b === progBase ? '#fff' : '#333', cursor: 'pointer', fontSize: '11px' }}>{b}</button>
          ))}
        </div>
      )}

      {/* Scientific extra buttons */}
      {mode === 'Scientific' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #e0e0e0' }}>
          {SCI_EXTRA.flat().map(btn => (
            <button key={btn} onClick={() => handleBtn(btn)}
              style={{ ...btnStyle(btn), height: '40px', fontSize: '13px', background: '#f0f0f0', borderRight: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e0e0e0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f0f0f0')}
            >{btn}</button>
          ))}
        </div>
      )}

      {/* Main buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', flex: 1, borderTop: '1px solid #e0e0e0' }}>
        {STANDARD_BUTTONS.flat().map((btn, i) => (
          <button key={i} onClick={() => handleBtn(btn)}
            style={{ ...btnStyle(btn), borderRight: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}
            onMouseEnter={e => { const s = e.currentTarget.style; s.filter = 'brightness(0.92)'; }}
            onMouseLeave={e => { const s = e.currentTarget.style; s.filter = ''; }}
          >{btn}</button>
        ))}
      </div>

      {/* History panel */}
      {histOpen && (
        <div style={{ position: 'absolute', right: 0, top: 0, width: '200px', height: '100%', background: '#fff', borderLeft: '1px solid #ddd', overflowY: 'auto', zIndex: 50 }}>
          <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>History</span>
            <button onClick={() => { setHistory([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#0078D4' }}>Clear</button>
          </div>
          {history.length === 0 ? (
            <div style={{ padding: '20px', fontSize: '12px', color: '#888', textAlign: 'center' }}>No history</div>
          ) : history.map((h, i) => (
            <div key={i} onClick={() => { setDisplay(h.result); setHistOpen(false); }}
              style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}>
              <div style={{ fontSize: '11px', color: '#888' }}>{h.expr}</div>
              <div style={{ fontSize: '16px', textAlign: 'right' }}>{h.result}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
