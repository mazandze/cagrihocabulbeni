import { useState, useEffect, useRef } from "react";
import { Play, Check, X, RotateCcw, Trophy, ChevronRight, Ban, Bot, Shuffle } from "lucide-react";

const PITCH = "#0B2E23";
const PITCH_LIGHT = "#123B2C";
const CHALK = "#F4F1E8";
const FLOOD = "#F5C518";
const RED = "#D64541";

const TEAM_POOL = [
  // Türkiye - Süper Lig
  "Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor",
  // İspanya - La Liga
  "Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla", "Valencia", "Real Sociedad",
  // İngiltere - Premier League
  "Manchester United", "Manchester City", "Liverpool", "Chelsea", "Arsenal", "Tottenham", "Newcastle United",
  // İtalya - Serie A
  "Juventus", "AC Milan", "Inter Milan", "Napoli", "Roma", "Fiorentina",
  // Almanya - Bundesliga
  "Bayern Münih", "Borussia Dortmund", "Schalke 04", "Bayer Leverkusen", "RB Leipzig",
  // Fransa - Ligue 1
  "Paris Saint-Germain", "Marsilya", "Lyon", "Monaco", "Lille",
];

function pickTwoRandomTeams(excludeA, excludeB) {
  const t1 = pickRandomTeam(excludeB);
  let t2 = pickRandomTeam(t1);
  let guard = 0;
  while (t2 === t1 && guard < 10) {
    t2 = pickRandomTeam(t1);
    guard++;
  }
  return [t1, t2];
}

