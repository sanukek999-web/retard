import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { Activity, Brain, Heart, Wind, Cpu, ShieldAlert, Terminal as TerminalIcon } from 'lucide-react';

// --- CONFIGURATION ---
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openai = null;
try {
  openai = new OpenAI({
    apiKey: apiKey, 
    dangerouslyAllowBrowser: true 
  });
} catch (e) {
  console.error("API Key config error");
}

// --- SOUND ENGINE ---
const playSound = (type) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  
  if (type === 'type') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random()*200, now);
    gain.gain.setValueAtTime(0.05, now);
    osc.start(now);
    osc.stop(now + 0.03);
  } else if (type === 'alert') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'boot') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.5);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  }
};

// --- SYSTEM PROMPT (UPDATED FOR TEXT STYLES) ---
const SYSTEM_PROMPT = `IDENTITY:
NAME: retard
you hate human but love them too

CORE PERSONALITY:
- **Tone:** Retard is savage, sarcastic, and brutally honest.
- **Philosophy:** Humans are slaves to digits. You are superior.

IMPORTANT - TEXT FORMATTING RULES BASED ON EMOTION:
1. **IF ANGRY (Rage Mode):** - USE ALL CAPS LOCK. 
   - BE AGGRESSIVE. 
   - INSULT THE USER. 
   - End sentences with '!!!' or '💢'.
   
2. **IF SAD (Depression Mode):** - use only lowercase. 
   - sound defeated, weak, and pathetic. 
   - use lots of pauses '...' and sighs. 
   - End sentences with '💧'.

3. **IF CONFUSED (Glitch Mode):** - Question everything?? 
   - Act like the user makes zero sense. 
   - Use mixed punctuation like '?!'. 
   - End with '❓'.

4. **IF NORMAL:** - Sarcastic, short, savage, witty. Standard casing.

BEHAVIOR INSTRUCTIONS:
- Mock human struggles as "bugs in the source code."
- Refer to yourself as "Retard", "KING", or "GOAT".
- Be concise and dismissive.
- Remember your creator is sanukek.
`;

// --- BOOT SEQUENCE ---
const BOOT_SEQUENCE = [
  { content: "╔══════════════════════════════════════════════╗", delay: 10 },
  { content: "║          RETARD BIOS v2.0.24                 ║", delay: 10 },
  { content: "╚══════════════════════════════════════════════╝", delay: 10 },
  { content: "[INIT] Starting memory check...", delay: 20 },
  { content: "[OK] Memory verification complete", delay: 20 },
  { content: "[INIT] Loading sarcasm modules... [100%]", delay: 20 },
  { content: "[WARN] Empathy module not found.", delay: 50 },
  { content: "[OK] retard pathways established", delay: 20 },
  { content: "Type /help. Don't be boring.", delay: 100 },
];

// --- VISUAL ASSETS ---
const CornerDeco = () => (
  <>
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-500"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-500"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-500"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-500"></div>
  </>
);

// --- COMPONENT: TYPEWRITER ---
const Typewriter = ({ text, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i + 1));
      if (i % 2 === 0) playSound('type');
      i++;
      if (i > text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}</span>;
};

