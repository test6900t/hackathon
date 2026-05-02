import { useState, useRef, useEffect, useCallback } from 'react';
import { VirtualFS } from '../os/VirtualFS';

interface HistoryEntry { text: string; type: 'input' | 'output'; }

export function CommandPrompt() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { text: 'Error64 [Version 21H2 (OS Build 19044.1288)]\n(c) Error64 Corporation. All rights reserved.\n', type: 'output' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('C:\\Users\\User');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [textColor, setTextColor] = useState('#c0c0c0');
  const [bgColor, setBgColor] = useState('#0c0c0c');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const prompt = `${cwd}>`;

  const write = useCallback((text: string) => {
    setHistory(h => [...h, { text, type: 'output' }]);
  }, []);

  const fakeIpconfig = () => `
Windows IP Configuration

Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . :
   IPv4 Address. . . . . . . . . . . : 192.168.1.${Math.floor(Math.random()*200)+10}
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
`;

  const fakePing = (host: string) => {
    const ms = () => Math.floor(Math.random() * 20) + 5;
    return `Pinging ${host} with 32 bytes of data:
Reply from 93.184.216.34: bytes=32 time=${ms()}ms TTL=54
Reply from 93.184.216.34: bytes=32 time=${ms()}ms TTL=54
Reply from 93.184.216.34: bytes=32 time=${ms()}ms TTL=54
Reply from 93.184.216.34: bytes=32 time=${ms()}ms TTL=54

Ping statistics for ${host}:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 5ms, Maximum = 25ms, Average = ${ms()}ms`;
  };

  const fakeSysteminfo = () => `
OS Name:                   Error64
OS Version:                21H2, Build 19044.1288
OS Manufacturer:           Error64 Corporation
System Type:               x64-based PC
Processor:                 Intel(R) Core(TM) i5-10400 CPU @ 2.90GHz
Total Physical Memory:     8,192 MB
Available Physical Memory: 4,096 MB
`;

  const fakeTasklist = () => `
Image Name                     PID Session Name        Mem Usage
========================= ======== ================ ============
System Idle Process              0 Services             8 K
System                           4 Services           444 K
smss.exe                       396 Services         1,064 K
csrss.exe                      596 Services         4,832 K
winlogon.exe                   668 Services         4,096 K
explorer.exe                  2880 Console          62,448 K
error64.exe                   3344 Console         128,000 K
`;

  const handleCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim();
    setHistory(h => [...h, { text: `${prompt} ${trimmed}`, type: 'input' }]);
    setCmdHistory(h => [trimmed, ...h].filter(Boolean));
    setHistIdx(-1);

    if (!trimmed) return;

    const [command, ...args] = trimmed.toLowerCase().split(/\s+/);
    const rawArgs = trimmed.split(/\s+/).slice(1);

    switch (command) {
      case 'cls': setHistory([]); break;
      case 'echo': write(rawArgs.join(' ') || ''); break;
      case 'ver': write('Error64 [Version 21H2 (OS Build 19044.1288)]'); break;
      case 'whoami': write('error64\\user'); break;
      case 'date': write(`Current date: ${new Date().toLocaleDateString()}`); break;
      case 'time': write(`Current time: ${new Date().toLocaleTimeString()}`); break;
      case 'title': document.title = rawArgs.join(' ') || 'Command Prompt'; break;
      case 'color': {
        const colors: Record<string, string> = { '0': '#000', '1': '#0000aa', '2': '#00aa00', '3': '#00aaaa', '4': '#aa0000', '7': '#aaaaaa', 'a': '#00ff00', 'b': '#00ffff', 'f': '#ffffff', 'e': '#ffff00' };
        if (rawArgs[0] && rawArgs[0].length === 2) { setBgColor(colors[rawArgs[0][0]] || bgColor); setTextColor(colors[rawArgs[0][1]] || textColor); }
        break;
      }
      case 'dir': {
        const items = VirtualFS.getChildren(cwd, true);
        const dirs = items.filter(i => i.type === 'folder');
        const files = items.filter(i => i.type === 'file');
        const output = ` Volume in drive C has no label.\n Directory of ${cwd}\n\n` +
          (dirs.map(d => `${new Date(d.modified).toLocaleDateString()} ${new Date(d.modified).toLocaleTimeString()}    <DIR>          ${d.name}`).join('\n')) + '\n' +
          (files.map(f => `${new Date(f.modified).toLocaleDateString()} ${new Date(f.modified).toLocaleTimeString()}     ${String(f.size).padStart(12)}  ${f.name}`).join('\n')) + '\n' +
          `\t${dirs.length} Dir(s)\n\t${files.length} File(s)`;
        write(output);
        break;
      }
      case 'cd': {
        if (!rawArgs[0] || rawArgs[0] === '.') { write(cwd); break; }
        if (rawArgs[0] === '..') { const p = cwd.split('\\'); p.pop(); setCwd(p.join('\\') || 'C:'); break; }
        const newPath = rawArgs[0].includes(':') ? rawArgs[0] : `${cwd}\\${rawArgs[0]}`;
        const node = VirtualFS.getNode(newPath);
        if (node && node.type === 'folder') setCwd(newPath);
        else write(`The system cannot find the path specified.`);
        break;
      }
      case 'mkdir': case 'md': {
        if (!rawArgs[0]) { write('The syntax of the command is incorrect.'); break; }
        VirtualFS.createFolder(cwd, rawArgs[0]);
        write('');
        break;
      }
      case 'rmdir': case 'rd': {
        if (!rawArgs[0]) { write('The syntax of the command is incorrect.'); break; }
        VirtualFS.delete(`${cwd}\\${rawArgs[0]}`);
        write('');
        break;
      }
      case 'del': case 'erase': {
        if (!rawArgs[0]) { write('The syntax of the command is incorrect.'); break; }
        VirtualFS.delete(`${cwd}\\${rawArgs[0]}`);
        write('');
        break;
      }
      case 'copy': {
        if (rawArgs.length < 2) { write('The syntax of the command is incorrect.'); break; }
        write(`        1 file(s) copied.`);
        break;
      }
      case 'move': {
        if (rawArgs.length < 2) { write('The syntax of the command is incorrect.'); break; }
        write(`        1 file(s) moved.`);
        break;
      }
      case 'ren': case 'rename': {
        if (rawArgs.length < 2) { write('The syntax of the command is incorrect.'); break; }
        VirtualFS.rename(`${cwd}\\${rawArgs[0]}`, rawArgs[1]);
        write('');
        break;
      }
      case 'type': {
        if (!rawArgs[0]) { write('The syntax of the command is incorrect.'); break; }
        const p = rawArgs[0].includes(':') ? rawArgs[0] : `${cwd}\\${rawArgs[0]}`;
        const content = await VirtualFS.readFile(p);
        write(content ?? `The system cannot find the file specified.`);
        break;
      }
      case 'ipconfig': write(fakeIpconfig()); break;
      case 'ping': write(rawArgs[0] ? fakePing(rawArgs[0]) : 'Usage: ping [host]'); break;
      case 'systeminfo': case 'sysinfo': write(fakeSysteminfo()); break;
      case 'tasklist': write(fakeTasklist()); break;
      case 'taskkill': write(`SUCCESS: The process with PID ${rawArgs.includes('/PID') ? rawArgs[rawArgs.indexOf('/PID')+1] : '???'} has been terminated.`); break;
      case 'tracert': {
        const host = rawArgs[0] || 'example.com';
        let out = `Tracing route to ${host}\nover a maximum of 30 hops:\n\n`;
        for (let i = 1; i <= 8; i++) {
          const ms = () => Math.floor(Math.random() * 15) + i * 5;
          out += `  ${i.toString().padStart(2)}   ${ms()} ms   ${ms()} ms   ${ms()} ms  ${i === 8 ? host : `10.${i}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`}\n`;
        }
        out += '\nTrace complete.';
        write(out);
        break;
      }
      case 'start': { write(`Opening ${rawArgs.join(' ')}...`); break; }
      case 'help': write(`For more information on a specific command, type HELP command-name

ASSOC    Displays or modifies file extension associations.
CD       Displays or sets the current directory.
CLS      Clears the screen.
COLOR    Sets the default console foreground and background colors.
COPY     Copies one or more files to another location.
DATE     Displays or sets the date.
DEL      Deletes one or more files.
DIR      Displays a list of files and subdirectories.
ECHO     Displays messages or turns command echoing on or off.
EXIT     Quits the CMD.EXE program.
HELP     Provides Help information for Error64 commands.
MD       Creates a directory.
MKDIR    Creates a directory.
MOVE     Moves one or more files.
PING     Sends ICMP echo requests to a network host.
RD       Removes a directory.
REN      Renames a file or files.
RENAME   Renames a file or files.
RMDIR    Removes a directory.
START    Starts a separate window to run a specified program.
SYSTEMINFO Displays OS and hardware configuration.
TASKKILL Terminates tasks by process id.
TASKLIST Displays a list of currently running processes.
TIME     Displays or sets the system time.
TITLE    Sets the window title.
TRACERT  Traces the route to a remote host.
TYPE     Prints the contents of a text file.
VER      Displays the Error64 version.
WHOAMI   Displays user information.`); break;
      case 'exit': write('Cannot exit from here. Close the window to exit.'); break;
      default: write(`'${trimmed.split(' ')[0]}' is not recognized as an internal or external command,\noperable program or batch file.`);
    }
  }, [cwd, prompt, write, bgColor, textColor]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { handleCommand(input); setInput(''); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(newIdx);
      setInput(cmdHistory[newIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(histIdx - 1, -1);
      setHistIdx(newIdx);
      setInput(newIdx === -1 ? '' : cmdHistory[newIdx] || '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion
      const items = VirtualFS.getChildren(cwd, false);
      const match = items.find(i => i.name.toLowerCase().startsWith(input.toLowerCase()));
      if (match) setInput(match.name);
    }
  };

  return (
    <div
      style={{ height: '100%', background: bgColor, color: textColor, fontFamily: 'Consolas, "Courier New", monospace', fontSize: '14px', overflowY: 'auto', padding: '8px', cursor: 'text', display: 'flex', flexDirection: 'column', userSelect: 'text' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output */}
      <div style={{ flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
        {history.map((h, i) => (
          <div key={i} style={{ color: h.type === 'input' ? textColor : textColor }}>{h.text}</div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input line */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
        <span style={{ whiteSpace: 'pre' }}>{prompt} </span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: textColor, fontFamily: 'Consolas, "Courier New", monospace', fontSize: '14px', caretColor: textColor }}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
