import { useState } from 'react';

const SYSTEM_DATA = {
  'OS Name': 'Error64',
  'OS Version': '10.0.19044 N/A Build 19044',
  'OS Manufacturer': 'Error64 Corporation',
  'OS Configuration': 'Standalone Workstation',
  'OS Build Type': 'Multiprocessor Free',
  'Registered Owner': 'User',
  'Product ID': '00330-80000-00000-AA664',
  'Original Install Date': new Date().toLocaleDateString(),
  'System Boot Time': new Date(Date.now() - 3600000).toLocaleString(),
  'System Manufacturer': 'Error64',
  'System Model': 'Error64 Virtual PC',
  'System Type': 'x64-based PC',
  'Processor': 'Intel(R) Core(TM) i5-10400 CPU @ 2.90GHz, 2901 Mhz, 6 Core(s), 12 Logical Processor(s)',
  'BIOS Version/Date': 'Error64, 1.0, 1/1/2024',
  'Error64 Directory': 'C:\\Error64',
  'System Directory': 'C:\\Error64\\system32',
  'Boot Device': '\\Device\\HarddiskVolume1',
  'System Locale': 'en-us;English (United States)',
  'Input Locale': 'en-us;English (United States)',
  'Time Zone': '(UTC-05:00) Eastern Time (US & Canada)',
  'Total Physical Memory': '8,192 MB',
  'Available Physical Memory': '4,108 MB',
  'Virtual Memory: Max Size': '16,384 MB',
  'Virtual Memory: Available': '10,240 MB',
  'Virtual Memory: In Use': '6,144 MB',
  'Page File Location(s)': 'C:\\pagefile.sys',
  'Domain': 'WORKGROUP',
  'Logon Server': '\\\\ERROR64-PC',
};

const CATEGORIES = [
  'System Summary',
  'Hardware Resources',
  'Components',
  'Software Environment',
];

export function SystemInfo() {
  const [category, setCategory] = useState('System Summary');
  const [search, setSearch] = useState('');

  const filtered = Object.entries(SYSTEM_DATA).filter(([k, v]) =>
    !search || k.toLowerCase().includes(search.toLowerCase()) || v.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Segoe UI', sans-serif", fontSize: '13px' }}>
      {/* Tree */}
      <div style={{ width: '220px', background: '#f3f3f3', borderRight: '1px solid #ddd', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #ddd', fontWeight: 600, fontSize: '12px', color: '#555' }}>SYSTEM INFORMATION</div>
        {CATEGORIES.map(c => (
          <div key={c}
            onClick={() => setCategory(c)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', cursor: 'pointer', background: category === c ? '#d0e4ff' : 'transparent', borderLeft: category === c ? '3px solid #0078D4' : '3px solid transparent' }}
            onMouseEnter={e => { if (category !== c) e.currentTarget.style.background = '#e8e8e8'; }}
            onMouseLeave={e => { if (category !== c) e.currentTarget.style.background = ''; }}>
            {c === category ? '▾' : '▸'} {c}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '6px 12px', borderBottom: '1px solid #ddd', background: '#f3f3f3', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <label style={{ fontSize: '12px' }}>Find what:</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ padding: '4px 8px', border: '1px solid #ccc', fontSize: '12px', width: '200px' }} />
          <button onClick={() => setSearch('')} style={{ padding: '4px 12px', cursor: 'pointer', border: '1px solid #ccc' }}>Close</button>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f3f3f3' }}>
              <tr>
                <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #ddd', width: '40%' }}>Item</th>
                <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #ddd' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(([key, value]) => (
                <tr key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '5px 12px', fontWeight: 500, whiteSpace: 'nowrap' }}>{key}</td>
                  <td style={{ padding: '5px 12px', color: '#444', wordBreak: 'break-word' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No results found</div>
          )}
        </div>

        {/* Export */}
        <div style={{ padding: '6px 12px', borderTop: '1px solid #ddd', background: '#f3f3f3', display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => {
              const content = filtered.map(([k, v]) => `${k}: ${v}`).join('\n');
              const b = new Blob([content], { type: 'text/plain' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(b); a.download = 'system_info.txt'; a.click();
            }}
            style={{ padding: '4px 14px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>
            Export
          </button>
          <span style={{ fontSize: '12px', color: '#888', alignSelf: 'center' }}>Error64 System Information</span>
        </div>
      </div>
    </div>
  );
}