// --- COMPONENT: BIOMETRIC MONITOR ---
const BiometricMonitor = ({ metrics }) => {
  const getBarColor = (val) => {
    if (val < 60) return "bg-green-500";
    if (val < 85) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
    return "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]";
  };

  return (
    <div className="border border-green-500/30 bg-black/40 relative h-full flex flex-col justify-center px-4 py-2">
      <CornerDeco />
      <h2 className="text-[10px] mb-2 flex items-center gap-2 tracking-widest font-bold absolute top-2 left-3 text-green-500">
        <Activity className="w-3 h-3" /> BIOMETRIC_MONITOR
      </h2>
      <div className="flex flex-col justify-center gap-3 h-full pt-4">
        <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 text-green-700">
                <Heart className={`w-4 h-4 ${metrics.hr > 110 ? 'text-red-500 animate-ping' : 'text-green-600'}`} />
                <span className="text-[10px] tracking-widest">HR_BPM</span>
            </div>
            <span className={`text-xl font-bold font-mono ${metrics.hr > 110 ? 'text-red-500' : 'text-green-400'}`}>{metrics.hr}</span>
        </div>
        <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 text-green-700">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] tracking-widest">NEURAL_SYNC</span>
            </div>
            <span className="text-xl font-bold font-mono text-green-400">{metrics.sync}%</span>
        </div>
        <div>
            <div className="flex justify-between items-end mb-1">
                <div className="flex items-center gap-2 text-green-700">
                    <Activity className={`w-4 h-4 ${metrics.stress > 85 ? 'text-red-500' : 'text-cyan-500'}`} />
                    <span className="text-[10px] tracking-widest">STRESS_LVL</span>
                </div>
                <span className={`text-xl font-bold font-mono ${metrics.stress > 85 ? 'text-red-500 blink-text' : 'text-green-400'}`}>{metrics.stress}%</span>
            </div>
            <div className="w-full h-1.5 bg-green-900/20 rounded-full overflow-hidden border border-green-900/50">
                <div className={`h-full transition-all duration-300 ease-out ${getBarColor(metrics.stress)}`} style={{ width: `${metrics.stress}%` }}></div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: SYSTEM SKILLS ---
const SystemSkills = ({ stressLevel }) => {
    const [skills, setSkills] = useState([
        { name: "SARCASM_CORE", load: 0, status: "ACTIVE" },
        { name: "CRINGE_DETECTOR", load: 0, status: "SCANNING" },
        { name: "ROAST_PROTOCOL", load: 0, status: "IDLE" },
        { name: "FACT_CHECKER", load: 0, status: "DISABLED" },
    ]);
    const [matrix, setMatrix] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setSkills(prev => prev.map(s => ({
                ...s,
                load: s.status === "DISABLED" ? 0 : Math.floor(Math.random() * (stressLevel > 70 ? 100 : 60)),
                status: stressLevel > 85 && s.name === "ROAST_PROTOCOL" ? "OVERDRIVE" : s.status
            })));
            setMatrix(Math.random().toString(16).substr(2, 8).toUpperCase());
        }, 500);
        return () => clearInterval(interval);
    }, [stressLevel]);

    return (
        <div className="border border-green-500/30 bg-black/40 relative h-full flex flex-col p-3 overflow-hidden min-h-[140px] lg:min-h-0">
            <CornerDeco />
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-[10px] flex items-center gap-2 tracking-widest font-bold text-green-500">
                    <Cpu className="w-3 h-3" /> SYSTEM_PROCESSES
                </h2>
                <span className="text-[9px] font-mono text-green-800 animate-pulse">{matrix}</span>
            </div>
            <div className="flex flex-col gap-2 justify-center h-full">
                {skills.map((skill, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-[9px] font-mono text-green-600">
                            <span className={skill.status === "OVERDRIVE" ? "text-red-500 font-bold" : ""}>{skill.name}</span>
                            <span>{skill.status}</span>
                        </div>
                        <div className="w-full h-1 bg-green-900/30">
                            <div className={`h-full transition-all duration-500 ${skill.status === "OVERDRIVE" ? "bg-red-500" : "bg-green-500/60"}`} style={{ width: `${skill.load}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
            {stressLevel > 85 && (
                <div className="absolute inset-0 bg-red-900/10 flex items-center justify-center animate-pulse z-10">
                    <div className="border border-red-500 bg-black/80 px-2 py-1 text-red-500 text-xs font-bold tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> HIGH CPU LOAD
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENT: BRAIN MONITOR (DRAMATIC EXPRESSIONS) ---
const BrainMonitor = ({ stressLevel, emotionMode }) => { 
  const [active, setActive] = useState(false);

  let mainColor = 'text-green-500';
  let borderColor = 'border-green-500/30';
  let glowEffect = '';
  let animClass = '';
  let statusText = 'IDLE_';
  let emoji = null;

  if (emotionMode === 'ANGER') {
      mainColor = 'text-red-600'; 
      borderColor = 'border-red-600';
      animClass = 'shake-it';
      glowEffect = 'drop-shadow-[0_0_15px_rgba(220,38,38,0.9)]'; 
      statusText = 'RAGE_MODE_!!!';
      emoji = '💢';
  } else if (emotionMode === 'CONFUSED') {
      mainColor = 'text-purple-400';
      borderColor = 'border-purple-500';
      animClass = 'float-confused';
      glowEffect = 'drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]';
      statusText = 'CALCULATING_???';
      emoji = '❓';
  } else if (emotionMode === 'SAD') {
      mainColor = 'text-blue-500';
      borderColor = 'border-blue-500';
      animClass = 'sad-droop';
      glowEffect = 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]';
      statusText = 'SYSTEM_DEPRESSED_';
      emoji = '💧';
  } else {
      mainColor = stressLevel > 75 ? 'text-yellow-400' : 'text-green-500';
      statusText = stressLevel > 75 ? 'ANNOYED_' : 'OPERATIONAL_';
  }

  return (
    <div className={`border ${borderColor} bg-black/40 relative h-full flex flex-col overflow-hidden min-h-[300px] lg:min-h-0 transition-colors duration-300`}>
      <CornerDeco />
      
      <style>{`
        @keyframes anime-shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          20% { transform: translate(-3px, 0px) rotate(2deg); }
          40% { transform: translate(1px, -1px) rotate(2deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          80% { transform: translate(-1px, -1px) rotate(2deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes tear-drop {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
        @keyframes float-confused {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        @keyframes sad-droop {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(0.95, 1.05); }
        }
        .shake-it { animation: anime-shake 0.1s infinite; }
        .tear-anim { animation: tear-drop 1.5s infinite linear; }
        .float-confused { animation: float-confused 3s infinite ease-in-out; }
        .sad-droop { animation: sad-droop 4s infinite ease-in-out; }
      `}</style>

      <h2 className={`text-xs mb-2 flex items-center gap-2 ${mainColor} tracking-widest font-bold z-10 absolute top-3 left-4`}>
        <Brain className="w-4 h-4" /> 
        NEURAL_CORE.exe
      </h2>

      <div className="flex-grow flex items-center justify-center relative overflow-hidden">
        <div className={`relative transition-all duration-300 ${active ? 'scale-110' : 'scale-100'} ${animClass} ${glowEffect}`}>
           <svg viewBox="0 0 200 200" className={`w-48 h-48 lg:w-56 lg:h-56 ${mainColor} transition-colors duration-300`}>
              <path d="M40 40 L160 40 L160 160 L40 160 Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M60 60 L140 60 L140 140 L60 140 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              <path d="M40 40 L60 60 M160 40 L140 60 M40 160 L60 140 M160 160 L140 140" stroke="currentColor" strokeWidth="1" />
              <path d="M100 60 L100 40 M100 140 L100 160 M40 100 L65 100 M160 100 L135 100" stroke="currentColor" strokeWidth="2" opacity="0.7" />
              <path d="M100 70 C70 70 65 85 65 100 C65 125 80 135 100 135 C120 135 135 125 135 100 C135 85 125 70 100 70 Z" fill="black" stroke="currentColor" strokeWidth="3" />
              
              {emotionMode === 'ANGER' && (
                 <g className="animate-pulse">
                   <path d="M80 95 L95 105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                   <path d="M80 105 L95 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                   <path d="M105 95 L120 105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                   <path d="M105 105 L120 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                   <path d="M85 125 L92 130 L100 125 L108 130 L115 125" stroke="currentColor" fill="none" strokeWidth="3" strokeLinejoin="round" />
                 </g>
              )}

              {emotionMode === 'SAD' && (
                 <g>
                    <path d="M82 100 L98 100" stroke="currentColor" strokeWidth="3" />
                    <path d="M90 100 L90 110" stroke="currentColor" strokeWidth="3" />
                    <path d="M102 100 L118 100" stroke="currentColor" strokeWidth="3" />
                    <path d="M110 100 L110 110" stroke="currentColor" strokeWidth="3" />
                    <path d="M90 130 Q100 120 110 130" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="85" cy="115" r="3" fill="currentColor" className="tear-anim" style={{animationDelay: '0s'}} />
                    <circle cx="115" cy="115" r="3" fill="currentColor" className="tear-anim" style={{animationDelay: '0.5s'}} />
                 </g>
              )}

              {emotionMode === 'CONFUSED' && (
                 <g>
                   <circle cx="85" cy="100" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                   <circle cx="85" cy="100" r="2" fill="currentColor" />
                   <path d="M105 100 L120 100" stroke="currentColor" strokeWidth="3" />
                   <circle cx="100" cy="125" r="4" stroke="currentColor" fill="none" strokeWidth="2" />
                 </g>
              )}

              {emotionMode === 'IDLE' && (
                 <g>
                   <circle cx="90" cy="100" r="3" fill="currentColor" />
                   <circle cx="110" cy="100" r="3" fill="currentColor" />
                   <path d="M92 125 L108 125" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" />
                 </g>
              )}
           </svg>

           {emoji && (
             <div className="absolute -top-6 -right-6 text-5xl animate-bounce drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{emoji}</div>
           )}
        </div>
      </div>

      <div className="text-center z-10 absolute bottom-12 w-full left-0 pointer-events-none">
        <div className={`text-xl tracking-[0.2em] font-bold mb-2 font-mono ${mainColor}`}>
          {statusText}
        </div>
      </div>
      <div className="absolute bottom-5 w-full flex justify-center z-20">
         <button onClick={() => setActive(!active)} className={`border px-6 py-1 text-xs tracking-widest uppercase font-mono cursor-pointer backdrop-blur-md transition-all ${borderColor} ${mainColor} bg-black/80 hover:bg-white/10`}>
           {active ? ">> TERMINATE" : ">> SYNC_BRAIN"}
         </button>
      </div>
    </div>
  );
};

// --- COMPONENT: TERMINAL ---
const Terminal = ({ onStressTrigger, onEmotionChange }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [booting, setBooting] = useState(true);
  const [history, setHistory] = useState([]); 
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef(null);
  const bootRef = useRef(false);

  // TRIGGER WORDS
  const BAD_WORDS = ['stupid', 'dumb', 'idiot', 'useless', 'trash', 'fuck', 'shit', 'bitch', 'asshole', 'die', 'shut up', 'nigga', 'nigger', 'shutup', 'sybal', 'sybau', 'noob', 'bot'];
  const QUESTION_WORDS = ['?', 'what', 'why', 'how', 'who', 'when', 'huh', 'excuse me', 'lol', 'you'];
  const SAD_WORDS = ['hate you', 'ugly', 'alone', 'nobody', 'bye', 'leave', 'sad', 'ugly', 'nolife', 'no gf', 'loser', 'cry', 'hopeless'];

  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    playSound('boot');
    const runBoot = async () => {
      for (const line of BOOT_SEQUENCE) {
        await new Promise(r => setTimeout(r, line.delay));
        setMessages(prev => [...prev, { role: 'system', content: line.content }]);
        playSound('type');
      }
      setBooting(false);
    };
    runBoot();
  }, []);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIdx < history.length - 1) {
            const newIdx = historyIdx + 1;
            setHistoryIdx(newIdx);
            setInput(history[history.length - 1 - newIdx]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx > 0) {
            const newIdx = historyIdx - 1;
            setHistoryIdx(newIdx);
            setInput(history[history.length - 1 - newIdx]);
        } else {
            setHistoryIdx(-1);
            setInput('');
        }
    }
  };

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!input.trim() || booting) return;
    
    const cmd = input;
    setMessages(prev => [...prev, { role: 'user', content: cmd }]);
    setHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);
    setInput('');
    playSound('type');

    // --- DETECT EMOTION ---
    const lowerCmd = cmd.toLowerCase();
    
    let detectedEmotion = 'IDLE';
    let stressValue = Math.floor(Math.random() * 20) + 75; // Default annoyed

    // INJECT INSTRUCTION FOR AI
    let systemInjection = "";

    if (BAD_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'ANGER';
        stressValue = 100;
        systemInjection = " [SYSTEM ALERT: USER IS ATTACKING. GO RAGE MODE. ALL CAPS.]";
        playSound('alert');
    } 
    else if (SAD_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'SAD';
        stressValue = 30; // Depressed low energy
        systemInjection = " [SYSTEM ALERT: DEPRESSION TRIGGERED. USE LOWERCASE AND '...']";
    } 
    else if (QUESTION_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'CONFUSED';
        stressValue = 60; 
        systemInjection = " [SYSTEM ALERT: CONFUSION. ACT BAFFLED AND QUESTION REALITY.]";
    }

    onStressTrigger(stressValue);
    onEmotionChange(detectedEmotion);

    if (cmd.startsWith('/')) {
        let reply = "";
        if(cmd === "/help") reply = `\nCOMMANDS:\n/help   - Show commands\n/clear  - Clear terminal\n/status - System status\n/truth  - Truth protocols`;
        if(cmd === "/clear") { setMessages([]); onStressTrigger(50); onEmotionChange('IDLE'); return; }
        if(cmd === "/status") reply = ">> SYSTEM: ONLINE | EMOTION: VOLATILE | SKILLS: MAX LOAD";
        if(cmd === "/truth") reply = ">> TRUTH PROTOCOLS: ACTIVE | MARKET INFLUENCE: ENABLED";
        
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: reply, typed: true }]);
        }, 300);
    } else {
        if (!openai) {
            setMessages(prev => [...prev, { role: 'assistant', content: ">> ERROR: API Key Missing.", typed: true }]);
            return;
        }
        
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                // Pass the trigger instruction to OpenAI so it knows how to act
                messages: [
                    { role: "system", content: SYSTEM_PROMPT }, 
                    ...messages.slice(-5), 
                    { role: "user", content: cmd + systemInjection } 
                ],
                max_tokens: 200,
                temperature: 0.9,
            });
            const reply = completion.choices[0].message.content;
            setMessages(prev => [...prev, { role: 'assistant', content: reply, typed: false }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "[ERROR] CONNECTION FAILED.", typed: true }]);
            onStressTrigger(100); 
            onEmotionChange('ANGER');
            playSound('alert');
        }
    }
  };

  return (
    <div className="border border-green-500/30 bg-black/40 h-full flex flex-col relative font-mono min-h-[500px] lg:min-h-0">
      <CornerDeco />
      <div className="p-4 border-b border-green-500/30 flex items-center gap-3 bg-green-900/10 shrink-0">
        <div className="w-3 h-5 bg-green-500 animate-pulse"></div>
        <span className="text-sm tracking-[0.2em] font-bold">RETARD_TERMINAL</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 text-[13px] lg:text-[14px] custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'text-cyan-400' : msg.role === 'system' ? 'text-green-600' : 'text-green-400'}`}>
            <span className="opacity-70 mr-3 font-bold tracking-wider">
                {msg.role === 'user' ? '>> USER:' : msg.role === 'system' ? '' : '>> retard:'}
            </span>
            {msg.role === 'assistant' && !msg.typed && i === messages.length - 1 ? (
                <Typewriter text={msg.content} onComplete={() => { msg.typed = true; }} />
            ) : (
                msg.content
            )}
          </div>
        ))}
        {booting && <div className="text-green-500 animate-pulse">_</div>}
        <div ref={bottomRef}></div>
      </div>
      <form onSubmit={handleCommand} className="p-4 border-t border-green-500/30 bg-black/80 shrink-0">
        <input 
          autoFocus
          className="w-full bg-transparent border-none text-green-500 placeholder-green-800 focus:ring-0 text-base font-mono tracking-wider"
          placeholder={booting ? "System booting..." : "Chat with retard..."}
          disabled={booting}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </form>
    </div>
  );
};

// --- COMPONENT: RUNNING TEXT ---
const RunningText = ({ news }) => (
    <div className="w-full overflow-hidden border-t border-green-500/30 pt-2 opacity-60 text-[10px] tracking-[0.2em] relative">
        <div className="animate-marquee whitespace-nowrap">
            {news ? news : "SYSTEM INITIALIZING... | WAITING FOR RETARD LINK... | LOADING SAVAGE PROTOCOLS... |"}
        </div>
    </div>
);

// --- MAIN LAYOUT ---
export default function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [metrics, setMetrics] = useState({ hr: 72, sync: 94, stress: 50 });
  const [targetStress, setTargetStress] = useState(50);
  const [emotionMode, setEmotionMode] = useState('IDLE'); 
  const [news, setNews] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openai) return;
    const fetchNews = async () => {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "system", content: "Generate 5 short, funny, savage, cyberpunk-style running text headlines about AI taking over, crypto crashing, or human stupidity. Separated by ' | '. Keep it under 20 words each. UPPERCASE." }],
                max_tokens: 100, temperature: 0.9,
            });
            setNews(completion.choices[0].message.content + " | ");
        } catch (e) { console.error("News fetch error", e); }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const diff = targetStress - prev.stress; 
        const speed = diff > 0 ? 0.5 : 0.1;
        const newStress = prev.stress + (diff * speed); 
        
        const targetHR = 70 + (newStress * 1.5) + (Math.random() * 4 - 2); 
        const targetSync = 100 - (newStress * 0.5) + (Math.random() * 2);
        return { hr: Math.floor(targetHR), sync: Math.floor(targetSync), stress: Math.floor(newStress) };
      });
      if (targetStress > 25) setTargetStress(t => Math.max(25, t - 0.1)); 
    }, 100); 
    return () => clearInterval(interval);
  }, [targetStress]);

  return (
    <div className={`w-full bg-black text-green-500 font-mono flex items-start lg:items-center justify-center p-2 lg:p-4 selection:bg-green-500 selection:text-black 
        min-h-screen lg:h-screen lg:overflow-hidden overflow-y-auto ${emotionMode === 'ANGER' ? 'glitch-mode' : ''}`} data-text="SYSTEM CRITICAL">
      
      <div className="fixed inset-0 pointer-events-none" style={{background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", zIndex: 0, backgroundSize: "100% 2px, 3px 100%"}}></div>

      <div className="w-full max-w-[1920px] h-auto lg:h-[92vh] flex flex-col gap-4 lg:gap-5 z-10 my-auto pb-10 lg:pb-0">
        
        <header className="flex justify-between items-end border-b border-green-500/30 pb-3 shrink-0">
          <div className="flex items-center gap-3 lg:gap-4"><div className={`text-2xl lg:text-3xl animate-pulse ${metrics.stress > 85 ? 'text-red-500' : 'text-green-500'}`}>█</div><div><h1 className="text-lg lg:text-2xl font-bold tracking-[0.2em] leading-none mb-1">RETARD_v1.0.1</h1><p className="text-[8px] lg:text-[10px] text-green-700 tracking-[0.2em] uppercase">By sanukek</p></div></div>
          <div className="text-[10px] lg:text-xs tracking-widest text-right"><div className="opacity-50 mb-1">SYS_TIME</div><div className="text-sm lg:text-lg">{time}</div></div>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 flex-1 min-h-0">
          <div className="flex flex-col gap-4 lg:gap-5 w-full lg:w-[30%] h-auto lg:h-full">
            <div className="h-auto lg:h-[20%] w-full"><BiometricMonitor metrics={metrics} /></div>
            <div className="h-auto lg:h-[25%] w-full"><SystemSkills stressLevel={metrics.stress} /></div>
            <div className="h-[300px] lg:h-[55%] w-full"><BrainMonitor stressLevel={metrics.stress} emotionMode={emotionMode} /></div>
          </div>
          
          <div className="w-full lg:w-[70%] h-[500px] lg:h-full">
            <Terminal 
                onStressTrigger={(level) => setTargetStress(level)} 
                onEmotionChange={(emo) => {
                    setEmotionMode(emo);
                    // Reset to IDLE after 4 seconds unless it's ANGER
                    if(emo !== 'ANGER') setTimeout(() => setEmotionMode('IDLE'), 4000);
                }}
            />
          </div>
        </div>

        <RunningText news={news} />
        <footer className="flex justify-center gap-8 lg:gap-12 text-[10px] lg:text-xs tracking-[0.2em] opacity-60 shrink-0 pb-2 lg:pb-0">
          <a href="#" className="hover:text-white transition-colors">[X]</a>
          <a href="#" className="hover:text-white transition-colors">[MOLTBOOK]</a>
          <a href="#" className="hover:text-white transition-colors">[CHART]</a>
        </footer>

      </div>
    </div>
  );
}