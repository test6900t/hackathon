import { useState } from 'react';
import { FluentIcon } from '../components/Window';

interface Message {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  folder: string;
  avatar: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', from: 'Error64 Team', fromEmail: 'team@error64.io', subject: 'Welcome to Error64!', body: `Dear User,

Welcome to Error64 — the browser-based OS experience!

You can use this Mail app to compose and manage your messages locally. All data is stored securely in your browser's local storage.

Features of Error64:
• Virtual File System (VFS) with IndexedDB persistence
• 30+ built-in applications
• Full window management with drag, resize, and snap
• Start Menu, Taskbar, Search, Task View
• Virtual desktops

Enjoy your Error64 experience!

Best regards,
The Error64 Team`, date: new Date().toISOString(), read: false, folder: 'inbox', avatar: 'E' },
  { id: '2', from: 'System Notification', fromEmail: 'noreply@error64.io', subject: 'Your system is up to date', body: 'All Error64 system components are up to date. No action required.\n\nBuild: 19044.1288', date: new Date(Date.now() - 86400000).toISOString(), read: true, folder: 'inbox', avatar: 'S' },
  { id: '3', from: 'Calendar Reminder', fromEmail: 'calendar@error64.io', subject: 'Upcoming events this week', body: 'You have no upcoming events scheduled for this week.\n\nOpen the Calendar app to add new events.', date: new Date(Date.now() - 172800000).toISOString(), read: true, folder: 'inbox', avatar: 'C' },
];

const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: 'mail_inbox' },
  { id: 'starred', label: 'Starred', icon: 'star' },
  { id: 'sent', label: 'Sent', icon: 'mail_arrow_up' },
  { id: 'drafts', label: 'Drafts', icon: 'document' },
  { id: 'trash', label: 'Trash', icon: 'delete' },
  { id: 'junk', label: 'Junk Email', icon: 'prohibited' },
];

const AVATAR_COLORS = ['#0078D4','#107C10','#D13438','#8764B8','#CA5010','#038387','#C239B3'];

export function Mail() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try { const s = localStorage.getItem('error64_mail'); return s ? JSON.parse(s) : INITIAL_MESSAGES; } catch { return INITIAL_MESSAGES; }
  });
  const [folder, setFolder] = useState('inbox');
  const [selected, setSelected] = useState<string | null>('1');
  const [composing, setComposing] = useState(false);
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' });
  const [search, setSearch] = useState('');

  const save = (msgs: Message[]) => { setMessages(msgs); localStorage.setItem('error64_mail', JSON.stringify(msgs)); };
  const folderMsgs = messages.filter(m => m.folder === folder && (!search || m.subject.toLowerCase().includes(search.toLowerCase()) || m.from.toLowerCase().includes(search.toLowerCase())));
  const selectedMsg = messages.find(m => m.id === selected);
  const unread = messages.filter(m => m.folder === 'inbox' && !m.read).length;

  const markRead = (id: string) => save(messages.map(m => m.id === id ? { ...m, read: true } : m));
  const deleteMsg = (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    if (msg.folder === 'trash') save(messages.filter(m => m.id !== id));
    else save(messages.map(m => m.id === id ? { ...m, folder: 'trash' } : m));
    setSelected(null);
  };

  const sendCompose = () => {
    if (!compose.to || !compose.subject) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      from: 'You', fromEmail: 'user@error64.io',
      subject: compose.subject, body: compose.body,
      date: new Date().toISOString(), read: true, folder: 'sent', avatar: 'Y',
    };
    save([msg, ...messages]);
    setCompose({ to: '', subject: '', body: '' });
    setComposing(false);
  };

  const fmtDate = (s: string) => {
    const d = new Date(s);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '200px', background: '#f3f3f3', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px' }}>
          <button onClick={() => setComposing(true)}
            style={{ width: '100%', padding: '10px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
            + New Mail
          </button>
        </div>
        {FOLDERS.map(f => (
          <div key={f.id} onClick={() => { setFolder(f.id); setSelected(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', cursor: 'pointer', fontSize: '13px', background: folder === f.id ? '#e0e0e0' : 'transparent', borderLeft: folder === f.id ? '3px solid #0078D4' : '3px solid transparent' }}
            onMouseEnter={e => { if (folder !== f.id) e.currentTarget.style.background = '#e8e8e8'; }}
            onMouseLeave={e => { if (folder !== f.id) e.currentTarget.style.background = ''; }}>
            <FluentIcon name={f.icon} size={16} />
            <span style={{ flex: 1 }}>{f.label}</span>
            {f.id === 'inbox' && unread > 0 && <span style={{ background: '#0078D4', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>{unread}</span>}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px', borderTop: '1px solid #ddd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0078D4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>U</div>
            <div>
              <div style={{ fontWeight: 500 }}>User</div>
              <div style={{ fontSize: '11px', color: '#666' }}>user@error64.io</div>
            </div>
          </div>
        </div>
      </div>

      {/* Message list */}
      <div style={{ width: '280px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #ddd' }}>
          <input placeholder="Search mail..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', border: '1px solid #ddd', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px 4px', fontSize: '12px', color: '#666' }}>
          <span>{FOLDERS.find(f => f.id === folder)?.label}</span>
          <span>{folderMsgs.length} messages</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {folderMsgs.map(msg => (
            <div key={msg.id}
              onClick={() => { setSelected(msg.id); markRead(msg.id); }}
              style={{
                padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                background: selected === msg.id ? '#e8f0fe' : 'transparent',
                borderLeft: !msg.read ? '4px solid #0078D4' : '4px solid transparent',
              }}
              onMouseEnter={e => { if (selected !== msg.id) e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={e => { if (selected !== msg.id) e.currentTarget.style.background = ''; }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor(msg.from), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                  {msg.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                    <div style={{ fontWeight: !msg.read ? 700 : 400, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.from}</div>
                    <div style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(msg.date)}</div>
                  </div>
                  <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: !msg.read ? 600 : 400 }}>{msg.subject}</div>
                  <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.body.slice(0, 60)}</div>
                </div>
              </div>
            </div>
          ))}
          {folderMsgs.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: '13px' }}>No messages</div>
          )}
        </div>
      </div>

      {/* Message body / Compose */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {composing ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>New Message</span>
              <button onClick={() => setComposing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #ddd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <span style={{ minWidth: '40px', color: '#666' }}>To:</span>
                <input value={compose.to} onChange={e => setCompose({ ...compose, to: e.target.value })}
                  placeholder="recipient@example.com"
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', borderBottom: '1px solid #ddd', padding: '4px 0' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <span style={{ minWidth: '40px', color: '#666' }}>Subject:</span>
                <input value={compose.subject} onChange={e => setCompose({ ...compose, subject: e.target.value })}
                  placeholder="Subject"
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', borderBottom: '1px solid #ddd', padding: '4px 0' }} />
              </div>
            </div>
            <textarea value={compose.body} onChange={e => setCompose({ ...compose, body: e.target.value })}
              placeholder="Write your message here..."
              style={{ flex: 1, border: 'none', outline: 'none', padding: '16px', fontSize: '14px', resize: 'none', lineHeight: 1.6 }} />
            <div style={{ padding: '10px 16px', borderTop: '1px solid #ddd', display: 'flex', gap: '8px' }}>
              <button onClick={sendCompose} style={{ padding: '8px 24px', background: '#0078D4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Send</button>
              <button onClick={() => setComposing(false)} style={{ padding: '8px 16px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Discard</button>
            </div>
          </div>
        ) : selectedMsg ? (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 400 }}>{selectedMsg.subject}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#666' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: avatarColor(selectedMsg.from), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {selectedMsg.avatar}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: '#333' }}>{selectedMsg.from}</span>
                    <span style={{ color: '#888' }}> &lt;{selectedMsg.fromEmail}&gt;</span>
                    <div style={{ fontSize: '11px' }}>{new Date(selectedMsg.date).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setComposing(true)} title="Reply" style={actionBtn}>↩</button>
                <button onClick={() => deleteMsg(selectedMsg.id)} title="Delete" style={actionBtn}>🗑</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap', userSelect: 'text' }}>
              {selectedMsg.body}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#888' }}>
            <FluentIcon name="mail" size={48} />
            <div>Select a message to read</div>
          </div>
        )}
      </div>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '6px 10px',
};
