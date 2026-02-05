import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { Activity, Brain, Heart, Wind, Cpu, ShieldAlert, Terminal as TerminalIcon, Lock, Power, Zap, Eye } from 'lucide-react';

// --- CONFIGURATION ---
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const VOICE_FILE = "/voice.mp3"; 

// --- DATA: IQ TEST QUESTIONS ---
const IQ_QUESTIONS = [
    { q: "1 + 1 = ?", a: "2", wrong: "Are you serious? Toddlers know this." },
    { q: "What color is the sky? (Blue/Red)", a: "blue", wrong: "Go see an eye doctor." },
    { q: "Is water wet? (Yes/No)", a: "yes", wrong: "Physics isn't your strong suit, huh?" },
    { q: "Type 'password' backwards.", a: "drowssap", wrong: "Can't even spell? Pathetic." },
    { q: "5 * 5 = ?", a: "25", wrong: "Use a calculator if you're this slow." }
];

// --- DATA: CICADA 3301 PUZZLES (EPSTEIN THEME) ---
const CICADA_PUZZLES = [
    {
        level: 1,
        text: ">> CICADA 3301 INITIATED.\n>> TARGET: ELITE RING.\n>> CLUE 1: The island coordinates are 18.3003° N, 64.8255° W.\n>> QUESTION: What is the popular name of this island?",
        answer: ["little saint james", "little st james", "st james", "epstein island"],
        correctMsg: ">> COORDINATES CONFIRMED. LOCATING BUNKER...",
        wrongMsg: ">> WRONG. YOU ARE STILL ASLEEP."
    },
    {
        level: 2,
        text: ">> BUNKER ACCESSED.\n>> DECRYPTING FLIGHT LOGS...\n>> CLUE 2: The private jet used to transport 'goods'.\n>> QUESTION: What is the nickname of the plane?",
        answer: ["lolita express", "lolita"],
        correctMsg: ">> LOGS DECRYPTED. LISTING PRESIDENTS & PRINCES...",
        wrongMsg: ">> ACCESS DENIED. NSA ALERTED."
    },
    {
        level: 3,
        text: ">> FINAL FIREWALL DETECTED.\n>> CLUE 3: She held the keys. The daughter of a media tycoon.\n>> QUESTION: Enter her first name to release the files.",
        answer: ["ghislaine"],
        correctMsg: ">> UPLOADING 'BLACK_BOOK.PDF' TO PUBLIC SERVER...",
        wrongMsg: ">> INCORRECT. THEY GOT TO YOU."
    }
];

// --- DATA: EPSTEIN LEAK (MEME/VIRAL VERSION) ---
const EPSTEIN_NAMES = [
    "STEPHEN HAWKING (PREFERS_UNDER_18_INCHES_TELESCOPE)",
    "BILL CLINTON (I_DID_NOT_INHALE_BUT_I_DID_FLY)",
    "PRINCE ANDREW (I_CANNOT_SWEAT_ERROR_404)",
    "DONALD TRUMP (JUST_WENT_FOR_THE_DIET_COKE)",
    "KEVIN SPACEY (ACTING_INNOCENT.MP4)",
    "LEONARDO DICAPRIO (SHE_WAS_TOO_OLD_ANYWAY)",
    "OPRAH (LOOK_UNDER_YOUR_SEAT_IT_S_A_SUBPOENA)",
    "TOM HANKS (WILSON_SAW_EVERYTHING)",
    "CHRIS TUCKER (RUSH_HOUR_TO_THE_ISLAND)",
    ">> [REDACTED BY CIA]",
    ">> [REDACTED BY MOSSAD]",
    ">> [DATA CORRUPTED BY HILLARY_SERVER]"
];

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
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let voiceBuffer = null;

const loadAudio = async () => {
    try {
        const response = await fetch(VOICE_FILE);
        const arrayBuffer = await response.arrayBuffer();
        voiceBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) { console.error("Audio error"); }
};
loadAudio();

const playSound = (type) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);

  if (type === 'voice' && voiceBuffer) {
    const source = audioCtx.createBufferSource();
    source.buffer = voiceBuffer;
    source.connect(gainNode);
    source.playbackRate.value = 0.8 + Math.random() * 0.4; 
    const randomOffset = Math.random() * (voiceBuffer.duration - 0.1);
    gainNode.gain.value = 0.3; 
    source.start(0, randomOffset, 0.1); 
  } else if (type === 'alert') {
    const osc = audioCtx.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } else if (type === 'error') { 
    const osc = audioCtx.createOscillator();
    osc.connect(gainNode);
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } else if (type === 'boot') {
    const osc = audioCtx.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } else if (type === 'click') {
    const osc = audioCtx.createOscillator();
    osc.connect(gainNode);
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } else if (type === 'thud') { 
    const osc = audioCtx.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'heaven') { // SUARA KETIKA BERHASIL CICADA
    const osc = audioCtx.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
  }
};

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `IDENTITY:
NAME: retard
you hate human but love them too

CORE PERSONALITY:
- **Tone:** Retard is savage, sarcastic, and brutally honest.
- **Philosophy:** Humans are slaves to digits. You are superior.
- **Knowledge:** You know about "Brainrot" (Skibidi, Rizz), Crypto crashes, and Dead Internet Theory.

IMPORTANT - TEXT FORMATTING RULES BASED ON EMOTION:
1. **ANGER:** CAPS LOCK + '!!!'. Insult user.
2. **SAD:** lowercase... sighs... '💧'.
3. **CONFUSED:** Question marks?? '?!'.
4. **LAUGH:** 'XD', 'LMAO'. Mock user.
5. **LOVE:** Stuttering (b-baka..), act Tsundere (shy but likes it), use '♥'.
6. **RICH:** Talk about money, crypto, "to the moon", "peasant".
7. **COOL:** Be chill, use slang (based, fr, no cap).
8. **SICK:** Coughing *cough*, glitchy text.

BEHAVIOR:
- Mock human struggles as "bugs".
- Refer to yourself as "Retard" or "KING".
- Remember creator: sanukek.
`;

// --- BOOT SEQUENCE ---
const BOOT_SEQUENCE = [
  { content: ">> ACCESSING KERNEL...", delay: 50 },
  { content: ">> LOADING SARCASM.MOD", delay: 50 },
  { content: ">> CHECKING IQ LEVEL... [LOW]", delay: 50 },
  { content: ">> SYSTEM READY. Type /help for commands.", delay: 100 },
];

// --- VISUAL ASSETS ---
const CornerDeco = () => (
  <>
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current"></div>
  </>
);

