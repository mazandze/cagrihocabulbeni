import { useState, useEffect, useRef } from "react";
import { Play, Check, X, RotateCcw, Trophy, ChevronRight, Ban, Bot, Shuffle, Lightbulb, Flame, Award } from "lucide-react";

const PITCH = "#0B2E23";
const PITCH_LIGHT = "#123B2C";
const CHALK = "#F4F1E8";
const FLOOD = "#F5C518";
const RED = "#D64541";
const GREEN = "#3F8F5F";

const STATS_KEY = "cagriHocamBulBeni_stats_v1";
const DEFAULT_STATS = { bestScore: 0, bestStreak: 0, totalCorrect: 0, totalRounds: 0 };

const TEAM_POOL = [
  "Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor",
  "Real Madrid", "Barcelona",
  "Manchester United", "Manchester City", "Liverpool", "Chelsea", "Arsenal", "Tottenham",
  "Juventus", "AC Milan", "Inter Milan", "Napoli", "Roma",
  "Bayern Münih", "Borussia Dortmund",
  "Paris Saint-Germain",
  "Ajax",
  "Porto",
];

const PLAYER_DB = {
  "Real Madrid": ["Cristiano Ronaldo", "David Beckham", "Zinedine Zidane", "Luka Modric", "Karim Benzema", "Toni Kroos", "Gareth Bale", "Ronaldo Nazario", "Xabi Alonso", "Fabio Cannavaro", "Angel Di Maria", "James Rodriguez", "Alvaro Morata", "Luis Figo", "Kaka", "Robinho", "Sami Khedira", "Pepe", "Gonzalo Higuain", "Mesut Ozil", "Wesley Sneijder", "Michael Essien", "Arjen Robben", "Eden Hazard", "Roberto Carlos", "Antonio Rudiger", "Jude Bellingham", "Achraf Hakimi", "Emmanuel Adebayor"],
  Barcelona: ["Lionel Messi", "Neymar", "Luis Suarez", "Ronaldinho", "Samuel Eto'o", "Zlatan Ibrahimovic", "Thierry Henry", "Philippe Coutinho", "Antoine Griezmann", "Ronaldo Nazario", "Luis Figo", "Arturo Vidal", "Miralem Pjanic", "Frenkie de Jong", "Deco", "Thiago Alcantara", "Robert Lewandowski", "Ousmane Dembele", "Alexis Sanchez", "Sergio Aguero", "Yaya Toure", "Arda Turan", "Gheorghe Popescu", "Rustu Recber", "Diego Maradona"],
  "Manchester United": ["Cristiano Ronaldo", "David Beckham", "Wayne Rooney", "Angel Di Maria", "Alexis Sanchez", "Robin van Persie", "Zlatan Ibrahimovic", "Juan Mata", "Radamel Falcao", "Henrikh Mkhitaryan", "Dimitar Berbatov", "Edinson Cavani", "Christian Eriksen", "Matthijs de Ligt", "Nani", "Paul Pogba", "Carlos Tevez", "Romelu Lukaku", "Jadon Sancho", "Shinji Kagawa", "Andre Onana"],
  "Manchester City": ["Robinho", "Sergio Aguero", "Kevin De Bruyne", "David Silva", "Yaya Toure", "Erling Haaland", "Jack Grealish", "Edin Dzeko", "Carlos Tevez", "Mario Balotelli", "Jerome Boateng", "Emmanuel Adebayor"],
  Liverpool: ["Fernando Torres", "Luis Suarez", "Xabi Alonso", "Philippe Coutinho", "Dirk Kuyt", "Mario Balotelli", "Thiago Alcantara", "Mohamed Salah", "Daniel Sturridge", "Robbie Keane"],
  Chelsea: ["Fernando Torres", "Juan Mata", "David Luiz", "Diego Costa", "Alvaro Morata", "Willian", "Eden Hazard", "Radamel Falcao", "Andriy Shevchenko", "Demba Ba", "Kalidou Koulibaly", "Didier Drogba", "Deco", "Samuel Eto'o", "Gonzalo Higuain", "Thiago Silva", "Michael Essien", "Arjen Robben", "Romelu Lukaku", "Jadon Sancho", "Kevin De Bruyne", "Mohamed Salah", "Daniel Sturridge", "William Gallas"],
  Arsenal: ["Thierry Henry", "Robin van Persie", "Alexis Sanchez", "Mesut Ozil", "Cesc Fabregas", "Emmanuel Adebayor", "Henrikh Mkhitaryan", "David Luiz", "Willian", "Nicolas Pepe", "William Gallas"],
  Tottenham: ["Gareth Bale", "Luka Modric", "Dimitar Berbatov", "Emmanuel Adebayor", "Christian Eriksen", "Gheorghe Popescu", "Robbie Keane", "William Gallas"],
  Juventus: ["Zinedine Zidane", "Cristiano Ronaldo", "Fabio Cannavaro", "David Trezeguet", "Paul Pogba", "Gonzalo Higuain", "Sami Khedira", "Angel Di Maria", "Arturo Vidal", "Miralem Pjanic", "Matthijs de Ligt", "Carlos Tevez", "Andrea Pirlo", "Christian Vieri", "Gianluigi Buffon", "Douglas Costa"],
  "AC Milan": ["Zlatan Ibrahimovic", "Ronaldinho", "David Beckham", "Kaka", "Andriy Shevchenko", "Ronaldo Nazario", "Robinho", "Gonzalo Higuain", "Andrea Pirlo", "Mario Balotelli", "Fernando Torres", "Michael Essien", "Thiago Silva", "Luka Modric", "Alvaro Morata"],
  "Inter Milan": ["Ronaldo Nazario", "Samuel Eto'o", "Wesley Sneijder", "Zlatan Ibrahimovic", "Christian Vieri", "Romelu Lukaku", "Arturo Vidal", "Ricardo Quaresma", "Mauro Icardi", "Edin Dzeko", "Christian Eriksen", "Henrikh Mkhitaryan", "Fabio Cannavaro", "Mario Balotelli", "Alexis Sanchez", "Andre Onana", "Robbie Keane"],
  Napoli: ["Marek Hamsik", "Edinson Cavani", "Gonzalo Higuain", "Kalidou Koulibaly", "Fabio Cannavaro", "Jose Sosa", "Kevin De Bruyne", "Romelu Lukaku", "Diego Maradona"],
  Roma: ["Edin Dzeko", "Henrikh Mkhitaryan", "Miralem Pjanic", "Romelu Lukaku", "Antonio Rudiger", "Mohamed Salah"],
  "Paris Saint-Germain": ["Zlatan Ibrahimovic", "David Beckham", "Neymar", "Lionel Messi", "Angel Di Maria", "Thiago Silva", "Kylian Mbappe", "David Luiz", "Edinson Cavani", "Mauro Icardi", "Ronaldinho", "Gianluigi Buffon", "Ousmane Dembele", "Achraf Hakimi"],
  "Bayern Münih": ["Robert Lewandowski", "Franck Ribery", "Arjen Robben", "Philippe Coutinho", "Jerome Boateng", "Arturo Vidal", "James Rodriguez", "Matthijs de Ligt", "Thiago Alcantara", "Douglas Costa", "Toni Kroos", "Xabi Alonso", "Mario Gotze", "Jose Sosa"],
  "Borussia Dortmund": ["Robert Lewandowski", "Mario Gotze", "Ousmane Dembele", "Erling Haaland", "Jadon Sancho", "Shinji Kagawa", "Henrikh Mkhitaryan", "Jude Bellingham", "Achraf Hakimi"],
  Ajax: ["Wesley Sneijder", "Luis Suarez", "Christian Eriksen", "Frenkie de Jong", "Matthijs de Ligt", "Dusan Tadic", "Zlatan Ibrahimovic", "Andre Onana"],
  Porto: ["Deco", "Hulk", "Radamel Falcao", "Ricardo Quaresma", "James Rodriguez", "Pepe"],
  Galatasaray: ["Wesley Sneijder", "Didier Drogba", "Radamel Falcao", "Mauro Icardi", "Franck Ribery", "Alvaro Morata", "Arda Turan", "Gheorghe Popescu"],
  Fenerbahçe: ["Robin van Persie", "Dirk Kuyt", "Nani", "Mesut Ozil", "Edin Dzeko", "Dusan Tadic", "Rustu Recber", "Roberto Carlos"],
  Beşiktaş: ["Demba Ba", "Ricardo Quaresma", "Pepe", "Vincent Aboubakar", "Miralem Pjanic", "Shinji Kagawa"],
  Trabzonspor: ["Marek Hamsik", "Jose Sosa", "Mohamed Salah", "Nicolas Pepe", "Daniel Sturridge", "Andre Onana"],
};

