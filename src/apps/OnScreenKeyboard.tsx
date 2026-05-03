import { useState, useCallback } from 'react';

type KeyLayout = 'normal' | 'shift' | 'numpad';

const ROWS_NORMAL = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],
  ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['Caps','a','s','d','f','g','h','j','k','l',';',"'",'Enter'],
  ['Shift','z','x','c','v','b','n','m',',','.','/','^Shift'],
  ['Ctrl','Win','Alt','Space','Alt','Ctrl'],
];
const ROWS_SHIFT = [
  ['~','!','@','#','$','%','^','&','*','(',')','+','_','⌫'],
  ['Tab','Q','W','E','R','T','Y','U','I','O','P','{','}','|'],
  ['Caps','A','S','D','F','G','H','J','K','L',':','"','Enter'],
  ['Shift','Z','X','C','V','B','N','M','<','>','?','^Shift'],
  ['Ctrl','Win','Alt','Space','Alt','Ctrl'],
];

const WIDE_KEYS = new Set(['⌫','Tab','Caps','Enter','Shift','^Shift','Space','Ctrl','Win','Alt','\\']);

export function OnScreenKeyboard() {
  const [layout, setLayout] = useState<KeyLayout>('normal');
  const [output, setOutput] = useState('');
  const [capsLock, setCapsLock] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const rows = layout === 'shift' ? ROWS_SHIFT : ROWS_NORMAL;

  const handleKey = useCallback((key: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    if (key === '⌫') { setOutput(prev => prev.slice(0, -1)); return; }
    if (key === 'Enter') { setOutput(prev => prev + '\n'); return; }
    if (key === 'Tab') { setOutput(prev => prev + '\t'); return; }
    if (key === 'Space') { setOutput(prev => prev + ' '); return; }
    if (key === 'Shift' || key === '^Shift') { setLayout(l => l === 'shift' ? 'normal' : 'shift'); return; }
    if (key === 'Caps') { setCapsLock(v => !v); return; }
    if (['Ctrl','Alt','Win'].includes(key)) return;

    let char = key;
    if (capsLock && char.length === 1) char = char.toUpperCase();
    setOutput(prev => prev + char);
    if (layout === 'shift') setLayout('normal');
  }, [layout, capsLock]);

  const copyOutput = async () => {
    try { await navigator.clipboard.writeText(output); } catch {}
  };

  const getKeyWidth = (key: string) => {
    if (key === 'Space') return '30%';
    if (key === 'Enter' || key === 'Caps') return '7.5%';
    if (['Shift','^Shift','Tab','⌫'].includes(key)) return '7%';
    if (['Ctrl','Alt','Win'].includes(key)) return '5.5%';
    return '5%';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f3f3', fontFamily: "'Segoe UI', sans-serif", userSelect: 'none' }}>
      {/* Output area */}
      <div style={{ flex: 1, background: '#fff', margin: '12px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '4px 8px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Output</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={copyOutput} style={{ padding: '2px 10px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>Copy</button>
            <button onClick={() => setOutput('')} style={{ padding: '2px 10px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>Clear</button>
          </div>
        </div>
        <textarea
          value={output}
          onChange={e => setOutput(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', padding: '8px', resize: 'none', fontSize: '14px', fontFamily: 'Consolas, monospace', userSelect: 'text' }}
          placeholder="Typed text appears here..."
        />
      </div>

      {/* Keyboard */}
      <div style={{ padding: '8px 12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', background: '#e8e8e8', borderTop: '1px solid #ccc' }}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                style={{
                  height: '38px',
                  width: getKeyWidth(key),
                  border: '1px solid #bbb',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: key.length > 2 ? '11px' : '13px',
                  fontFamily: "'Segoe UI', sans-serif",
                  background: activeKey === key ? '#0078D4' : capsLock && key === 'Caps' ? '#d0e4ff' : (layout === 'shift' && (key === 'Shift' || key === '^Shift')) ? '#d0e4ff' : '#fff',
                  color: activeKey === key ? '#fff' : '#333',
                  boxShadow: '0 2px 0 #999',
                  transition: 'background 100ms',
                  userSelect: 'none',
                  position: 'relative',
                  top: activeKey === key ? '2px' : '0',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {key.startsWith('^') ? key.slice(1) : key}
              </button>
            ))}
          </div>
        ))}

        {/* Numpad toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
          <button onClick={() => setLayout(l => l === 'numpad' ? 'normal' : 'numpad')}
            style={{ padding: '4px 20px', border: '1px solid #bbb', background: layout === 'numpad' ? '#0078D4' : '#fff', color: layout === 'numpad' ? '#fff' : '#333', cursor: 'pointer', fontSize: '12px', borderRadius: '3px' }}>
            Num Pad
          </button>
        </div>
      </div>
    </div>
  );
}