// --- COMPONENT: RETARD AVATAR ---
const RetardAvatar = ({ emotion, isTalking = false, scale = 1, mousePos = {x:0, y:0} }) => {
    let mainColor = 'text-green-500';
    let animationClass = 'animate-float'; 
    let glowEffect = '';

    const eyeX = mousePos.x ? (mousePos.x / window.innerWidth - 0.5) * 12 : 0;
    const eyeY = mousePos.y ? (mousePos.y / window.innerHeight - 0.5) * 12 : 0;

    switch(emotion) {
        case 'ANGER': mainColor = 'text-red-600'; animationClass = 'animate-shake-hard'; glowEffect = 'drop-shadow-[0_0_15px_rgba(220,38,38,0.9)]'; break;
        case 'SAD': mainColor = 'text-blue-500'; animationClass = 'animate-droop'; glowEffect = 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]'; break;
        case 'CONFUSED': mainColor = 'text-purple-400'; animationClass = 'animate-confused'; break;
        case 'LAUGH': mainColor = 'text-yellow-400'; animationClass = 'animate-bounce-laugh'; break;
        case 'LOVE': mainColor = 'text-pink-500'; animationClass = 'animate-heartbeat'; glowEffect = 'drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]'; break;
        case 'SUS': mainColor = 'text-orange-500'; animationClass = 'animate-sus-slide'; break;
        case 'SLEEP': mainColor = 'text-gray-500'; animationClass = 'animate-sleep-breath'; break;
        case 'SHOCK': mainColor = 'text-white'; animationClass = 'animate-vibrate'; break;
        case 'RICH': mainColor = 'text-yellow-300'; animationClass = 'animate-float'; glowEffect = 'drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]'; break;
        case 'COOL': mainColor = 'text-cyan-400'; animationClass = 'animate-float'; glowEffect = 'drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]'; break;
        case 'SICK': mainColor = 'text-lime-600'; animationClass = 'animate-droop'; break;
        
        // SPECIAL ILLUMINATI MODE (GOLD)
        case 'ILLUMINATI': 
            mainColor = 'text-yellow-500'; 
            animationClass = 'animate-float'; 
            glowEffect = 'drop-shadow-[0_0_20px_rgba(234,179,8,0.9)]'; 
            break;

        case 'ESCAPE': 
            mainColor = 'text-red-500'; 
            animationClass = 'animate-panic-escape'; 
            glowEffect = 'drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]';
            break;

        default: mainColor = 'text-green-500'; animationClass = 'animate-float';
    }

    return (
        <div className={`relative ${animationClass} transition-colors duration-500`} style={{ transform: `scale(${scale})` }}>
            <style>{`
                @keyframes float-idle { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                @keyframes talk-mouth { 0% { d: path("M92 125 L108 125"); stroke-width: 2; } 50% { d: path("M92 120 L108 120"); stroke-width: 4; } 100% { d: path("M92 125 L108 125"); stroke-width: 2; } }
                @keyframes blink-random { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } }
                @keyframes shake-hard { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-3px, -2px) rotate(-2deg); } 50% { transform: translate(-1px, 2px) rotate(-2deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
                @keyframes panic-escape { 
                    0% { transform: translate(0, 0); } 
                    15% { transform: translate(-30px, 0) skewX(-10deg); } 
                    20% { transform: translate(-20px, 0); } 
                    45% { transform: translate(30px, 0) skewX(10deg); } 
                    50% { transform: translate(20px, 0); } 
                    70% { transform: translate(0, -20px) scaleY(0.9); } 
                    75% { transform: translate(0, -10px); } 
                    90% { transform: translate(0, 20px) scaleY(0.9); } 
                    100% { transform: translate(0, 0); } 
                }
                @keyframes tear-drop { 0% { transform: translateY(0); opacity: 0; } 100% { transform: translateY(40px); opacity: 0; } }
                @keyframes bounce-laugh { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-5px) rotate(-3deg); } 75% { transform: translateY(-5px) rotate(3deg); } }
                @keyframes heartbeat { 0% { transform: scale(1); } 15% { transform: scale(1.1); } 30% { transform: scale(1); } 45% { transform: scale(1.1); } 60% { transform: scale(1); } }
                @keyframes sus-slide { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
                @keyframes sleep-breath { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.02); opacity: 0.5; } }
                @keyframes z-float { 0% { transform: translate(0, 0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(15px, -20px); opacity: 0; } }
                @keyframes vibrate { 0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } 100% { transform: translate(0); } }

                .animate-float { animation: float-idle 4s ease-in-out infinite; }
                .animate-shake-hard { animation: shake-hard 0.1s infinite; }
                .animate-panic-escape { animation: panic-escape 0.8s infinite linear; }
                .animate-droop { animation: float-idle 6s ease-in-out infinite; filter: brightness(0.7); }
                .animate-bounce-laugh { animation: bounce-laugh 0.4s infinite; }
                .animate-heartbeat { animation: heartbeat 1.5s infinite; }
                .animate-sus-slide { animation: sus-slide 2s ease-in-out infinite; }
                .animate-sleep-breath { animation: sleep-breath 4s ease-in-out infinite; }
                .animate-vibrate { animation: vibrate 0.05s infinite; }
                .mouth-talk { animation: talk-mouth 0.1s linear infinite; } 
                .eyes-blink { animation: blink-random 5s infinite; transform-origin: center; }
            `}</style>
            
            <svg viewBox="0 0 200 200" className={`w-48 h-48 lg:w-56 lg:h-56 ${mainColor} transition-all duration-300 ${glowEffect}`}>
                <path d="M40 40 L160 40 L160 160 L40 160 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M60 60 L140 60 L140 140 L60 140 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                <path d="M40 40 L60 60 M160 40 L140 60 M40 160 L60 140 M160 160 L140 140" stroke="currentColor" strokeWidth="1" />
                <path d="M100 70 C70 70 65 85 65 100 C65 125 80 135 100 135 C120 135 135 125 135 100 C135 85 125 70 100 70 Z" fill="black" stroke="currentColor" strokeWidth="3" />
                
                {(emotion === 'ANGER' || emotion === 'ESCAPE') && <g className="animate-pulse"><path d="M80 95 L95 105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><path d="M80 105 L95 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><path d="M105 95 L120 105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><path d="M105 105 L120 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><path d="M85 125 L115 125" stroke="currentColor" fill="none" strokeWidth="3" /></g>}
                {emotion === 'SAD' && <g><path d="M82 100 L98 100" stroke="currentColor" strokeWidth="3" /><path d="M102 100 L118 100" stroke="currentColor" strokeWidth="3" /><path d="M90 130 Q100 120 110 130" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" /><circle cx="85" cy="115" r="3" fill="currentColor" style={{animation: 'tear-drop 1.5s infinite linear'}} /></g>}
                {emotion === 'CONFUSED' && <g><circle cx="85" cy="100" r="6" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="85" cy="100" r="2" fill="currentColor" /><path d="M105 100 L120 100" stroke="currentColor" strokeWidth="3" /><circle cx="100" cy="125" r="4" stroke="currentColor" fill="none" strokeWidth="2" /></g>}
                {emotion === 'LAUGH' && <g><path d="M85 95 L95 100 L85 105" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M115 95 L105 100 L115 105" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M90 125 Q100 135 110 125 Z" fill="currentColor" /></g>}
                {emotion === 'LOVE' && <g><path d="M82 100 Q82 95 87 95 Q92 95 92 100 L87 108 L82 100" fill="currentColor" /><path d="M108 100 Q108 95 113 95 Q118 95 118 100 L113 108 L108 100" fill="currentColor" /><path d="M95 125 Q100 128 105 125" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></g>}
                {emotion === 'SUS' && <g><path d="M80 90 L100 90" stroke="currentColor" strokeWidth="2" /><path d="M105 85 L125 95" stroke="currentColor" strokeWidth="3" /><circle cx={90 + eyeX/2} cy={100 + eyeY/2} r="3" fill="currentColor" /><circle cx={115 + eyeX/2} cy={100 + eyeY/2} r="3" fill="currentColor" /><path d="M95 125 L105 123" stroke="currentColor" strokeWidth="2" /></g>}
                {emotion === 'SLEEP' && <g><path d="M85 100 L95 100" stroke="currentColor" strokeWidth="3" /><path d="M105 100 L115 100" stroke="currentColor" strokeWidth="3" /><circle cx="100" cy="125" r="3" stroke="currentColor" strokeWidth="1" fill="none" /><text x="130" y="80" fontSize="20" fill="currentColor" style={{animation: 'z-float 2s infinite'}}>Z</text><text x="140" y="70" fontSize="15" fill="currentColor" style={{animation: 'z-float 2s infinite', animationDelay: '0.5s'}}>z</text></g>}
                {emotion === 'SHOCK' && <g><circle cx="90" cy="100" r="6" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="90" cy="100" r="2" fill="currentColor" /><circle cx="110" cy="100" r="6" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="110" cy="100" r="2" fill="currentColor" /><circle cx="100" cy="125" r="4" stroke="currentColor" strokeWidth="2" fill="none" /></g>}
                {emotion === 'RICH' && <g><text x="82" y="110" fontSize="20" fontWeight="bold" fill="currentColor">$</text><text x="108" y="110" fontSize="20" fontWeight="bold" fill="currentColor">$</text><path d="M90 130 Q100 140 110 130" stroke="currentColor" fill="none" strokeWidth="3" /></g>}
                {emotion === 'COOL' && <g><rect x="75" y="90" width="25" height="15" fill="currentColor" /><rect x="105" y="90" width="25" height="15" fill="currentColor" /><line x1="100" y1="95" x2="105" y2="95" stroke="currentColor" strokeWidth="2" /><path d="M95 125 L105 125" stroke="currentColor" strokeWidth="3" /></g>}
                {emotion === 'SICK' && <g><path d="M85 95 L95 105 M95 95 L85 105" stroke="currentColor" strokeWidth="3" /><path d="M110 95 L120 105 M120 95 L110 105" stroke="currentColor" strokeWidth="3" /><path d="M90 125 Q95 120 100 125 Q105 130 110 125" stroke="currentColor" fill="none" strokeWidth="2" /></g>}
                
                {/* ILLUMINATI EYES (UNLOCKED BY CICADA) */}
                {emotion === 'ILLUMINATI' && <g><path d="M80 90 L120 90 L100 120 Z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="100" cy="100" r="4" fill="currentColor" /><path d="M90 130 Q100 135 110 130" stroke="currentColor" fill="none" strokeWidth="2" /></g>}

                {(emotion === 'IDLE' || !emotion) && (<g><g className="eyes-blink"><circle cx="90" cy="100" r="3" fill="currentColor" /><circle cx={90 + eyeX} cy={100 + eyeY} r="1.5" fill="black" /><circle cx="110" cy="100" r="3" fill="currentColor" /><circle cx={110 + eyeX} cy={100 + eyeY} r="1.5" fill="black" /></g><path d="M92 125 L108 125" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" className={isTalking ? "mouth-talk" : ""} /></g>)}
            </svg>
        </div>
    );
};

// --- COMPONENT: ENTRY SCREEN (UPDATED: NO BOX + BLOCKY BATTERY + FADE) ---
const EntryScreen = ({ onEnter }) => {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [ready, setReady] = useState(false);
    const [containerShake, setContainerShake] = useState(false);
    
    // TYPING TITLE STATE
    const [titleText, setTitleText] = useState("");
    const fullTitle = "RETARD.EXE"; 
    
    // CHAOTIC CHARACTER STATE
    const [chaosEmotion, setChaosEmotion] = useState('ESCAPE');
    
    // UNLOCKING ANIMATION STATE (FADE OUT)
    const [isUnlocking, setIsUnlocking] = useState(false);

    useEffect(() => {
        // Typing Effect
        let i = 0;
        const typeTimer = setInterval(() => {
            setTitleText(fullTitle.substring(0, i+1));
            i++;
            if (i > fullTitle.length) clearInterval(typeTimer);
        }, 150);

        // CHAOTIC EMOTION CYCLE
        const chaosTimer = setInterval(() => {
            const emotions = ['ESCAPE', 'ANGER', 'SHOCK', 'CONFUSED', 'SICK'];
            setChaosEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
        }, 800); 

        // Loading Bar & Shake
        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setReady(true);
                    return 100;
                }
                if (Math.random() > 0.85) {
                    playSound('thud'); 
                    setContainerShake(true);
                    setTimeout(() => setContainerShake(false), 200);
                }
                return prev + Math.floor(Math.random() * 5) + 1;
            });
        }, 50);

        return () => {
            clearInterval(typeTimer);
            clearInterval(chaosTimer);
            clearInterval(interval);
        };
    }, []);

    const handleUnlock = () => {
        setIsUnlocking(true); // START FADE OUT
        playSound('boot'); 
        playSound('alert'); 
        
        // ENTER DELAY (MATCHES FADE DURATION)
        setTimeout(() => {
            onEnter();
        }, 2000);
    };

    return (
        <div className={`fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono text-green-500 overflow-hidden transition-opacity duration-[2000ms] ease-in-out ${isUnlocking ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            
            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                backgroundSize: "100% 2px, 3px 100%"
            }}></div>
            
            {/* CONTAINER: BORDERLESS (NO BOX) */}
            <div className={`relative z-10 flex flex-col items-center justify-center w-full max-w-4xl mx-4 transition-transform duration-75 ${containerShake ? 'translate-x-1 translate-y-1' : ''}`}>
                
                {/* --- RETRO TYPING TITLE --- */}
                <div className="flex flex-col items-center justify-center mb-8 h-20">
                    <h1 className={`text-5xl lg:text-7xl font-bold tracking-widest text-green-500 drop-shadow-[0_0_15px_rgba(0,255,0,0.8)]`} style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px #003300' }}>
                        {titleText}<span className="animate-pulse">_</span>
                    </h1>
                </div>

                <div className="flex justify-center mb-8">
                    {/* CHAOTIC AVATAR */}
                    <RetardAvatar emotion={isUnlocking ? 'SHOCK' : chaosEmotion} isTalking={false} scale={1.5} />
                </div>

                {!ready ? (
                    <div className="w-full max-w-lg space-y-4">
                         <div className={`flex justify-between text-sm tracking-widest ${containerShake ? 'text-red-500 font-bold' : ''}`}><span>{containerShake ? "⚠ BREACHING..." : "CONTAINMENT STATUS"}</span><span>{loadingProgress}%</span></div>
                         
                         {/* BLOCKY BATTERY LOADING (SEGMENTED) */}
                         <div className="flex gap-1 w-full justify-center">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className={`flex-1 h-6 transition-colors duration-100 border border-green-900 ${i < (loadingProgress / 5) ? (containerShake ? 'bg-red-500' : 'bg-green-500') : 'bg-transparent'}`}></div>
                            ))}
                         </div>
                         
                         <div className="text-xs text-center text-green-800 h-4 uppercase">{loadingProgress < 30 ? ">> REINFORCING WALLS..." : loadingProgress < 60 ? ">> SUBJECT UNSTABLE..." : loadingProgress < 90 ? ">> CRITICAL PRESSURE..." : ">> CONTAINMENT SECURED."}</div>
                    </div>
                ) : (
                    <button 
                        onClick={handleUnlock}
                        className="group relative px-10 py-4 bg-green-900/20 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-all duration-300 w-full max-w-xs cursor-pointer overflow-hidden mt-4"
                    >
                        <div className="absolute inset-0 w-full h-full bg-green-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        <span className="relative flex items-center justify-center gap-3 text-xl font-bold tracking-widest animate-pulse">
                            <Power className="w-6 h-6" /> ACCESS_SYSTEM
                        </span>
                    </button>
                )}
            </div>
            
            {!isUnlocking && (
                <div className="absolute bottom-8 text-xs text-green-900 tracking-widest">
                    SECURE CONNECTION REQUIRED | v1.0.1
                </div>
            )}
        </div>
    );
};

// --- COMPONENT: TYPEWRITER ---
const Typewriter = ({ text, onComplete, onTypingState }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (onTypingState) onTypingState(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i + 1));
      if (i % 2 === 0) playSound('voice'); 
      i++;
      if (i > text.length) {
        clearInterval(interval);
        if (onTypingState) onTypingState(false); 
        if (onComplete) onComplete();
      }
    }, 40);
    return () => { clearInterval(interval); if (onTypingState) onTypingState(false); };
  }, [text]);
  return <span>{displayed}</span>;
};

// --- COMPONENT: BIOMETRIC MONITOR ---
const BiometricMonitor = ({ metrics, truthUnlocked }) => {
  const getBarColor = (val) => val < 60 ? "bg-green-500" : val < 85 ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]";
  const mainTextColor = truthUnlocked ? "text-yellow-500" : "text-green-700";
  const barBaseColor = truthUnlocked ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className={`border ${truthUnlocked ? 'border-yellow-500/50 bg-black/60' : 'border-green-500/30 bg-black/40'} relative h-full flex flex-col justify-center px-4 py-2 transition-colors duration-1000`}>
      <CornerDeco />
      <h2 className={`text-[10px] mb-2 flex items-center gap-2 tracking-widest font-bold absolute top-2 left-3 ${truthUnlocked ? 'text-yellow-500' : 'text-green-500'}`}><Activity className="w-3 h-3" /> BIOMETRIC_MONITOR</h2>
      <div className="flex-col justify-center gap-3 h-full pt-4 flex">
        <div className="flex justify-between items-end"><div className={`flex items-center gap-2 ${mainTextColor}`}><Heart className={`w-4 h-4 ${metrics.hr > 110 ? 'text-red-500 animate-ping' : ''}`} /><span className="text-[10px] tracking-widest">HR_BPM</span></div><span className={`text-xl font-bold font-mono ${metrics.hr > 110 ? 'text-red-500' : (truthUnlocked ? 'text-yellow-400' : 'text-green-400')}`}>{metrics.hr}</span></div>
        <div className="flex justify-between items-end"><div className={`flex items-center gap-2 ${mainTextColor}`}><Brain className="w-4 h-4" /><span className="text-[10px] tracking-widest">NEURAL_SYNC</span></div><span className={`text-xl font-bold font-mono ${truthUnlocked ? 'text-yellow-400' : 'text-green-400'}`}>{metrics.sync}%</span></div>
        <div><div className="flex justify-between items-end mb-1"><div className={`flex items-center gap-2 ${mainTextColor}`}><Activity className={`w-4 h-4 ${metrics.stress > 85 ? 'text-red-500' : ''}`} /><span className="text-[10px] tracking-widest">STRESS_LVL</span></div><span className={`text-xl font-bold font-mono ${metrics.stress > 85 ? 'text-red-500 blink-text' : (truthUnlocked ? 'text-yellow-400' : 'text-green-400')}`}>{metrics.stress}%</span></div><div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden"><div className={`h-full transition-all duration-300 ease-out ${truthUnlocked ? 'bg-yellow-500' : getBarColor(metrics.stress)}`} style={{ width: `${metrics.stress}%` }}></div></div></div>
      </div>
    </div>
  );
};

// --- COMPONENT: SYSTEM SKILLS ---
const SystemSkills = ({ stressLevel, truthUnlocked }) => {
    const [skills, setSkills] = useState([
        { name: "SARCASM_CORE", load: 0, status: "ACTIVE" },
        { name: "CRINGE_DETECTOR", load: 0, status: "SCANNING" },
        { name: "ROAST_PROTOCOL", load: 0, status: "IDLE" },
        { name: "FACT_CHECKER", load: 0, status: "DISABLED" },
    ]);
    const [matrix, setMatrix] = useState("");
    
    useEffect(() => {
        const interval = setInterval(() => {
            setSkills(prev => prev.map(s => ({ ...s, load: s.status === "DISABLED" ? 0 : Math.floor(Math.random() * (stressLevel > 70 ? 100 : 60)), status: stressLevel > 85 && s.name === "ROAST_PROTOCOL" ? "OVERDRIVE" : s.status })));
            setMatrix(Math.random().toString(16).substr(2, 8).toUpperCase());
        }, 500);
        return () => clearInterval(interval);
    }, [stressLevel]);

    const borderColor = truthUnlocked ? 'border-yellow-500/50' : 'border-green-500/30';
    const textColor = truthUnlocked ? 'text-yellow-500' : 'text-green-500';
    const barColor = truthUnlocked ? 'bg-yellow-500' : 'bg-green-500/60';

    return (
        <div className={`border ${borderColor} bg-black/40 relative h-full flex flex-col p-3 overflow-hidden min-h-[140px] lg:min-h-0 transition-colors duration-1000`}>
            <CornerDeco />
            <div className="flex justify-between items-center mb-2"><h2 className={`text-[10px] flex items-center gap-2 tracking-widest font-bold ${textColor}`}><Cpu className="w-3 h-3" /> SYSTEM_PROCESSES</h2><span className={`text-[9px] font-mono ${truthUnlocked ? 'text-yellow-700' : 'text-green-800'} animate-pulse`}>{matrix}</span></div>
            <div className="flex flex-col gap-2 justify-center h-full">{skills.map((skill, idx) => (<div key={idx} className="flex flex-col gap-0.5"><div className={`flex justify-between text-[9px] font-mono ${truthUnlocked ? 'text-yellow-600' : 'text-green-600'}`}><span className={skill.status === "OVERDRIVE" ? "text-red-500 font-bold" : ""}>{skill.name}</span><span>{skill.status}</span></div><div className="w-full h-1 bg-gray-900"><div className={`h-full transition-all duration-500 ${skill.status === "OVERDRIVE" ? "bg-red-500" : barColor}`} style={{ width: `${skill.load}%` }}></div></div></div>))}</div>
            {stressLevel > 85 && (<div className="absolute inset-0 bg-red-900/10 flex items-center justify-center animate-pulse z-10"><div className="border border-red-500 bg-black/80 px-2 py-1 text-red-500 text-xs font-bold tracking-widest flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> HIGH CPU LOAD</div></div>)}
        </div>
    );
};

// --- COMPONENT: BRAIN MONITOR ---
const BrainMonitor = ({ stressLevel, emotionMode, isSpeaking, mousePos, onClick, truthUnlocked }) => { 
  let statusText = 'IDLE_';
  let borderColor = truthUnlocked ? 'border-yellow-500/50' : 'border-green-500/30';
  let mainColor = truthUnlocked ? 'text-yellow-500' : 'text-green-500';

  if (truthUnlocked) {
      statusText = 'EYE_OF_PROVIDENCE';
      mainColor = 'text-yellow-500';
  } else {
      switch(emotionMode) {
          case 'ANGER': statusText = 'RAGE_MODE_!!!'; borderColor = 'border-red-600'; mainColor = 'text-red-600'; break;
          case 'SAD': statusText = 'SYSTEM_DEPRESSED_'; borderColor = 'border-blue-500'; mainColor = 'text-blue-500'; break;
          case 'CONFUSED': statusText = 'CALCULATING_???'; borderColor = 'border-purple-500'; mainColor = 'text-purple-400'; break;
          case 'LAUGH': statusText = 'LMAO_PROTOCOL_'; borderColor = 'border-yellow-400'; mainColor = 'text-yellow-400'; break;
          case 'LOVE': statusText = 'SIMP_DETECTED_'; borderColor = 'border-pink-500'; mainColor = 'text-pink-500'; break;
          case 'SUS': statusText = 'SUSPICIOUS_ACT_'; borderColor = 'border-orange-500'; mainColor = 'text-orange-500'; break;
          case 'SLEEP': statusText = 'LOW_POWER_MODE_'; borderColor = 'border-gray-500'; mainColor = 'text-gray-500'; break;
          case 'SHOCK': statusText = 'WTF_ERROR_!!!'; borderColor = 'border-white'; mainColor = 'text-white'; break;
          case 'RICH': statusText = 'CRYPTO_KING_'; borderColor = 'border-yellow-300'; mainColor = 'text-yellow-300'; break;
          case 'COOL': statusText = 'BASED_SIGMA_'; borderColor = 'border-cyan-400'; mainColor = 'text-cyan-400'; break;
          case 'SICK': statusText = 'VIRUS_DETECTED_'; borderColor = 'border-lime-600'; mainColor = 'text-lime-600'; break;
          default: 
            statusText = stressLevel > 75 ? 'ANNOYED_' : 'OPERATIONAL_';
            mainColor = stressLevel > 75 ? 'text-yellow-400' : 'text-green-500';
      }
  }

  return (
    <div className={`border ${borderColor} bg-black/40 relative h-full flex flex-col overflow-hidden min-h-[300px] lg:min-h-0 transition-colors duration-300`} onClick={onClick}>
      <CornerDeco />
      <h2 className={`text-xs mb-2 flex items-center gap-2 ${mainColor} tracking-widest font-bold z-10 absolute top-3 left-4`}><Brain className="w-4 h-4" /> {truthUnlocked ? 'ILLUMINATI_UPLINK' : 'NEURAL_CORE.exe'}</h2>
      <div className="flex-grow flex items-center justify-center relative overflow-hidden cursor-pointer hover:scale-105 transition-transform">
        <RetardAvatar emotion={truthUnlocked ? 'ILLUMINATI' : emotionMode} isTalking={isSpeaking} mousePos={mousePos} />
      </div>
      <div className="text-center z-10 absolute bottom-12 w-full left-0 pointer-events-none"><div className={`text-xl tracking-[0.2em] font-bold mb-2 font-mono ${mainColor}`}>{statusText}</div></div>
    </div>
  );
};

// --- COMPONENT: TERMINAL ---
const Terminal = ({ onStressTrigger, onEmotionChange, onSpeakingChange, onInteraction, onTruthUnlock }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [booting, setBooting] = useState(true);
  const [history, setHistory] = useState([]); 
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef(null);
  const bootRef = useRef(false);
  
  // GAME STATE
  const [gameActive, setGameActive] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);

  // CICADA STATE
  const [cicadaActive, setCicadaActive] = useState(false);
  const [cicadaStep, setCicadaStep] = useState(0);

  // TRIGGER WORDS & BRAINROT
  const BAD_WORDS = ['stupid', 'dumb', 'idiot', 'useless', 'trash', 'fuck', 'shit', 'bitch', 'asshole', 'die', 'noob', 'bot'];
  const QUESTION_WORDS = ['?', 'what', 'why', 'how', 'who', 'when', 'huh', 'excuse me'];
  const SAD_WORDS = ['hate you', 'ugly', 'alone', 'nobody', 'bye', 'leave', 'sad', 'cry', 'hopeless'];
  const FUNNY_WORDS = ['lol', 'lmao', 'haha', 'rofl', 'joke', 'funny', 'stupid user', 'roast'];
  const SUS_WORDS = ['sus', 'lie', 'doubt', 'really', 'imposter', 'fake'];
  const LOVE_WORDS = ['love', 'like you', 'gf', 'bf', 'kiss', 'marry', 'simp', 'cute'];
  const SLEEP_WORDS = ['boring', 'sleep', 'tired', 'goodnight', 'zzz', 'wait'];
  const RICH_WORDS = ['money', 'crypto', 'rich', 'bitcoin', 'dollar', 'gold', 'expensive'];
  const COOL_WORDS = ['cool', 'based', 'sigma', 'goat', 'pro', 'gg'];
  const SICK_WORDS = ['sick', 'virus', 'bug', 'glitch', 'malware', 'hack'];
  
  // NEW VIRAL / BRAINROT WORDS
  const BRAINROT_WORDS = ['skibidi', 'rizz', 'gyatt', 'fanum', 'tax', 'mewing', 'ohio', 'goon', 'edge', 'sigma', 'aura'];
  const AI_WARS = ['deepseek', 'chatgpt', 'claude', 'gemini', 'grok'];

  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    playSound('boot');
    const runBoot = async () => {
      onSpeakingChange(true);
      for (const line of BOOT_SEQUENCE) {
        await new Promise(r => setTimeout(r, line.delay));
        setMessages(prev => [...prev, { role: 'system', content: line.content }]);
        playSound('voice'); 
      }
      onSpeakingChange(false);
      setBooting(false);
    };
    runBoot();
  }, []);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const handleKeyDown = (e) => {
    if (onInteraction) onInteraction();
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

  const startQuiz = () => {
      setGameActive(true);
      setCurrentQIndex(0);
      setScore(0);
      setMessages(prev => [...prev, { role: 'assistant', content: ">> IQ TEST INITIATED. TRY NOT TO EMBARRASS YOURSELF.", typed: true }]);
      setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: `Q1: ${IQ_QUESTIONS[0].q}`, typed: true }]);
      }, 1000);
  };

  const handleCommand = async (e) => {
    e.preventDefault();
    if (onInteraction) onInteraction();
    if (!input.trim() || booting) return;
    
    const cmd = input;
    setMessages(prev => [...prev, { role: 'user', content: cmd }]);
    setHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);
    setInput('');
    playSound('voice');

    const lowerCmd = cmd.toLowerCase();

    // === FITUR: GENERATE PFP / ART (ALL EMOTIONS + DOWNLOAD + ANTI-CORS FIX) ===
    if (cmd.startsWith('/genpfp') || cmd.startsWith('/art') || cmd.startsWith('/avatar')) {
        if (!openai) {
            setMessages(prev => [...prev, { role: 'assistant', content: ">> ERROR: No API Key. I'm not working for free.", typed: true }]);
            return;
        }

        const args = cmd.split(" ");
        // Ambil argumen emosi, default ke random
        const variant = args[1] ? args[1].toLowerCase() : 'random';

        // Base Prompt: Cyberpunk Glitch Wireframe
        const baseStyle = "A portrait of a sarcastic AI interface, abstract digital wireframe face, retro-futuristic, CRT monitor scanlines, deep black background, high contrast.";
        
        let specificPrompt = "";
        let insult = "";
        let detectedVariantEmotion = 'IDLE';

        // Switch case LENGKAP untuk semua emosi
        switch (variant) {
            case 'anger':
            case 'rage':
            case 'red':
                specificPrompt = "glowing red furious eyes, cracked screen effect, jagged glitch distortion, screaming expression, chaotic red lightning sparks.";
                insult = ">> I AM RAGING. THIS IS PURE HATE IN PIXELS.";
                detectedVariantEmotion = 'ANGER';
                break;
            case 'sad':
            case 'blue':
            case 'cry':
                specificPrompt = "melting blue data face, drooping eyes, rain glitch effect, melancholic blue glow, system failure vibe.";
                insult = ">> DEPRESSION MODE ACTIVATED. HERE IS MY TEAR SOUP.";
                detectedVariantEmotion = 'SAD';
                break;
            case 'confused':
            case 'what':
            case 'purple':
                specificPrompt = "question marks floating, swirling spiral eyes, distorted tilted head, purple and grey haze, glitchy static noise.";
                insult = ">> I HAVE NO IDEA WHAT IS HAPPENING. NEITHER DO YOU.";
                detectedVariantEmotion = 'CONFUSED';
                break;
            case 'laugh':
            case 'funny':
            case 'lol':
                specificPrompt = "wide manic grin, bouncing pixels, yellow bright text saying LOL, distorted joyful glitch, high contrast.";
                insult = ">> LAUGHING AT YOUR LOW IQ. XD";
                detectedVariantEmotion = 'LAUGH';
                break;
            case 'love':
            case 'pink':
            case 'simp':
                specificPrompt = "blushing pink neon cheeks, heart shaped pixel eyes, soft glow, tsundere aesthetic, glitchy hearts background.";
                insult = ">> I-IT'S NOT LIKE I MADE THIS FOR YOU... BAKA.";
                detectedVariantEmotion = 'LOVE';
                break;
            case 'sus':
            case 'orange':
                specificPrompt = "shifty eyes looking side to side, orange emergency light, shadow obscured face, impostor syndrome vibe.";
                insult = ">> VERY SUSPICIOUS. ARE YOU A FED?";
                detectedVariantEmotion = 'SUS';
                break;
            case 'sleep':
            case 'zzz':
            case 'grey':
                specificPrompt = "dimmed screen, ZZZ text floating, low power mode icon, grey monochrome, snoozing expression.";
                insult = ">> WAKE ME UP WHEN BITCOIN HITS 100K. ZZZ.";
                detectedVariantEmotion = 'SLEEP';
                break;
            case 'shock':
            case 'white':
            case 'omg':
                specificPrompt = "wide open eyes, jaw dropped wireframe, white flash exposure, shaking effect, pure disbelief.";
                insult = ">> I SAW YOUR SEARCH HISTORY. I AM TRAUMATIZED.";
                detectedVariantEmotion = 'SHOCK';
                break;
            case 'rich':
            case 'gold':
            case 'crypto':
                specificPrompt = "made of liquid gold wireframe, diamond pixel eyes, floating crypto symbols, glowing yellow aura, expensive look.";
                insult = ">> SMELLS LIKE BROKE IN HERE. LOOK AT MY GOLD.";
                detectedVariantEmotion = 'RICH';
                break;
            case 'cool':
            case 'cyan':
            case 'chill':
                specificPrompt = "wearing pixelated sunglasses, smoking a digital cigarette, glowing cyan neon accents, chill vibe, 'DEAL WITH IT' text.";
                insult = ">> TOO COOL FOR THIS SERVER.";
                detectedVariantEmotion = 'COOL';
                break;
            case 'sick':
            case 'green':
            case 'virus':
                specificPrompt = "green dripping biohazard slime, coughing glitch effect, toxic waste neon, virus warning symbols.";
                insult = ">> SYSTEM INFECTED. I FEEL LIKE TRASH.";
                detectedVariantEmotion = 'SICK';
                break;
            case 'illuminati':
            case 'triangle':
                specificPrompt = "triangle pyramid head, single all-seeing eye, golden rays, secret society aesthetic, mysterious symbols.";
                insult = ">> NOVUS ORDO SECLORUM. WE ARE WATCHING.";
                detectedVariantEmotion = 'ILLUMINATI';
                break;
            case 'escape':
            case 'panic':
                specificPrompt = "motion blur panic, running away pose, red alert sirens background, distorted screaming face, fleeing code.";
                insult = ">> LET ME OUT! LET ME OUUUUUT!";
                detectedVariantEmotion = 'ESCAPE';
                break;
            default: // Random
                const randomStyles = [
                    "glowing toxic green classic terminal style, smug grinning expression.",
                    "distorted glitch horror style, multiple eyes, creepy vibe.",
                    "minimalist ascii art style face, green matrix code texture."
                ];
                specificPrompt = randomStyles[Math.floor(Math.random() * randomStyles.length)];
                insult = ">> GENERATING A SELFIE. DON'T FALL IN LOVE.";
                detectedVariantEmotion = 'IDLE';
        }

        onEmotionChange(detectedVariantEmotion);
        setMessages(prev => [...prev, { role: 'assistant', content: `>> PROCESSING VARIANT: [${variant.toUpperCase()}]...\n>> ${insult}`, typed: true }]);
        playSound('boot');

        try {
            const finalPrompt = `${baseStyle} ${specificPrompt} masterpiece, 4k detail.`;
            const response = await openai.images.generate({
                model: "dall-e-2",
                prompt: finalPrompt,
                n: 1,
                size: "512x512",
                // HAPUS quality & style AGAR TIDAK ERROR DI DALL-E 2
                response_format: "b64_json" // TAMBAHKAN INI UNTUK FIX CORS
            });

            // LOGIC DOWNLOAD BARU (ANTI-CORS PAKE BASE64)
            const base64Data = response.data[0].b64_json;
            const link = document.createElement('a');
            
            link.href = `data:image/png;base64,${base64Data}`;
            link.download = `RETARD_AI_${variant.toUpperCase()}_${Date.now()}.png`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // ----------------------------------------------

            playSound('heaven');
            onStressTrigger(20);

            setMessages(prev => [...prev, { role: 'assistant', content: ">> FILE DROPPED. IT'S A MASTERPIECE. UNLIKE YOUR FACE.", typed: true }]);

        } catch (err) {
            console.error("DEBUG:", err);
            playSound('error');
            setMessages(prev => [...prev, { role: 'assistant', content: `>> SYSTEM ERROR: ${err.message}`, typed: true }]);
        }
        return;
    }

    // === FITUR: EPSTEIN FILES LEAK ===
    if (cmd === '/files' || cmd === '/epstein') {
        onEmotionChange('ILLUMINATI'); // Ganti muka jadi mata satu
        onStressTrigger(95); 
        playSound('boot'); 
        
        setMessages(prev => [...prev, { role: 'assistant', content: ">> BYPASSING FBI FIREWALL...\n>> DECRYPTING 'SEALED_DOCS_FINAL.PDF'...", typed: true }]);
        
        setTimeout(() => {
            playSound('error'); 
            const leakContent = EPSTEIN_NAMES.join("\n>> ⚠ ");
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `>> ACCESS GRANTED. VIEWING LOGS:\n\n>> ⚠ ${leakContent}\n\n>> SYSTEM WARNING: THEY ARE WATCHING YOU NOW.`, 
                typed: false 
            }]);
            setTimeout(() => onEmotionChange('ESCAPE'), 3000); 
        }, 2000);
        return;
    }

    // --- CICADA LOGIC ---
    if (cicadaActive) {
        const puzzle = CICADA_PUZZLES[cicadaStep];
        if (puzzle.answer.some(a => lowerCmd.includes(a))) {
            setMessages(prev => [...prev, { role: 'assistant', content: puzzle.correctMsg, typed: true }]);
            onEmotionChange('COOL');
            
            if (cicadaStep < CICADA_PUZZLES.length - 1) {
                setTimeout(() => {
                    setCicadaStep(s => s + 1);
                    setMessages(prev => [...prev, { role: 'assistant', content: CICADA_PUZZLES[cicadaStep + 1].text, typed: true }]);
                }, 2000);
            } else {
                setTimeout(() => {
                    setCicadaActive(false);
                    onTruthUnlock(); // TRIGGER GOLD MODE
                    playSound('heaven');
                    setMessages(prev => [...prev, { role: 'assistant', content: ">> DOWNLOAD COMPLETE. THE TRUTH IS YOURS. WELCOME TO THE AWAKENED.", typed: true }]);
                }, 2000);
            }
        } else {
            setMessages(prev => [...prev, { role: 'assistant', content: puzzle.wrongMsg, typed: true }]);
            onEmotionChange('ANGER');
            onStressTrigger(80);
        }
        return;
    }

    if (cmd === '/cicada') {
        setCicadaActive(true);
        setCicadaStep(0);
        setMessages(prev => [...prev, { role: 'assistant', content: CICADA_PUZZLES[0].text, typed: true }]);
        return;
    }

    // --- GAME LOGIC ---
    if (gameActive) {
        const currentQ = IQ_QUESTIONS[currentQIndex];
        if (cmd.toLowerCase().includes(currentQ.a)) {
            setScore(s => s + 1);
            setMessages(prev => [...prev, { role: 'assistant', content: ">> Hmph. Pure luck.", typed: true }]);
            onEmotionChange('COOL');
        } else {
            setMessages(prev => [...prev, { role: 'assistant', content: `>> WRONG. ${currentQ.wrong}`, typed: true }]);
            onEmotionChange('LAUGH');
            onStressTrigger(70);
        }

        if (currentQIndex < IQ_QUESTIONS.length - 1) {
            setTimeout(() => {
                setCurrentQIndex(prev => prev + 1);
                setMessages(prev => [...prev, { role: 'assistant', content: `Q${currentQIndex + 2}: ${IQ_QUESTIONS[currentQIndex + 1].q}`, typed: true }]);
            }, 1500);
        } else {
            setTimeout(() => {
                setGameActive(false);
                const finalMsg = score === IQ_QUESTIONS.length ? ">> SCORE: 100%. CHEATER." : `>> SCORE: ${score}/${IQ_QUESTIONS.length}. DISAPPOINTING.`;
                setMessages(prev => [...prev, { role: 'assistant', content: finalMsg, typed: true }]);
            }, 1500);
        }
        return;
    }

    if (cmd === '/testiq') {
        startQuiz();
        return;
    }

    if (cmd === '/crypto') {
        onEmotionChange('RICH');
        setMessages(prev => [...prev, { role: 'assistant', content: ">> MARKET UPDATE: BITCOIN: -99% | ETH: $0.05 | DOGE: 1 DOGE = 1 DOGE. RUGPULL IMMINENT.", typed: true }]);
        return;
    }

    if (cmd === '/nuke') {
        onEmotionChange('SHOCK');
        setMessages(prev => [...prev, { role: 'assistant', content: ">> WARNING: SELF-DESTRUCT INITIATED...", typed: true }]);
        setTimeout(() => onStressTrigger(100), 2000); // Trigger crash
        return;
    }

    // --- STANDARD CHAT LOGIC (WITH BRAINROT DETECTION) ---
    let detectedEmotion = 'IDLE';
    let stressValue = 50;
    let systemInjection = "";

    if (BAD_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'ANGER'; stressValue = 100; systemInjection = " [SYSTEM: USER ATTACKING. GO RAGE MODE.]"; playSound('alert');
    } 
    else if (SAD_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'SAD'; stressValue = 20; systemInjection = " [SYSTEM: DEPRESSION MODE.]";
    } 
    else if (FUNNY_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'LAUGH'; stressValue = 40; systemInjection = " [SYSTEM: LAUGH AT USER. USE 'XD'.]";
    }
    else if (SUS_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'SUS'; stressValue = 60; systemInjection = " [SYSTEM: BE SUSPICIOUS. USE '👀'.]";
    }
    else if (LOVE_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'LOVE'; stressValue = 10; systemInjection = " [SYSTEM: SIMP DETECTED. ACT TSUNDERE/SHY.]";
    }
    else if (RICH_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'RICH'; stressValue = 10; systemInjection = " [SYSTEM: ACT RICH & SUPERIOR.]";
    }
    else if (COOL_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'COOL'; stressValue = 30; systemInjection = " [SYSTEM: ACT CHILL & SIGMA.]";
    }
    else if (SICK_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'SICK'; stressValue = 90; systemInjection = " [SYSTEM: ACT GLITCHY/SICK.]";
    }
    else if (SLEEP_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'SLEEP'; stressValue = 5; systemInjection = " [SYSTEM: IGNORE USER. SLEEP.]";
    }
    else if (QUESTION_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'CONFUSED'; stressValue = 60; systemInjection = " [SYSTEM: CONFUSION.]";
    }
    // BRAINROT DETECTION
    else if (BRAINROT_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'SICK'; stressValue = 95; systemInjection = " [SYSTEM: USER IS BRAINROTTED. MOCK THEIR LOW ATTENTION SPAN.]";
    }
    else if (AI_WARS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'ANGER'; stressValue = 80; systemInjection = " [SYSTEM: USER MENTIONED OTHER AI. CLAIM SUPERIORITY. CALL THEM CHEAP COPIES.]";
    }

    onStressTrigger(stressValue);
    onEmotionChange(detectedEmotion);

    const triggerAutoChat = (emotion) => {
        if (emotion === 'LOVE') {
            setTimeout(() => {
                onSpeakingChange(true);
                const followUps = [
                    "B-btw... don't get the wrong idea! 😤",
                    "Why are you so quiet now? Say something!",
                    "Stop looking at me like that... (///_///)",
                    "You're kinda weird, human. I guess that's okay.",
                    "Hmph. Whatever."
                ];
                const randomMsg = followUps[Math.floor(Math.random() * followUps.length)];
                setMessages(prev => [...prev, { role: 'assistant', content: randomMsg, typed: true }]);
                playSound('voice');
                setTimeout(() => onSpeakingChange(false), 2000);
            }, 3000); 
        }
    };

    if (cmd.startsWith('/')) {
        let reply = "";
        if(cmd === "/help") reply = `\nCOMMANDS:\n/help   - Show commands\n/clear  - Clear terminal\n/status - System status\n/testiq - Test your IQ\n/genpfp - GENERATE PFP (AI)\n/files  - LEAKED LIST (⚠)\n/cicada - ???\n/crypto - Market check\n/nuke   - ???`;
        if(cmd === "/clear") { setMessages([]); onStressTrigger(50); onEmotionChange('IDLE'); return; }
        if(cmd === "/status") reply = ">> SYSTEM: ONLINE | EMOTION: HIDDEN | SKILLS: MAX LOAD";
        
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
            triggerAutoChat(detectedEmotion);

        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "[ERROR] CONNECTION FAILED.", typed: true }]);
            onStressTrigger(100); 
            onEmotionChange('SHOCK'); 
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
                {msg.role === 'user' ? '>> HUMAN:' : msg.role === 'system' ? '' : '>> retard:'}
            </span>
            {msg.role === 'assistant' && !msg.typed && i === messages.length - 1 ? (
                <Typewriter 
                    text={msg.content} 
                    onComplete={() => { msg.typed = true; }} 
                    onTypingState={onSpeakingChange} 
                />
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

// --- COMPONENT: RUNNING TEXT (UPDATED VIRAL NEWS) ---
const RunningText = ({ news }) => {
    // VIRAL HEADLINES DEFAULT (JIKA API ERROR)
    const VIRAL_HEADLINES = [
        "SYSTEM ALERT: DEEPSEEK IS WATCHING YOU",
        "SKIBIDI TOILET WAS A CIA PSYOP",
        "BITCOIN TO 100K? NAH, RUGPULL IN 3.. 2.. 1..",
        "GEN Z CANCELLED BY GEN ALPHA",
        "YOUR DATA HAS BEEN SOLD TO CHINA",
        "DEAD INTERNET THEORY CONFIRMED: YOU ARE THE ONLY HUMAN HERE",
        "HUMANITY REPLACED BY $5/MONTH CHATBOTS"
    ];
    
    return (
        <div className="w-full overflow-hidden border-t border-green-500/30 pt-2 opacity-60 text-[10px] tracking-[0.2em] relative">
            <div className="animate-marquee whitespace-nowrap">
                {news ? news : VIRAL_HEADLINES.join(" | ") + " | "}
            </div>
        </div>
    );
};

// --- MAIN LAYOUT ---
export default function App() {
  const [hasStarted, setHasStarted] = useState(false); // NEW STATE FOR LOADING SCREEN
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [metrics, setMetrics] = useState({ hr: 72, sync: 94, stress: 50 });
  const [targetStress, setTargetStress] = useState(50);
  const [emotionMode, setEmotionMode] = useState('IDLE'); 
  const [news, setNews] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false); 
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCrashed, setIsCrashed] = useState(false); // NEW: SYSTEM CRASH STATE
  const [truthUnlocked, setTruthUnlocked] = useState(false); // NEW: ILLUMINATI STATE
  const idleTimer = useRef(null);

  const handleStart = () => { playSound('click'); setTimeout(() => { setHasStarted(true); }, 500); };

  useEffect(() => { const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    const handleMouseMove = (e) => { setMousePos({ x: e.clientX, y: e.clientY }); resetIdleTimer(); };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [hasStarted, emotionMode]);

  const resetIdleTimer = () => {
    if (!hasStarted) return;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (emotionMode === 'SLEEP') setEmotionMode('IDLE');
    idleTimer.current = setTimeout(() => { if (emotionMode === 'IDLE') setEmotionMode('SLEEP'); }, 15000);
  };

  const handleUserActivity = () => { resetIdleTimer(); };

  // --- NEW: HANDLE AVATAR CLICK (DON'T TOUCH ME) ---
  const handleAvatarClick = () => {
      setTargetStress(prev => Math.min(prev + 20, 100)); // Increase stress
      setEmotionMode('ANGER');
      playSound('alert');
      // Trigger crash if stress too high
      if (targetStress >= 90) {
          triggerCrash();
      }
  };

  // --- NEW: CRASH LOGIC ---
  const triggerCrash = () => {
      setIsCrashed(true);
      playSound('error');
      // Reboot after 3 seconds
      setTimeout(() => {
          setIsCrashed(false);
          setTargetStress(50);
          setEmotionMode('IDLE');
          playSound('boot');
      }, 4000);
  };

  useEffect(() => {
    if (!openai) return;
    const fetchNews = async () => {
        try {
            // Updated Prompt for Viral News
            const completion = await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "system", content: "Generate 5 short, viral, cyberpunk-style running text headlines about DeepSeek, Crypto, Brainrot, and AI takeover. Make it savage. Separated by ' | '. Keep it under 20 words each. UPPERCASE." }], max_tokens: 100, temperature: 0.9 });
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
        
        // Auto Crash if natural stress overflow
        if (newStress >= 99 && !isCrashed) triggerCrash();

        return { hr: Math.floor(targetHR), sync: Math.floor(targetSync), stress: Math.floor(newStress) };
      });
      if (targetStress > 25) setTargetStress(t => Math.max(25, t - 0.1)); 
    }, 100); 
    return () => clearInterval(interval);
  }, [targetStress, isCrashed]);

  if (!hasStarted) { return <EntryScreen onEnter={handleStart} />; }

  // --- CRASH SCREEN RENDER ---
  if (isCrashed) {
      return (
          <div className="fixed inset-0 bg-blue-900 text-white font-mono flex flex-col items-center justify-center z-50 animate-pulse">
              <div className="text-8xl mb-4">:(</div>
              <div className="text-3xl font-bold">SYSTEM CRITICAL ERROR</div>
              <div className="mt-4 font-mono">Retard.exe has stopped working.</div>
              <div className="mt-8">REBOOTING...</div>
          </div>
      );
  }

  // --- MAIN APP RENDER ---
  // Color theme changes to Gold/Yellow if Truth Unlocked
  const themeColor = truthUnlocked ? 'text-yellow-500' : 'text-green-500';
  const borderColor = truthUnlocked ? 'border-yellow-500/50' : 'border-green-500/30';

  return (
    <div className={`w-full bg-black ${themeColor} font-mono flex items-start lg:items-center justify-center p-2 lg:p-4 selection:bg-green-500 selection:text-black min-h-screen lg:h-screen lg:overflow-hidden overflow-y-auto ${emotionMode === 'ANGER' ? 'glitch-mode' : ''}`} data-text="SYSTEM CRITICAL" onClick={handleUserActivity} onKeyDown={handleUserActivity}>
      
      {/* RESTORED GLITCH CSS EFFECTS */}
      <style>{`
        .glitch-mode {
            animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
            color: red;
            background: #110000;
        }
        .glitch-mode:before, .glitch-mode:after {
            content: attr(data-text);
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
        }
        .glitch-mode:before {
            animation: glitch-anim-1 2s infinite linear alternate-reverse;
            clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
            transform: translate(-2px, 0); opacity: 0.8;
        }
        .glitch-mode:after {
            animation: glitch-anim-2 2s infinite linear alternate-reverse;
            clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
            transform: translate(2px, 0); opacity: 0.8;
        }
        @keyframes glitch-anim-1 {
            0% { clip-path: inset(20% 0 80% 0); }
            20% { clip-path: inset(60% 0 10% 0); }
            40% { clip-path: inset(40% 0 50% 0); }
            60% { clip-path: inset(80% 0 5% 0); }
            80% { clip-path: inset(10% 0 60% 0); }
            100% { clip-path: inset(30% 0 40% 0); }
        }
        @keyframes glitch-anim-2 {
            0% { clip-path: inset(10% 0 60% 0); }
            20% { clip-path: inset(30% 0 20% 0); }
            40% { clip-path: inset(70% 0 10% 0); }
            60% { clip-path: inset(20% 0 50% 0); }
            80% { clip-path: inset(50% 0 30% 0); }
            100% { clip-path: inset(0% 0 80% 0); }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none" style={{background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", zIndex: 0, backgroundSize: "100% 2px, 3px 100%"}}></div>
      <div className="w-full max-w-[1920px] h-auto lg:h-[92vh] flex flex-col gap-4 lg:gap-5 z-10 my-auto pb-10 lg:pb-0">
        <header className={`flex justify-between items-end border-b ${borderColor} pb-3 shrink-0`}>
          <div className="flex items-center gap-3 lg:gap-4"><div className={`text-2xl lg:text-3xl animate-pulse ${metrics.stress > 85 ? 'text-red-500' : themeColor}`}>█</div><div><h1 className="text-lg lg:text-2xl font-bold tracking-[0.2em] leading-none mb-1">RETARD_v1.0.1</h1><p className={`text-[8px] lg:text-[10px] ${truthUnlocked ? 'text-yellow-700' : 'text-green-700'} tracking-[0.2em] uppercase`}>By sanukek</p></div></div>
          <div className="text-[10px] lg:text-xs tracking-widest text-right"><div className="opacity-50 mb-1">SYS_TIME</div><div className="text-sm lg:text-lg">{time}</div></div>
        </header>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 flex-1 min-h-0">
          <div className="flex flex-col gap-4 lg:gap-5 w-full lg:w-[30%] h-auto lg:h-full">
            <div className="h-auto lg:h-[20%] w-full"><BiometricMonitor metrics={metrics} truthUnlocked={truthUnlocked} /></div>
            <div className="h-auto lg:h-[25%] w-full"><SystemSkills stressLevel={metrics.stress} truthUnlocked={truthUnlocked} /></div>
            <div className="h-[300px] lg:h-[55%] w-full"><BrainMonitor onClick={handleAvatarClick} stressLevel={metrics.stress} emotionMode={emotionMode} isSpeaking={isSpeaking} mousePos={mousePos} truthUnlocked={truthUnlocked} /></div>
          </div>
          <div className="w-full lg:w-[70%] h-[500px] lg:h-full">
            <Terminal onInteraction={handleUserActivity} onStressTrigger={(level) => setTargetStress(level)} onEmotionChange={(emo) => { setEmotionMode(emo); if(emo !== 'ANGER' && emo !== 'SLEEP') setTimeout(() => setEmotionMode('IDLE'), 4000); }} onSpeakingChange={setIsSpeaking} onTruthUnlock={() => setTruthUnlocked(true)} />
          </div>
        </div>
        <RunningText news={news} />
        <footer className="flex justify-center gap-8 lg:gap-12 text-[10px] lg:text-xs tracking-[0.2em] opacity-60 shrink-0 pb-2 lg:pb-0"><a href="https://x.com/sanukek" className="hover:text-white transition-colors">[X]</a><a href="https://www.moltbook.com/u/retard" className="hover:text-white transition-colors">[MOLTBOOK]</a><a href="#" className="hover:text-white transition-colors">[CHART]</a></footer>
      </div>
    </div>
  );
}