function pickRandomTeam(exclude) {
  const pool = TEAM_POOL.filter((t) => t !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

const PLAYER_DB = {
  "Real Madrid": ["Cristiano Ronaldo", "David Beckham", "Zinedine Zidane", "Luka Modric", "Karim Benzema", "Toni Kroos", "Gareth Bale", "Ronaldo Nazario", "Xabi Alonso", "Fabio Cannavaro", "Angel Di Maria", "James Rodriguez", "Alvaro Morata", "Luis Figo"],
  Barcelona: ["Lionel Messi", "Neymar", "Luis Suarez", "Ronaldinho", "Samuel Eto'o", "Zlatan Ibrahimovic", "Thierry Henry", "Philippe Coutinho", "Antoine Griezmann", "Ronaldo Nazario", "Luis Figo"],
  "Manchester United": ["Cristiano Ronaldo", "David Beckham", "Wayne Rooney", "Angel Di Maria", "Alexis Sanchez", "Robin van Persie", "Zlatan Ibrahimovic", "Juan Mata", "Radamel Falcao"],
  "Manchester City": ["Robinho", "Sergio Aguero", "Kevin De Bruyne", "David Silva", "Yaya Toure", "Erling Haaland", "Jack Grealish", "Edin Dzeko"],
  Liverpool: ["Fernando Torres", "Luis Suarez", "Xabi Alonso", "Philippe Coutinho"],
  Chelsea: ["Fernando Torres", "Juan Mata", "David Luiz", "Diego Costa", "Alvaro Morata", "Willian", "Eden Hazard", "Radamel Falcao"],
  Arsenal: ["Thierry Henry", "Robin van Persie", "Alexis Sanchez", "Mesut Ozil", "Cesc Fabregas", "Emmanuel Adebayor"],
  Tottenham: ["Gareth Bale", "Luka Modric", "Dimitar Berbatov", "Emmanuel Adebayor"],
  Juventus: ["Zinedine Zidane", "Cristiano Ronaldo", "Fabio Cannavaro", "David Trezeguet", "Paul Pogba", "Gonzalo Higuain", "Sami Khedira"],
  "AC Milan": ["Zlatan Ibrahimovic", "Ronaldinho", "David Beckham", "Kaka", "Andriy Shevchenko", "Ronaldo Nazario", "Robinho"],
  "Inter Milan": ["Ronaldo Nazario", "Samuel Eto'o", "Wesley Sneijder", "Zlatan Ibrahimovic", "Christian Vieri", "Romelu Lukaku"],
  Napoli: ["Marek Hamsik", "Edinson Cavani", "Gonzalo Higuain", "Kalidou Koulibaly"],
  Roma: ["Edin Dzeko", "Henrikh Mkhitaryan"],
  "Paris Saint-Germain": ["Zlatan Ibrahimovic", "David Beckham", "Neymar", "Lionel Messi", "Angel Di Maria", "Thiago Silva", "Kylian Mbappe"],
  "Bayern Münih": ["Robert Lewandowski", "Franck Ribery", "Arjen Robben", "Philippe Coutinho", "Jerome Boateng"],
  "Borussia Dortmund": ["Robert Lewandowski", "Mario Gotze", "Ousmane Dembele", "Erling Haaland", "Jadon Sancho", "Shinji Kagawa"],
  Ajax: ["Wesley Sneijder", "Luis Suarez", "Christian Eriksen", "Frenkie de Jong", "Matthijs de Ligt"],
  Porto: ["Deco", "Hulk", "Radamel Falcao", "Ricardo Quaresma"],
  Galatasaray: ["Wesley Sneijder", "Didier Drogba", "Radamel Falcao", "Mauro Icardi", "Dusan Tadic"],
  Fenerbahçe: ["Robin van Persie", "Dirk Kuyt", "Nani", "Mesut Ozil", "Edin Dzeko"],
  Beşiktaş: ["Demba Ba", "Ricardo Quaresma", "Pepe", "Vincent Aboubakar"],
  Trabzonspor: ["Marek Hamsik", "David Trezeguet"],
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
  const [commonPlayers, setCommonPlayers] = useState(null);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  const name = playerName.trim() || "Sen";

  useEffect(() => {
    if (phase === "timer") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setLockedAnswer("");
            setCommonPlayers(getCommonPlayers(myTeam, gameTeam));
            setAutoResult("timeout");
            setPhase("reveal");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [phase]);

  function startGame() {
    setScorePlayer(0);
    setScoreGame(0);
    setRound(1);
    setHistory([]);
    const [t1, t2] = pickTwoRandomTeams();
    setMyTeam(t1);
    setGameTeam(t2);
    setPhase("teams");
  }

  function reshuffleTeam1() {
    setMyTeam(pickRandomTeam(gameTeam));
  }

  function reshuffleTeam2() {
    setGameTeam(pickRandomTeam(myTeam));
  }

  function startRound() {
    setTimeLeft(duration);
    setAnswer("");
    setPhase("timer");
  }

  function submitAnswer() {
    if (!answer.trim()) return;
    clearInterval(intervalRef.current);
    const trimmed = answer.trim();
    setLockedAnswer(trimmed);
    const common = getCommonPlayers(myTeam, gameTeam);
    setCommonPlayers(common);
    if (common === null) {
      setAutoResult("unknown");
    } else if (answerMatches(trimmed, common)) {
      setAutoResult("correct");
      setScorePlayer((s) => s + 1);
    } else {
      setAutoResult("wrong");
      setScoreGame((s) => s + 1);
    }
    setPhase("reveal");
  }

  function timeOut() {
    clearInterval(intervalRef.current);
    setLockedAnswer("");
    setCommonPlayers(getCommonPlayers(myTeam, gameTeam));
    setAutoResult("timeout");
    setPhase("reveal");
  }

  function pushHistoryAndAdvance(resultLabel) {
    setHistory((h) => [
      {
        round,
        myTeam,
        gameTeam,
        answer: lockedAnswer || "—",
        result: resultLabel,
      },
      ...h,
    ]);
    const [t1, t2] = pickTwoRandomTeams();
    setMyTeam(t1);
    setGameTeam(t2);
    setAnswer("");
    setLockedAnswer("");
    setCommonPlayers(null);
    setAutoResult(null);
    setRound((r) => r + 1);
    setPhase("teams");
  }

  function nextRound() {
    const label = autoResult === "correct" ? "doğru" : autoResult === "wrong" ? "yanlış" : autoResult === "timeout" ? "süre doldu" : "bilinmiyor";
    pushHistoryAndAdvance(label);
  }

  function judgeManual(result) {
    if (result === "correct") setScorePlayer((s) => s + 1);
    if (result === "wrong" || result === "void") setScoreGame((s) => s + 1);
    pushHistoryAndAdvance(result === "correct" ? "doğru" : result === "wrong" ? "yanlış" : "süre doldu");
  }

  function resetGame() {
    clearInterval(intervalRef.current);
    setPhase("setup");
    setScorePlayer(0);
    setScoreGame(0);
    setRound(1);
    setMyTeam("");
    setGameTeam("");
    setAnswer("");
    setLockedAnswer("");
    setCommonPlayers(null);
    setAutoResult(null);
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
        .flip-anim { animation: flipIn 0.35s ease-out; transform-style: preserve-3d; }
        .field-input {
          background: rgba(244,241,232,0.06);
          border: 1px solid rgba(245,197,24,0.3);
          color: #F4F1E8;
        }
        .field-input::placeholder { color: rgba(244,241,232,0.4); }
        .field-input:focus { outline: none; border-color: #F5C518; box-shadow: 0 0 0 3px rgba(245,197,24,0.15); }
      `}</style>

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

      {phase === "setup" && (
        <div className="w-full max-w-md">
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(244,241,232,0.7)" }}>
            Bot her turda iki takım seçer. Süre dolmadan bu iki takımda birlikte
            oynamış bir futbolcu bulup yazman gerekiyor.
          </p>

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

      {phase !== "setup" && (
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-2 gap-3 mb-5">
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
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "rgba(244,241,232,0.4)" }}>
            Tur {round}
          </p>
        </div>
      )}

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
              className="w-full rounded-md px-3 py-2.5 mb-4 font-black text-center"
              style={{ backgroundColor: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", color: CHALK }}
            >
              {myTeam}
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
              className="w-full rounded-md px-3 py-2.5 font-black text-center"
              style={{ backgroundColor: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", color: CHALK }}
            >
              {gameTeam}
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

      {phase === "timer" && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="flex justify-center mb-6">
            <ScoreClock seconds={timeLeft} />
          </div>
          <div className="text-center mb-6">
            <p className="font-black uppercase text-lg sm:text-xl" style={{ color: CHALK }}>{myTeam}</p>
            <p className="text-xs font-bold my-1" style={{ color: "rgba(244,241,232,0.4)" }}>ile</p>
            <p className="font-black uppercase text-lg sm:text-xl" style={{ color: CHALK }}>{gameTeam}</p>
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

          <button
            onClick={timeOut}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
            style={{ color: "rgba(244,241,232,0.5)" }}
          >
            <Ban size={14} /> Bulamıyorum
          </button>
        </div>
      )}

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
              <p className="flex items-center justify-center gap-1.5 font-black uppercase text-sm" style={{ color: "#3F8F5F" }}>
                <Check size={16} /> Doğru!
              </p>
            )}
            {autoResult === "wrong" && (
              <div>
                <p className="flex items-center justify-center gap-1.5 font-black uppercase text-sm mb-2" style={{ color: RED }}>
                  <X size={16} /> Yanlış
                </p>
                {commonPlayers && commonPlayers.length > 0 ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "rgba(244,241,232,0.5)" }}>
                      Orada oynamış oyuncular:
                    </p>
                    <p className="text-sm font-bold" style={{ color: CHALK }}>{commonPlayers.join(", ")}</p>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: "rgba(244,241,232,0.5)" }}>
                    Bu ikili için listede kayıt yok, cevabın yine de doğru olabilir.
                  </p>
                )}
              </div>
            )}
            {autoResult === "timeout" && commonPlayers && commonPlayers.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "rgba(244,241,232,0.5)" }}>
                  Orada oynamış oyuncular:
                </p>
                <p className="text-sm font-bold" style={{ color: CHALK }}>{commonPlayers.join(", ")}</p>
              </div>
            )}
            {autoResult === "unknown" && (
              <p className="text-xs" style={{ color: "rgba(244,241,232,0.5)" }}>
                Bu ikili için veri tabanımızda kayıt yok — elle değerlendir.
              </p>
            )}
          </div>

          {(autoResult === "correct" || autoResult === "wrong") && (
            <button
              onClick={nextRound}
              className="w-full py-3.5 rounded-xl font-black uppercase tracking-wide transition hover:opacity-90"
              style={{ backgroundColor: FLOOD, color: PITCH }}
            >
              Sonraki Tur
            </button>
          )}

          {(autoResult === "unknown" || autoResult === "timeout") && (
            lockedAnswer ? (
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => judgeManual("correct")}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase tracking-wide transition hover:opacity-90"
                  style={{ backgroundColor: "#3F8F5F", color: CHALK }}
                >
                  <Check size={18} /> Doğru
                </button>
                <button
                  onClick={() => judgeManual("wrong")}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase tracking-wide transition hover:opacity-90"
                  style={{ backgroundColor: RED, color: CHALK }}
                >
                  <X size={18} /> Yanlış
                </button>
              </div>
            ) : (
              <button
                onClick={() => judgeManual("void")}
                className="w-full py-3.5 rounded-xl font-black uppercase tracking-wide transition hover:opacity-90"
                style={{ backgroundColor: FLOOD, color: PITCH }}
              >
                Sonraki Tur
              </button>
            )
          )}
        </div>
      )}

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
                    color: h.result === "doğru" ? "#3F8F5F" : h.result === "yanlış" ? RED : "rgba(244,241,232,0.5)",
                    backgroundColor:
                      h.result === "doğru" ? "rgba(63,143,95,0.15)" : h.result === "yanlış" ? "rgba(214,69,65,0.15)" : "rgba(244,241,232,0.06)",
                  }}
                >
                  {h.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
