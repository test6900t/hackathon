import { useState, useEffect, useCallback, type CSSProperties } from 'react';

type Mode = 'Standard' | 'Scientific' | 'Programmer' | 'Date';

const STANDARD_BUTTONS = [
  ['%', 'CE', 'C', '\u232B'],
  ['1/x', 'x\u00B2', '\u221A', '\u00F7'],
  ['7', '8', '9', '\u00D7'],
  ['4', '5', '6', '\u2212'],
  ['1', '2', '3', '+'],
  ['+/\u2212', '0', '.', '='],
];

const SCI_EXTRA = [
  ['sin', 'cos', 'tan', '\u03C0'],
  ['log', 'ln', 'e', 'x^y'],
  ['(', ')', 'mod', 'n!'],
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
  const [progBase, setProgBase] = useState<'DEC' | 'HEX' | 'OCT' | 'BIN'>('DEC');

  const appendDigit = useCallback((digit: string) => {
    setDisplay(previous => {
      if (waitingOp) {
        setWaitingOp(false);
        return digit;
      }
      if (previous === '0' && digit !== '.') return digit;
      if (digit === '.' && previous.includes('.')) return previous;
      return previous + digit;
    });
  }, [waitingOp]);

  const calculate = useCallback((left: number, operator: string, right: number): number => {
    switch (operator) {
      case '+':
        return left + right;
      case '\u2212':
        return left - right;
      case '\u00D7':
        return left * right;
      case '\u00F7':
        return right === 0 ? NaN : left / right;
      case '^':
        return left ** right;
      case '%op':
        return right === 0 ? NaN : left % right;
      default:
        return right;
    }
  }, []);

  const handleOp = useCallback((operator: string) => {
    const value = parseFloat(display);
    if (lastOp && !waitingOp) {
      const result = calculate(lastVal ?? value, lastOp, value);
      const resultString = Number.isNaN(result) ? 'Error' : String(parseFloat(result.toFixed(10)));
      setDisplay(resultString);
      setLastVal(result);
      setExpression(`${resultString} ${operator}`);
    } else {
      setLastVal(value);
      setExpression(`${display} ${operator}`);
    }
    setLastOp(operator);
    setWaitingOp(true);
  }, [calculate, display, lastOp, lastVal, waitingOp]);

  const handleEquals = useCallback(() => {
    if (!lastOp || lastVal === null) return;
    const value = parseFloat(display);
    const result = calculate(lastVal, lastOp, value);
    const resultString = Number.isNaN(result) ? 'Error' : String(parseFloat(result.toFixed(10)));
    const nextExpression = `${expression} ${display}`;
    setHistory(previous => [{ expr: nextExpression, result: resultString }, ...previous].slice(0, 50));
    setExpression('');
    setDisplay(resultString);
    setLastOp(null);
    setLastVal(null);
    setWaitingOp(true);
  }, [calculate, display, expression, lastOp, lastVal]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setLastOp(null);
    setLastVal(null);
    setWaitingOp(false);
  }, []);

  const handleBtn = useCallback((button: string) => {
    const value = parseFloat(display);

    switch (button) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '.':
        appendDigit(button);
        break;
      case '+':
      case '\u2212':
      case '\u00D7':
      case '\u00F7':
        handleOp(button);
        break;
      case '=':
        handleEquals();
        break;
      case 'C':
        clearAll();
        break;
      case 'CE':
        setDisplay('0');
        setWaitingOp(false);
        break;
      case '\u232B':
        setDisplay(previous => (previous.length > 1 ? previous.slice(0, -1) : '0'));
        break;
      case '%':
        setDisplay(String(value / 100));
        break;
      case '+/\u2212':
        setDisplay(previous => (previous.startsWith('-') ? previous.slice(1) : `-${previous}`));
        break;
      case '1/x':
        setDisplay(value === 0 ? 'Error' : String(1 / value));
        setWaitingOp(true);
        break;
      case 'x\u00B2':
        setDisplay(String(value * value));
        setWaitingOp(true);
        break;
      case '\u221A':
        setDisplay(value < 0 ? 'Error' : String(Math.sqrt(value)));
        setWaitingOp(true);
        break;
      case 'sin':
        setDisplay(String(parseFloat(Math.sin(value * Math.PI / 180).toFixed(10))));
        setWaitingOp(true);
        break;
      case 'cos':
        setDisplay(String(parseFloat(Math.cos(value * Math.PI / 180).toFixed(10))));
        setWaitingOp(true);
        break;
      case 'tan':
        setDisplay(String(parseFloat(Math.tan(value * Math.PI / 180).toFixed(10))));
        setWaitingOp(true);
        break;
      case 'log':
        setDisplay(value <= 0 ? 'Error' : String(Math.log10(value)));
        setWaitingOp(true);
        break;
      case 'ln':
        setDisplay(value <= 0 ? 'Error' : String(Math.log(value)));
        setWaitingOp(true);
        break;
      case '\u03C0':
        setDisplay(String(Math.PI));
        setWaitingOp(true);
        break;
      case 'e':
        setDisplay(String(Math.E));
        setWaitingOp(true);
        break;
      case 'x^y':
        handleOp('^');
        break;
      case 'mod':
        handleOp('%op');
        break;
      case 'n!': {
        let result = 1;
        for (let index = 2; index <= Math.floor(value); index += 1) result *= index;
        setDisplay(String(result));
        setWaitingOp(true);
        break;
      }
      case '(':
        setExpression(previous => previous + '(');
        break;
      case ')':
        setExpression(previous => previous + ')');
        break;
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        setWaitingOp(true);
        break;
      case 'M+':
        setMemory(previous => previous + value);
        break;
      case 'M-':
        setMemory(previous => previous - value);
        break;
      case 'MS':
        setMemory(value);
        break;
      default:
        break;
    }
  }, [appendDigit, clearAll, display, handleEquals, handleOp, memory]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      if ('0123456789.'.includes(event.key)) {
        event.preventDefault();
        appendDigit(event.key);
      }
      if (event.key === '+') {
        event.preventDefault();
        handleOp('+');
      }
      if (event.key === '-') {
        event.preventDefault();
        handleOp('\u2212');
      }
      if (event.key === '*') {
        event.preventDefault();
        handleOp('\u00D7');
      }
      if (event.key === '/') {
        event.preventDefault();
        handleOp('\u00F7');
      }
      if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        handleEquals();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        clearAll();
      }
      if (event.key === 'Backspace') {
        event.preventDefault();
        handleBtn('\u232B');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [appendDigit, clearAll, handleBtn, handleEquals, handleOp]);

  const getDisplayValue = () => {
    if (mode !== 'Programmer') return display;
    const numericValue = parseInt(display, 10);
    if (Number.isNaN(numericValue)) return display;
    if (progBase === 'HEX') return numericValue.toString(16).toUpperCase();
    if (progBase === 'OCT') return numericValue.toString(8);
    if (progBase === 'BIN') return numericValue.toString(2);
    return display;
  };

  const btnStyle = (button: string): CSSProperties => {
    const isOperator = ['+', '\u2212', '\u00D7', '\u00F7', '='].includes(button);
    const isEquals = button === '=';
    const isFunction = ['%', 'CE', 'C', '1/x', 'x\u00B2', '\u221A', '\u232B'].includes(button);

    return {
      padding: '0',
      height: '56px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontFamily: "'Segoe UI', sans-serif",
      background: isEquals ? '#0078D4' : isOperator ? '#e0e0e0' : isFunction ? '#f0f0f0' : '#fafafa',
      color: isEquals ? '#fff' : '#1a1a1a',
      borderRadius: '0',
      transition: 'background 100ms',
    };
  };

  const modes: Mode[] = ['Standard', 'Scientific', 'Programmer', 'Date'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', userSelect: 'none', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 4px', position: 'relative' }}>
        <button onClick={() => setMenuOpen(previous => !previous)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }}>
          {'\u2630'}
        </button>
        <span style={{ fontSize: '14px', fontWeight: 400 }}>{mode}</span>
        <button onClick={() => setHistOpen(previous => !previous)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}>
          {'\u23F2'}
        </button>

        {menuOpen && (
          <div style={{ position: 'absolute', top: '40px', left: '8px', background: '#fff', border: '1px solid #ddd', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '180px' }}>
            {modes.map(nextMode => (
              <div
                key={nextMode}
                onClick={() => {
                  setMode(nextMode);
                  setMenuOpen(false);
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  background: mode === nextMode ? '#e8f0fe' : 'transparent',
                  fontWeight: mode === nextMode ? 600 : 400,
                  fontSize: '13px',
                }}
                onMouseEnter={event => {
                  event.currentTarget.style.background = '#e8f0fe';
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.background = mode === nextMode ? '#e8f0fe' : '';
                }}
              >
                {nextMode}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '4px 16px 8px', textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: '#888', minHeight: '18px' }}>{expression}</div>
        <div style={{ fontSize: display.length > 12 ? '24px' : '40px', fontWeight: 300, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getDisplayValue()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid #e0e0e0' }}>
        {['MC', 'MR', 'M+', 'M-', 'MS'].map(memoryButton => (
          <button
            key={memoryButton}
            onClick={() => handleBtn(memoryButton)}
            style={{
              padding: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '12px',
              color: memory === 0 && ['MC', 'MR'].includes(memoryButton) ? '#bbb' : '#666',
            }}
          >
            {memoryButton}
          </button>
        ))}
      </div>

      {mode === 'Programmer' && (
        <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', background: '#f5f5f5' }}>
          {(['HEX', 'DEC', 'OCT', 'BIN'] as const).map(base => (
            <button
              key={base}
              onClick={() => setProgBase(base)}
              style={{
                flex: 1,
                padding: '4px',
                border: `1px solid ${base === progBase ? '#0078D4' : '#ddd'}`,
                background: base === progBase ? '#0078D4' : '#fff',
                color: base === progBase ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              {base}
            </button>
          ))}
        </div>
      )}

      {mode === 'Scientific' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #e0e0e0' }}>
          {SCI_EXTRA.flat().map(button => (
            <button
              key={button}
              onClick={() => handleBtn(button)}
              style={{ ...btnStyle(button), height: '40px', fontSize: '13px', background: '#f0f0f0', borderRight: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}
              onMouseEnter={event => {
                event.currentTarget.style.background = '#e0e0e0';
              }}
              onMouseLeave={event => {
                event.currentTarget.style.background = '#f0f0f0';
              }}
            >
              {button}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', flex: 1, borderTop: '1px solid #e0e0e0' }}>
        {STANDARD_BUTTONS.flat().map((button, index) => (
          <button
            key={index}
            onClick={() => handleBtn(button)}
            style={{ ...btnStyle(button), borderRight: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}
            onMouseEnter={event => {
              event.currentTarget.style.filter = 'brightness(0.92)';
            }}
            onMouseLeave={event => {
              event.currentTarget.style.filter = '';
            }}
          >
            {button}
          </button>
        ))}
      </div>

      {histOpen && (
        <div style={{ position: 'absolute', right: 0, top: 0, width: '200px', height: '100%', background: '#fff', borderLeft: '1px solid #ddd', overflowY: 'auto', zIndex: 50 }}>
          <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>History</span>
            <button onClick={() => setHistory([])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#0078D4' }}>
              Clear
            </button>
          </div>
          {history.length === 0 ? (
            <div style={{ padding: '20px', fontSize: '12px', color: '#888', textAlign: 'center' }}>No history</div>
          ) : history.map((entry, index) => (
            <div
              key={index}
              onClick={() => {
                setDisplay(entry.result);
                setHistOpen(false);
              }}
              style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
              onMouseEnter={event => {
                event.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={event => {
                event.currentTarget.style.background = '';
              }}
            >
              <div style={{ fontSize: '11px', color: '#888' }}>{entry.expr}</div>
              <div style={{ fontSize: '16px', textAlign: 'right' }}>{entry.result}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