function normalizeName(str) {
  return (str || "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function getCommonPlayers(teamA, teamB) {
  const listA = PLAYER_DB[teamA];
  const listB = PLAYER_DB[teamB];
  if (!listA || !listB) return null;
  const normB = listB.map(normalizeName);
  return listA.filter((p) => normB.includes(normalizeName(p)));
}

const VALID_PAIRS = (() => {
  const pairs = [];
  for (let i = 0; i < TEAM_POOL.length; i++) {
    for (let j = i + 1; j < TEAM_POOL.length; j++) {
      const common = getCommonPlayers(TEAM_POOL[i], TEAM_POOL[j]);
      if (common && common.length > 0) pairs.push([TEAM_POOL[i], TEAM_POOL[j]]);
    }
  }
  return pairs;
})();

function pickRandomValidPair(excludePair) {
  let candidates = VALID_PAIRS;
  if (excludePair) {
    candidates = VALID_PAIRS.filter(
      ([a, b]) => !((a === excludePair[0] && b === excludePair[1]) || (a === excludePair[1] && b === excludePair[0]))
    );
    if (candidates.length === 0) candidates = VALID_PAIRS;
  }
  const [a, b] = candidates[Math.floor(Math.random() * candidates.length)];
  return Math.random() < 0.5 ? [a, b] : [b, a];
}

function pickPartnerFor(fixedTeam, excludeTeam) {
  let candidates = VALID_PAIRS
    .filter(([a, b]) => a === fixedTeam || b === fixedTeam)
    .map(([a, b]) => (a === fixedTeam ? b : a))
    .filter((t) => t !== excludeTeam);
  if (candidates.length === 0) {
    candidates = VALID_PAIRS.filter(([a, b]) => a === fixedTeam || b === fixedTeam).map((p) => (p[0] === fixedTeam ? p[1] : p[0]));
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function answerMatches(answer, commonPlayers) {
  const norm = normalizeName(answer);
  if (!norm) return false;
  return commonPlayers.some((p) => {
    const np = normalizeName(p);
    if (np === norm) return true;
    const parts = np.split(" ");
    return parts.length > 1 && parts[parts.length - 1] === norm;
  });
}

function getInitials(name) {
  return (name || "")
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function teamHue(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function TeamCrest({ name, size = 52 }) {
  const hue = teamHue(name);
  return (
    <div
      className="rounded-full flex items-center justify-center font-black shrink-0"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 180deg, hsl(${hue},70%,42%), hsl(${(hue + 45) % 360},70%,30%), hsl(${hue},70%,42%))`,
        border: "2px solid rgba(245,197,24,0.45)",
        color: CHALK,
        fontSize: size * 0.32,
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function FlipDigit({ value }) {
  return (
    <div
      key={value}
      className="relative w-9 sm:w-11 h-12 sm:h-14 rounded-md flex items-center justify-center overflow-hidden flip-anim"
      style={{ backgroundColor: "#0A1F17", border: "1px solid rgba(245,197,24,0.25)" }}
    >
      <span className="font-mono font-black text-2xl sm:text-3xl tabular-nums" style={{ color: FLOOD }}>
        {value}
      </span>
      <div className="absolute left-0 right-0 top-1/2 h-px" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} />
    </div>
  );
}

function ScoreClock({ seconds }) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  const digits = [m[0], m[1], s[0], s[1]];
  return (
    <div className="flex items-center gap-1.5">
      <FlipDigit value={digits[0]} />
      <FlipDigit value={digits[1]} />
      <span className="font-black text-2xl" style={{ color: FLOOD }}>:</span>
      <FlipDigit value={digits[2]} />
      <FlipDigit value={digits[3]} />
    </div>
  );
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // localStorage kullanılamıyorsa sessizce geç
  }
}

export default function OrtakFutbolcuOyunu() {
  const [phase, setPhase] = useState("setup");
  const [playerName, setPlayerName] = useState("");
  const [duration, setDuration] = useState(45);
  const [scorePlayer, setScorePlayer] = useState(0);
  const [scoreGame, setScoreGame] = useState(0);
  const [round, setRound] = useState(1);
  const [myTeam, setMyTeam] = useState("");
  const [gameTeam, setGameTeam] = useState("");
  const [timeLeft, setTimeLeft] = useState(45);
  const [answer, setAnswer] = useState("");
  const [lockedAnswer, setLockedAnswer] = useState("");
  const [autoResult, setAutoResult] = useState(null);
  const [commonPlayers, setCommonPlayers] = useState([]);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintText, setHintText] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(() => loadStats());
  const intervalRef = useRef(null);

  const name = playerName.trim() || "Sen";

  useEffect(() => {
    if (phase === "timer") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            handleTimeout();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function recordRoundStats({ correct, score, newStreak }) {
    setStats((prev) => {
      const next = {
        bestScore: Math.max(prev.bestScore, score),
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        totalRounds: prev.totalRounds + 1,
      };
      saveStats(next);
      return next;
    });
  }

  function startGame() {
    setScorePlayer(0);
    setScoreGame(0);
    setRound(1);
    setStreak(0);
    setHistory([]);
    const [t1, t2] = pickRandomValidPair();
    setMyTeam(t1);
    setGameTeam(t2);
    setPhase("teams");
  }

  function reshuffleTeam1() {
    setMyTeam(pickPartnerFor(gameTeam, myTeam));
  }

  function reshuffleTeam2() {
    setGameTeam(pickPartnerFor(myTeam, gameTeam));
  }

  function startRound() {
    setTimeLeft(duration);
    setAnswer("");
    setHintUsed(false);
    setHintText("");
    setCommonPlayers(getCommonPlayers(myTeam, gameTeam) || []);
    setPhase("timer");
  }

  function revealHint() {
    if (hintUsed || commonPlayers.length === 0) return;
    const pick = commonPlayers[Math.floor(Math.random() * commonPlayers.length)];
    setHintText(`${pick.length} harfli, ilk harfi "${pick[0].toUpperCase()}"`);
    setHintUsed(true);
  }

  function submitAnswer() {
    if (!answer.trim()) return;
    clearInterval(intervalRef.current);
    const trimmed = answer.trim();
    setLockedAnswer(trimmed);

    const elapsed = duration - timeLeft;
    const fast = elapsed <= duration / 2;

    if (answerMatches(trimmed, commonPlayers)) {
      const pts = hintUsed ? 1 : fast ? 2 : 1;
      const newScore = scorePlayer + pts;
      const newStreak = streak + 1;
      setPointsEarned(pts);
      setAutoResult("correct");
      setScorePlayer(newScore);
      setStreak(newStreak);
      recordRoundStats({ correct: true, score: newScore, newStreak });
    } else {
      setPointsEarned(0);
      setAutoResult("wrong");
      setScoreGame((s) => s + 1);
      setStreak(0);
      recordRoundStats({ correct: false, score: scorePlayer, newStreak: 0 });
    }
    setPhase("reveal");
  }

  function handleTimeout() {
    setLockedAnswer("");
    setPointsEarned(0);
    setAutoResult("timeout");
    setScoreGame((s) => s + 1);
    setStreak(0);
    recordRoundStats({ correct: false, score: scorePlayer, newStreak: 0 });
    setPhase("reveal");
  }

  function timeOut() {
    clearInterval(intervalRef.current);
    handleTimeout();
  }

  function nextRound() {
    setHistory((h) => [
      {
        round,
        myTeam,
        gameTeam,
        answer: lockedAnswer || "—",
        result: autoResult === "correct" ? "doğru" : autoResult === "wrong" ? "yanlış" : "süre doldu",
        points: pointsEarned,
      },
      ...h,
    ]);
    const [t1, t2] = pickRandomValidPair([myTeam, gameTeam]);
    setMyTeam(t1);
    setGameTeam(t2);
    setAnswer("");
    setLockedAnswer("");
    setCommonPlayers([]);
    setAutoResult(null);
    setHintUsed(false);
    setHintText("");
    setRound((r) => r + 1);
    setPhase("teams");
  }

  function resetGame() {
    clearInterval(intervalRef.current);
    setPhase("setup");
    setScorePlayer(0);
    setScoreGame(0);
    setRound(1);
    setStreak(0);
    setMyTeam("");
    setGameTeam("");
    setAnswer("");
    setLockedAnswer("");
    setCommonPlayers([]);
    setAutoResult(null);
    setHintUsed(false);
    setHintText("");
    setHistory([]);
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-4 py-8"
      style={{
        backgroundColor: PITCH,
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 64px)",
      }}
    >
      <style>{`
        @keyframes flipIn {
          0% { transform: rotateX(90deg); opacity: 0.3; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .flip-anim { animation: flipIn 0.35s ease-out; transform-style: preserve-3d; }
        .pop-anim { animation: popIn 0.25s ease-out; }
        .field-input {
          background: rgba(244,241,232,0.06);
          border: 1px solid rgba(245,197,24,0.3);
          color: #F4F1E8;
        }
        .field-input::placeholder { color: rgba(244,241,232,0.4); }
        .field-input:focus { outline: none; border-color: #F5C518; box-shadow: 0 0 0 3px rgba(245,197,24,0.15); }
      `}</style>

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: FLOOD }}>
            <span className="text-lg">⚽</span>
          </div>
          <h1 className="font-black uppercase tracking-tight text-xl sm:text-2xl" style={{ color: CHALK }}>
            Çağrı Hocam Bul Beni
          </h1>
        </div>
        {phase !== "setup" && (
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-md transition hover:opacity-80"
            style={{ color: CHALK, border: "1px solid rgba(244,241,232,0.25)" }}
          >
            <RotateCcw size={14} /> Sıfırla
          </button>
        )}
      </div>

      {/* SETUP */}
      {phase === "setup" && (
        <div className="w-full max-w-md">
          <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(244,241,232,0.7)" }}>
            Bot her turda iki takım seçer. Süre dolmadan bu iki takımda birlikte
            oynamış bir futbolcu bulup yazman gerekiyor. Hızlı cevap +2, ipucu kullanırsan +1 puan getirir.
          </p>

          {stats.totalRounds > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: PITCH_LIGHT, border: "1px solid rgba(245,197,24,0.15)" }}>
                <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "rgba(244,241,232,0.55)" }}>
                  <Award size={11} /> En Yüksek Skor
                </p>
                <p className="font-mono font-black text-2xl" style={{ color: FLOOD }}>{stats.bestScore}</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: PITCH_LIGHT, border: "1px solid rgba(245,197,24,0.15)" }}>
                <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "rgba(244,241,232,0.55)" }}>
                  <Flame size={11} /> En Uzun Seri
                </p>
                <p className="font-mono font-black text-2xl" style={{ color: FLOOD }}>{stats.bestStreak}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: PITCH_LIGHT, border: "1px solid rgba(245,197,24,0.15)" }}>
            <label className="text-xs font-bold uppercase tracking-wide mb-2 block" style={{ color: FLOOD }}>
              Adın
            </label>
            <input
              className="w-full rounded-md px-3 py-2.5 mb-4 field-input"
              placeholder="Adını yaz"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <label className="text-xs font-bold uppercase tracking-wide mb-2 block" style={{ color: FLOOD }}>
              Tur Süresi (saniye)
            </label>
            <div className="flex gap-2">
              {[30, 45, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className="flex-1 py-2 rounded-md text-sm font-bold transition"
                  style={{
                    backgroundColor: duration === d ? FLOOD : "rgba(244,241,232,0.06)",
                    color: duration === d ? PITCH : CHALK,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase tracking-wide transition hover:opacity-90"
            style={{ backgroundColor: FLOOD, color: PITCH }}
          >
            <Play size={18} /> Oyuna Başla
          </button>
        </div>
      )}

      {/* SCOREBOARD */}
      {phase !== "setup" && (
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: PITCH_LIGHT, border: "1px solid rgba(245,197,24,0.15)" }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1 truncate" style={{ color: "rgba(244,241,232,0.6)" }}>{name}</p>
              <p className="font-mono font-black text-3xl tabular-nums" style={{ color: FLOOD }}>{scorePlayer}</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: PITCH_LIGHT, border: "1px solid rgba(245,197,24,0.15)" }}>
              <p className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "rgba(244,241,232,0.6)" }}>
                <Bot size={12} /> Bot
              </p>
              <p className="font-mono font-black text-3xl tabular-nums" style={{ color: FLOOD }}>{scoreGame}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(244,241,232,0.4)" }}>
              Tur {round}
            </p>
            {streak >= 2 && (
              <p className="pop-anim flex items-center gap-1 text-xs font-black uppercase tracking-wide" style={{ color: "#FF9C4A" }}>
                <Flame size={13} /> {streak} Seri
              </p>
            )}
          </div>
        </div>
      )}

      {/* TEAMS */}
      {phase === "teams" && (
        <div className="w-full max-w-md">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(244,241,232,0.5)" }}>
            Bot iki takımı seçti
          </p>
          <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: PITCH_LIGHT, border: "1px solid rgba(245,197,24,0.15)" }}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wide" style={{ color: FLOOD }}>
                1. Takım
              </label>
              <button
                onClick={reshuffleTeam1}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition hover:opacity-70"
                style={{ color: "rgba(244,241,232,0.5)" }}
              >
                <Shuffle size={12} /> Değiştir
              </button>
            </div>
            <div
              className="w-full rounded-md px-3 py-3 mb-4 font-black flex items-center gap-3"
              style={{ backgroundColor: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", color: CHALK }}
            >
              <TeamCrest name={myTeam} size={40} />
              <span>{myTeam}</span>
            </div>

            <div className="flex items-center justify-center my-2">
              <span className="font-black text-sm" style={{ color: "rgba(244,241,232,0.4)" }}>VS</span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wide" style={{ color: FLOOD }}>
                2. Takım
              </label>
              <button
                onClick={reshuffleTeam2}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition hover:opacity-70"
                style={{ color: "rgba(244,241,232,0.5)" }}
              >
                <Shuffle size={12} /> Değiştir
              </button>
            </div>
            <div
              className="w-full rounded-md px-3 py-3 font-black flex items-center gap-3"
              style={{ backgroundColor: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", color: CHALK }}
            >
              <TeamCrest name={gameTeam} size={40} />
              <span>{gameTeam}</span>
            </div>
          </div>
          <button
            onClick={startRound}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase tracking-wide transition hover:opacity-90"
            style={{ backgroundColor: FLOOD, color: PITCH }}
          >
            Turu Başlat <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* TIMER */}
      {phase === "timer" && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="flex justify-center mb-6">
            <ScoreClock seconds={timeLeft} />
          </div>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex flex-col items-center gap-2">
              <TeamCrest name={myTeam} size={48} />
              <p className="font-black uppercase text-sm text-center" style={{ color: CHALK }}>{myTeam}</p>
            </div>
            <span className="font-black text-sm" style={{ color: "rgba(244,241,232,0.4)" }}>×</span>
            <div className="flex flex-col items-center gap-2">
              <TeamCrest name={gameTeam} size={48} />
              <p className="font-black uppercase text-sm text-center" style={{ color: CHALK }}>{gameTeam}</p>
            </div>
          </div>

          <input
            className="w-full rounded-md px-3 py-3 mb-3 field-input text-center font-bold"
            placeholder="Ortak futbolcunun adı..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && answer.trim()) submitAnswer();
            }}
          />

          <button
            onClick={submitAnswer}
            disabled={!answer.trim()}
            className="w-full py-3.5 rounded-xl font-black uppercase tracking-wide transition disabled:opacity-30 mb-3"
            style={{ backgroundColor: FLOOD, color: PITCH }}
          >
            Cevapla
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={revealHint}
              disabled={hintUsed}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide disabled:opacity-40"
              style={{ color: FLOOD }}
            >
              <Lightbulb size={14} /> İpucu
            </button>
            <button
              onClick={timeOut}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
              style={{ color: "rgba(244,241,232,0.5)" }}
            >
              <Ban size={14} /> Bulamıyorum
            </button>
          </div>

          {hintText && (
            <p className="pop-anim mt-3 text-xs font-bold" style={{ color: "rgba(244,241,232,0.6)" }}>
              💡 {hintText}
            </p>
          )}
        </div>
      )}

      {/* REVEAL */}
      {phase === "reveal" && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-full rounded-xl p-6 mb-5 text-center" style={{ backgroundColor: PITCH_LIGHT, border: "1px solid rgba(245,197,24,0.2)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(244,241,232,0.5)" }}>
              {myTeam} × {gameTeam}
            </p>

            {lockedAnswer ? (
              <>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: FLOOD }}>
                  Cevabın:
                </p>
                <p className="font-black text-2xl mb-3" style={{ color: CHALK }}>{lockedAnswer}</p>
              </>
            ) : (
              <p className="font-black text-xl mb-3" style={{ color: RED }}>Süre doldu, cevap yok</p>
            )}

            {autoResult === "correct" && (
              <p className="pop-anim flex items-center justify-center gap-1.5 font-black uppercase text-sm" style={{ color: GREEN }}>
                <Check size={16} /> Doğru! {pointsEarned === 2 ? "⚡ Hızlı Bonus +2" : "+1"}
              </p>
            )}
            {(autoResult === "wrong" || autoResult === "timeout") && (
              <div>
                <p className="flex items-center justify-center gap-1.5 font-black uppercase text-sm mb-2" style={{ color: RED }}>
                  <X size={16} /> {autoResult === "wrong" ? "Yanlış" : "Süre Doldu"}
                </p>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "rgba(244,241,232,0.5)" }}>
                  Orada oynamış oyuncular:
                </p>
                <p className="text-sm font-bold" style={{ color: CHALK }}>{commonPlayers.join(", ")}</p>
              </div>
            )}
          </div>

          <button
            onClick={nextRound}
            className="w-full py-3.5 rounded-xl font-black uppercase tracking-wide transition hover:opacity-90"
            style={{ backgroundColor: FLOOD, color: PITCH }}
          >
            Sonraki Tur
          </button>
        </div>
      )}

      {/* HISTORY */}
      {history.length > 0 && phase !== "setup" && (
        <div className="w-full max-w-md mt-10">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} style={{ color: FLOOD }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(244,241,232,0.5)" }}>
              Geçmiş Turlar
            </p>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className="rounded-lg px-3 py-2.5 flex items-center justify-between text-sm"
                style={{ backgroundColor: PITCH_LIGHT, border: "1px solid rgba(245,197,24,0.1)" }}
              >
                <div className="min-w-0 mr-3">
                  <p className="truncate" style={{ color: CHALK }}>
                    {h.myTeam} × {h.gameTeam}
                  </p>
                  <p className="text-xs truncate" style={{ color: "rgba(244,241,232,0.45)" }}>
                    {h.answer}
                  </p>
                </div>
                <span
                  className="text-xs font-bold uppercase shrink-0 px-2 py-1 rounded"
                  style={{
                    color: h.result === "doğru" ? GREEN : h.result === "yanlış" ? RED : "rgba(244,241,232,0.5)",
                    backgroundColor:
                      h.result === "doğru" ? "rgba(63,143,95,0.15)" : h.result === "yanlış" ? "rgba(214,69,65,0.15)" : "rgba(244,241,232,0.06)",
                  }}
                >
                  {h.result}{h.points ? ` +${h.points}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
