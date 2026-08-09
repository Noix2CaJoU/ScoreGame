import { useState, useEffect, useCallback } from "react";

// ─── STORAGE HELPERS ────────────────────────────────────────────────────────
const KEYS = { players: "bg_players", games: "bg_games", matches: "bg_matches" };

function load(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}


// ─── TROPHIES ────────────────────────────────────────────────────────────────
const TROPHIES = [
  { id: "first_win",   wins: 1,   icon: "🏅", label: "Première victoire", color: "#CD7F32" },
  { id: "five_wins",   wins: 5,   icon: "⚔️",  label: "Combattant",        color: "#A770EF" },
  { id: "ten_wins",    wins: 10,  icon: "🔥",  label: "En feu",            color: "#FF6B35" },
  { id: "twenty_wins", wins: 25,  icon: "💎",  label: "Diamant",           color: "#4ECDC4" },
  { id: "fifty_wins",  wins: 50,  icon: "👑",  label: "Roi du plateau",    color: "#FFD700" },
  { id: "hundred_wins",wins: 100, icon: "🐐",  label: "GOAT",              color: "#FF6B6B" },
];

function getUnlockedTrophies(wins) {
  return TROPHIES.filter(t => wins >= t.wins);
}
function getNextTrophy(wins) {
  return TROPHIES.find(t => wins < t.wins);
}
// ─── ICONS ──────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    trophy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    dice: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
    crown: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M2 19h20v2H2v-2zM2 6l5 7 5-7 5 7 5-7v11H2V6z"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    gamepad: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M6 12h4m-2-2v4"/><circle cx="17" cy="10.5" r=".5" fill="currentColor"/><circle cx="19" cy="12.5" r=".5" fill="currentColor"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
    arrowUp: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
    arrowDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  };
  return icons[name] || null;
};

// ─── AVATAR ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ["#FF6B6B","#FFE66D"],["#4ECDC4","#44A08D"],["#A770EF","#CF8BF3"],
  ["#f7971e","#ffd200"],["#11998e","#38ef7d"],["#fc4a1a","#f7b733"],
  ["#8E2DE2","#4A00E0"],["#00b4d8","#0077b6"],
];
function getColor(name) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
const Avatar = ({ name, photo, size = 40 }) => {
  const [c1, c2] = getColor(name);
  if (photo) return (
    <img src={photo} alt={name} style={{
      width: size, height: size, borderRadius: "50%",
      objectFit: "cover", flexShrink: 0,
      border: "2px solid rgba(167,112,239,0.4)",
    }}/>
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg,${c1},${c2})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.38, color: "#fff",
      flexShrink: 0, letterSpacing: "-0.5px",
      fontFamily: "'Poppins', sans-serif",
    }}>
      {name.slice(0,2).toUpperCase()}
    </div>
  );
};

// ─── STATS HELPERS ──────────────────────────────────────────────────────────
function computeStats(playerId, matches, games) {
  const myMatches = matches.filter(m => m.players.some(p => p.id === playerId));
  const wins = myMatches.filter(m => m.winner === playerId).length;
  const losses = myMatches.length - wins;
  const winPct = myMatches.length ? Math.round((wins / myMatches.length) * 100) : 0;
  const gameCount = {};
  for (const m of myMatches) {
    gameCount[m.gameId] = (gameCount[m.gameId] || 0) + 1;
  }
  const favGameId = Object.entries(gameCount).sort((a,b) => b[1]-a[1])[0]?.[0];
  const favGame = games.find(g => g.id === favGameId);
  return { total: myMatches.length, wins, losses, winPct, favGame, gameCount };
}

function computeLeaderboard(players, matches, games, sort, dir) {
  return players.map(p => ({ p, ...computeStats(p.id, matches, games) })).sort((a, b) => {
    let diff = 0;
    if (sort === "wins") diff = b.wins - a.wins;
    else if (sort === "winPct") diff = b.winPct - a.winPct;
    else diff = b.total - a.total;
    return dir === "asc" ? -diff : diff;
  });
}

// ─── MODAL ──────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position:"fixed",inset:0,background:"rgba(6,6,18,0.85)",zIndex:100,
    display:"flex",alignItems:"flex-end",justifyContent:"center",
    backdropFilter:"blur(6px)",
  }} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{
      background:"#12122a",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,
      padding:"28px 20px 36px",border:"1px solid rgba(255,255,255,0.08)",
      borderBottom:"none",maxHeight:"85vh",overflowY:"auto",
    }}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <span style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{title}</span>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:10,padding:8,cursor:"pointer",color:"#aaa",display:"flex"}}>
          <Icon name="close" size={16}/>
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("leaderboard");
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null);
  const [modal, setModal] = useState(null);
  const [sort, setSort] = useState("wins");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    setPlayers(load(KEYS.players) || []);
    setGames(load(KEYS.games) || []);
    setMatches(load(KEYS.matches) || []);
    setLoading(false);
  }, []);

  const addPlayer = (name) => {
    const np = [...players, {id: Date.now().toString(), name, bio: "", photo: null, createdAt: Date.now()}];
    setPlayers(np); save(KEYS.players, np);
    return np[np.length-1];
  };
  const updatePlayer = (id, updates) => {
    const np = players.map(p => p.id === id ? {...p, ...updates} : p);
    setPlayers(np); save(KEYS.players, np);
  };
  const addGame = (name) => {
    const g = {id: Date.now().toString(), name, createdAt: Date.now()};
    const ng = [...games, g];
    setGames(ng); save(KEYS.games, ng);
    return g;
  };
  const addMatch = (match) => {
    const nm = [...matches, {...match, id: Date.now().toString(), date: Date.now()}];
    setMatches(nm); save(KEYS.matches, nm);
  };
  const deletePlayer = (id) => {
    const np = players.filter(p => p.id !== id);
    setPlayers(np); save(KEYS.players, np);
  };
  const deleteGame = (id) => {
    const ng = games.filter(g => g.id !== id);
    setGames(ng); save(KEYS.games, ng);
  };

  const handleSort = (key) => {
    if (sort === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSort(key); setSortDir("desc"); }
  };

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#060612",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:40,height:40,border:"3px solid #A770EF",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (view?.type === "profile") return (
    <ProfileView
      player={players.find(p => p.id === view.data.id) || view.data}
      matches={matches} games={games} players={players}
      onBack={() => setView(null)}
      onUpdate={(updates) => updatePlayer(view.data.id, updates)}
    />
  );

  if (view?.type === "newMatch") return (
    <NewMatchView
      players={players} games={games}
      initialGameId={view.gameId || ""}
      onSave={(m) => { addMatch(m); setView(null); }}
      onBack={() => setView(null)}
      onAddPlayer={addPlayer}
      onAddGame={addGame}
      onGoRanking={(gameId, selected) => setView({ type: "ranking", gameId, selectedPlayers: selected })}
    />
  );

  if (view?.type === "ranking") return (
    <RankingView
      selectedPlayers={view.selectedPlayers}
      gameId={view.gameId}
      games={games}
      players={players}
      onSave={(m) => { addMatch(m); }}
      onReplay={() => setView({ type: "ranking", gameId: view.gameId, selectedPlayers: view.selectedPlayers })}
      onBackToMenu={() => setView(null)}
      onBack={() => setView({ type: "newMatch", gameId: view.gameId })}
      onCorrect={() => setView({ type: "ranking", gameId: view.gameId, selectedPlayers: view.selectedPlayers })}
    />
  );

  return (
    <div style={{minHeight:"100vh",background:"#060612",fontFamily:"'DM Sans',sans-serif",paddingBottom:90,maxWidth:480,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        button:active{opacity:0.75;transform:scale(0.97)}
        ::-webkit-scrollbar{display:none}
        input,select{color-scheme:dark}
      `}</style>

      {/* Header */}
      <div style={{padding:"52px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
            <div style={{color:"#A770EF"}}><Icon name="dice" size={22}/></div>
            <span style={{fontSize:13,color:"#A770EF",fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>Board Scores</span>
          </div>
          <h1 style={{margin:0,fontSize:26,fontWeight:800,color:"#fff",fontFamily:"'Poppins',sans-serif"}}>
            {tab === "leaderboard" ? "Classement" : tab === "players" ? "Joueurs" : "Jeux"}
          </h1>
        </div>
        {tab !== "leaderboard" && (
          <button
            onClick={() => {
              if (tab === "players") setModal("newPlayer");
              else setView({type:"newMatch"});
            }}
            style={{background:"linear-gradient(135deg,#A770EF,#CF8BF3)",border:"none",borderRadius:16,padding:"10px 16px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:6,fontWeight:700,fontSize:13,fontFamily:"'Syne',sans-serif"}}>
            <Icon name="plus" size={16}/>
            {tab === "players" ? "Joueur" : "Partie"}
          </button>
        )}
      </div>

      {tab === "leaderboard" && (
        <LeaderboardTab players={players} matches={matches} games={games}
          sort={sort} sortDir={sortDir} onSort={handleSort}
          onProfile={(p) => setView({type:"profile",data:p})}
          onNewMatch={() => setView({type:"newMatch"})}
        />
      )}
      {tab === "players" && (
        <PlayersTab players={players} matches={matches} games={games}
          onProfile={(p) => setView({type:"profile",data:p})}
          onDelete={deletePlayer}
          onAdd={() => setModal("newPlayer")}
        />
      )}
      {tab === "games" && (
        <GamesTab games={games} matches={matches} players={players}
          onAddGame={addGame}
          onDelete={deleteGame}
          onNewMatch={(gameId) => setView({type:"newMatch", gameId})}
        />
      )}

      {/* Bottom Nav */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(12,12,28,0.96)",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",backdropFilter:"blur(12px)",zIndex:50}}>
        {[
          {id:"players",label:"Joueurs",icon:"users"},
          {id:"leaderboard",label:"Classement",icon:"chart"},
          {id:"games",label:"Jeux",icon:"gamepad"},
        ].map(({id,label,icon}) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1,padding:"12px 0 8px",border:"none",background:"none",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            color: tab===id ? "#A770EF" : "#555",transition:"color 0.2s",
          }}>
            <Icon name={icon} size={22}/>
            <span style={{fontSize:10,fontWeight:tab===id?700:500,letterSpacing:0.5}}>{label}</span>
          </button>
        ))}
      </nav>

      {modal === "newPlayer" && (
        <InputModal title="Nouveau joueur" placeholder="Nom du joueur" emoji="🎮"
          onClose={() => setModal(null)}
          onSubmit={(name) => { addPlayer(name); setModal(null); }}
        />
      )}

    </div>
  );
}


// ─── WIN PCT COLOR ───────────────────────────────────────────────────────────
function winPctColor(pct) {
  if (pct >= 50) {
    const t = (pct - 50) / 50;
    const r = Math.round(255 * (1 - t));
    const g = Math.round(149 + t * (200 - 149));
    const b = Math.round(0 + t * 83);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = pct / 50;
    const g = Math.round(68 + t * (149 - 68));
    return `rgb(255,${g},${Math.round(68 * (1-t))})`;
  }
}
// ─── LEADERBOARD TAB ─────────────────────────────────────────────────────────
function LeaderboardTab({ players, matches, games, sort, sortDir, onSort, onProfile, onNewMatch }) {
  const board = computeLeaderboard(players, matches, games, sort, sortDir);

  const SortBtn = ({ id, label }) => {
    const active = sort === id;
    return (
      <button onClick={() => onSort(id)} style={{
        flexShrink:0, display:"flex", alignItems:"center", gap:4,
        padding:"7px 14px", borderRadius:20, border:"1px solid", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s",
        background: active ? "#A770EF" : "transparent",
        borderColor: active ? "#A770EF" : "rgba(255,255,255,0.15)",
        color: active ? "#fff" : "#888",
      }}>
        {label}
        {active && <Icon name={sortDir === "desc" ? "arrowDown" : "arrowUp"} size={11}/>}
      </button>
    );
  };

  return (
    <div style={{padding:"0 16px"}}>
      <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
        <SortBtn id="wins" label="Victoires"/>
        <SortBtn id="total" label="Parties"/>
        <SortBtn id="winPct" label="Win rate"/>
      </div>

      {players.length === 0 ? (
        <EmptyState icon="users" text="Aucun joueur enregistré" sub="Ajoute des joueurs pour voir le classement"/>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {board.map(({p, total, wins, losses, winPct}, idx) => (
            <button key={p.id} onClick={() => onProfile(p)} style={{
              background: idx===0 ? "linear-gradient(135deg,rgba(167,112,239,0.18),rgba(207,139,243,0.08))" : "rgba(255,255,255,0.04)",
              border: idx===0 ? "1px solid rgba(167,112,239,0.4)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%",
            }}>
              <div style={{
                width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:idx<3?16:14,
                color: idx===0?"#FFD700":idx===1?"#C0C0C0":idx===2?"#CD7F32":"#555",
              }}>
                {idx === 0 ? <Icon name="crown" size={22}/> : `#${idx+1}`}
              </div>
              <Avatar name={p.name} photo={p.photo} size={44}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:"#fff",fontWeight:700,fontSize:16,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                <div style={{fontSize:12,color:"#888",marginTop:2}}>{total} partie{total!==1?"s":""} · {wins}V / {losses}D</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:20,fontWeight:800,color:winPctColor(winPct),fontFamily:"'Syne',sans-serif"}}>{winPct}%</div>
                <div style={{fontSize:11,color:"#666"}}>win rate</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {players.length > 0 && (
        <button onClick={onNewMatch} style={{
          width:"100%",marginTop:20,padding:"16px",
          background:"linear-gradient(135deg,#A770EF,#4A00E0)",
          border:"none",borderRadius:16,color:"#fff",fontSize:15,fontWeight:800,
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          fontFamily:"'Syne',sans-serif",
        }}>
          <Icon name="plus" size={18}/> Enregistrer une partie
        </button>
      )}
    </div>
  );
}

// ─── PLAYERS TAB ─────────────────────────────────────────────────────────────
function PlayersTab({ players, matches, games, onProfile, onDelete, onAdd }) {
  const [confirm, setConfirm] = useState(null);
  // Sort alphabetically
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));

  return (
    <div style={{padding:"0 16px"}}>
      {players.length === 0 ? (
        <EmptyState icon="users" text="Aucun joueur" sub="Ajoute des joueurs pour commencer !">
          <button onClick={onAdd} style={{marginTop:16,padding:"12px 24px",background:"#A770EF",border:"none",borderRadius:12,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>+ Ajouter un joueur</button>
        </EmptyState>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sortedPlayers.map(p => {
            const { total, wins, winPct } = computeStats(p.id, matches, games);
            return (
              <div key={p.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <button onClick={() => onProfile(p)} style={{display:"flex",alignItems:"center",gap:12,flex:1,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
                  <Avatar name={p.name} photo={p.photo} size={46}/>
                  <div style={{minWidth:0}}>
                    <div style={{color:"#fff",fontWeight:700,fontSize:15,fontFamily:"'Syne',sans-serif"}}>{p.name}</div>
                    {p.bio && <div style={{fontSize:11,color:"#A770EF",fontStyle:"italic",marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:180}}>{p.bio}</div>}
                    <div style={{fontSize:12,color:"#888",marginTop:2}}>{total} partie{total!==1?"s":""} · {wins} victoire{wins!==1?"s":""} · {winPct}%</div>
                  </div>
                </button>
                <button onClick={() => setConfirm(p.id)} style={{background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:10,padding:8,cursor:"pointer",color:"#ff6b6b",display:"flex"}}>
                  <Icon name="trash" size={16}/>
                </button>
              </div>
            );
          })}
        </div>
      )}
      {confirm && (
        <Modal title="Supprimer ce joueur ?" onClose={() => setConfirm(null)}>
          <p style={{color:"#aaa",fontSize:14,margin:"0 0 16px"}}>Les parties jouées seront conservées mais le joueur disparaîtra du classement.</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={() => setConfirm(null)} style={{flex:1,padding:"14px",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:12,color:"#fff",fontWeight:600,cursor:"pointer"}}>Annuler</button>
            <button onClick={() => { onDelete(confirm); setConfirm(null); }} style={{flex:1,padding:"14px",background:"#ff4444",border:"none",borderRadius:12,color:"#fff",fontWeight:700,cursor:"pointer"}}>Supprimer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── GAMES TAB ────────────────────────────────────────────────────────────────
function GamesTab({ games, matches, players, onAddGame, onDelete, onNewMatch }) {
  const [confirm, setConfirm] = useState(null);
  const [showNewGame, setShowNewGame] = useState(false);
  const [newGameName, setNewGameName] = useState("");

  const handleAddGame = () => {
    const name = newGameName.trim();
    if (!name) return;
    onAddGame(name);
    setNewGameName("");
    setShowNewGame(false);
  };

  return (
    <div style={{padding:"0 16px"}}>
      {games.length === 0 && !showNewGame ? (
        <EmptyState icon="gamepad" text="Aucun jeu enregistré" sub="Ajoute tes jeux de société !">
          <button onClick={() => setShowNewGame(true)} style={{marginTop:16,padding:"12px 24px",background:"#A770EF",border:"none",borderRadius:12,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>+ Ajouter un jeu</button>
        </EmptyState>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {games.map(g => {
            const gMatches = matches.filter(m => m.gameId === g.id);
            const topWinner = (() => {
              const wc = {}; for (const m of gMatches) wc[m.winner]=(wc[m.winner]||0)+1;
              const top = Object.entries(wc).sort((a,b)=>b[1]-a[1])[0];
              return top ? players.find(p=>p.id===top[0]) : null;
            })();
            return (
              <div key={g.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:48,height:48,background:"linear-gradient(135deg,rgba(167,112,239,0.3),rgba(74,0,224,0.3))",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",color:"#A770EF",flexShrink:0}}>
                  <Icon name="dice" size={24}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:"#fff",fontWeight:700,fontSize:15,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.name}</div>
                  <div style={{fontSize:12,color:"#888",marginTop:2}}>
                    {gMatches.length} partie{gMatches.length!==1?"s":""}
                    {topWinner ? ` · 👑 ${topWinner.name}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => onNewMatch(g.id)}
                  style={{background:"rgba(167,112,239,0.15)",border:"1px solid rgba(167,112,239,0.35)",borderRadius:10,padding:"7px 12px",cursor:"pointer",color:"#A770EF",display:"flex",alignItems:"center",gap:5,flexShrink:0,fontSize:12,fontWeight:700}}>
                  <Icon name="play" size={13}/> Jouer
                </button>
                <button onClick={() => setConfirm(g.id)} style={{background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:10,padding:8,cursor:"pointer",color:"#ff6b6b",display:"flex",flexShrink:0}}>
                  <Icon name="trash" size={16}/>
                </button>
              </div>
            );
          })}

          {showNewGame ? (
            <div style={{display:"flex",gap:8,padding:"12px 14px",borderRadius:14,border:"1px solid rgba(167,112,239,0.4)",background:"rgba(167,112,239,0.08)"}}>
              <div style={{fontSize:20,display:"flex",alignItems:"center"}}>🎲</div>
              <input
                autoFocus
                value={newGameName}
                onChange={e => setNewGameName(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter") handleAddGame(); if(e.key==="Escape") setShowNewGame(false); }}
                placeholder="Nom du jeu"
                style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}
              />
              <button onClick={handleAddGame} style={{background:"#A770EF",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>OK</button>
              <button onClick={() => setShowNewGame(false)} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,padding:"6px 8px",color:"#888",cursor:"pointer",display:"flex",alignItems:"center"}}>
                <Icon name="close" size={14}/>
              </button>
            </div>
          ) : (
            <button onClick={() => setShowNewGame(true)} style={{
              display:"flex",alignItems:"center",gap:10,padding:"13px 16px",borderRadius:14,
              border:"1px dashed rgba(167,112,239,0.4)",background:"transparent",cursor:"pointer",textAlign:"left",
            }}>
              <div style={{width:38,height:38,borderRadius:12,background:"rgba(167,112,239,0.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#A770EF",flexShrink:0}}>
                <Icon name="plus" size={18}/>
              </div>
              <span style={{color:"#A770EF",fontWeight:600,fontSize:14}}>Nouveau jeu</span>
            </button>
          )}
        </div>
      )}
      {confirm && (
        <Modal title="Supprimer ce jeu ?" onClose={() => setConfirm(null)}>
          <p style={{color:"#aaa",fontSize:14,margin:"0 0 16px"}}>Les parties associées seront conservées.</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={() => setConfirm(null)} style={{flex:1,padding:"14px",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:12,color:"#fff",fontWeight:600,cursor:"pointer"}}>Annuler</button>
            <button onClick={() => { onDelete(confirm); setConfirm(null); }} style={{flex:1,padding:"14px",background:"#ff4444",border:"none",borderRadius:12,color:"#fff",fontWeight:700,cursor:"pointer"}}>Supprimer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────────────────────
function ProfileView({ player, matches, games, players, onBack, onUpdate }) {
  const { total, wins, losses, winPct, gameCount } = computeStats(player.id, matches, games);
  const [gameSort, setGameSort] = useState("total");
  const [gameSortDir, setGameSortDir] = useState("desc");
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(player.bio || "");
  const unlockedTrophies = getUnlockedTrophies(wins);
  const nextTrophy = getNextTrophy(wins);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ photo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const saveBio = () => {
    onUpdate({ bio: bioText });
    setEditingBio(false);
  };

  const handleGameSort = (key) => {
    if (gameSort === key) setGameSortDir(d => d === "desc" ? "asc" : "desc");
    else { setGameSort(key); setGameSortDir("desc"); }
  };

  const gameStats = Object.entries(gameCount).map(([gId, count]) => {
    const gWins = matches.filter(m => m.gameId === gId && m.winner === player.id).length;
    const gWinPct = count ? Math.round((gWins / count) * 100) : 0;
    return { gId, count, gWins, gWinPct };
  }).sort((a, b) => {
    let diff = 0;
    if (gameSort === "wins") diff = b.gWins - a.gWins;
    else if (gameSort === "winPct") diff = b.gWinPct - a.gWinPct;
    else diff = b.count - a.count;
    return gameSortDir === "asc" ? -diff : diff;
  });

  const SortBtn = ({ id, label }) => {
    const active = gameSort === id;
    return (
      <button onClick={() => handleGameSort(id)} style={{
        flexShrink:0, display:"flex", alignItems:"center", gap:4,
        padding:"5px 12px", borderRadius:16, border:"1px solid", fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.2s",
        background: active ? "#A770EF" : "transparent",
        borderColor: active ? "#A770EF" : "rgba(255,255,255,0.15)",
        color: active ? "#fff" : "#777",
      }}>
        {label}
        {active && <Icon name={gameSortDir === "desc" ? "arrowDown" : "arrowUp"} size={10}/>}
      </button>
    );
  };

  return (
    <div style={{minHeight:"100vh",background:"#060612",fontFamily:"'DM Sans',sans-serif",paddingBottom:40,maxWidth:480,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{display:none}`}</style>

      <div style={{background:"linear-gradient(160deg,rgba(167,112,239,0.25),rgba(6,6,18,0) 60%)",padding:"52px 20px 24px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:12,padding:"8px 12px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:6,marginBottom:20,fontSize:13,fontWeight:600}}>
          <Icon name="back" size={16}/> Retour
        </button>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{position:"relative",flexShrink:0}}>
            <Avatar name={player.name} photo={player.photo} size={72}/>
            <label style={{
              position:"absolute",bottom:0,right:0,
              width:24,height:24,borderRadius:"50%",
              background:"#A770EF",border:"2px solid #060612",
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",
            }}>
              <input type="file" accept="image/*" capture="user" onChange={handlePhotoChange} style={{display:"none"}}/>
              <Icon name="plus" size={12}/>
            </label>
          </div>
          <div>
            <h2 style={{margin:"0 0 4px",fontSize:24,fontWeight:800,color:"#fff",fontFamily:"'Poppins',sans-serif"}}>{player.name}</h2>
            {player.bio && <div style={{fontSize:12,color:"#A770EF",marginBottom:3,fontStyle:"italic",lineHeight:1.3}}>{player.bio}</div>}
            <div style={{fontSize:13,color:"#888"}}>{total} partie{total!==1?"s":""} jouée{total!==1?"s":""}</div>
          </div>
        </div>
      </div>

      <div style={{padding:"0 16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[
            {label:"Victoires",value:wins,color:"#4ECDC4",icon:"trophy"},
            {label:"Défaites",value:losses,color:"#FF6B6B",icon:"close"},
            {label:"Win rate",value:`${winPct}%`,color:winPctColor(winPct),icon:"star"},
          ].map(({label,value,color,icon}) => (
            <div key={label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 12px",textAlign:"center"}}>
              <div style={{color,marginBottom:4,display:"flex",justifyContent:"center"}}><Icon name={icon} size={18}/></div>
              <div style={{fontSize:22,fontWeight:800,color,fontFamily:"'Syne',sans-serif"}}>{value}</div>
              <div style={{fontSize:11,color:"#666",marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        {total > 0 && (
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"16px",marginBottom:20}}>
            <div style={{fontSize:13,color:"#888",marginBottom:10}}>Ratio victoires/défaites</div>
            <div style={{height:10,background:"rgba(255,107,107,0.3)",borderRadius:10,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${winPct}%`,background:`linear-gradient(90deg,${winPctColor(0)},${winPctColor(winPct)})`,borderRadius:10,transition:"width 0.8s cubic-bezier(0.34,1.56,0.64,1)"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:"#666"}}>
              <span>{wins} victoire{wins!==1?"s":""}</span>
              <span>{losses} défaite{losses!==1?"s":""}</span>
            </div>
          </div>
        )}

        {/* Bio */}
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 16px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:editingBio?10:0}}>
            <div style={{fontSize:12,color:"#888",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Bio</div>
            {!editingBio && <button onClick={() => setEditingBio(true)} style={{background:"rgba(167,112,239,0.15)",border:"1px solid rgba(167,112,239,0.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#A770EF",fontSize:11,fontWeight:600}}>Modifier</button>}
          </div>
          {editingBio ? (
            <div>
              <textarea
                autoFocus
                value={bioText}
                onChange={e => setBioText(e.target.value)}
                placeholder="Écris quelque chose..."
                style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(167,112,239,0.4)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:"none",outline:"none",minHeight:80,marginTop:8}}
              />
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={saveBio} style={{flex:1,padding:"10px",background:"#A770EF",border:"none",borderRadius:10,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>Enregistrer</button>
                <button onClick={() => { setBioText(player.bio||""); setEditingBio(false); }} style={{padding:"10px 14px",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:10,color:"#888",cursor:"pointer",fontSize:13}}>Annuler</button>
              </div>
            </div>
          ) : (
            <div style={{fontSize:13,color: player.bio ? "#ccc" : "#555",marginTop:player.bio?6:0,lineHeight:1.5}}>
              {player.bio || "Aucune bio pour l'instant..."}
            </div>
          )}
        </div>

        {/* Trophées */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,color:"#888",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Trophées</div>
          {unlockedTrophies.length === 0 ? (
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"16px",textAlign:"center",color:"#555",fontSize:13}}>
              {nextTrophy ? `Gagne ta première victoire pour débloquer "${nextTrophy.label}" !` : "Aucun trophée pour l'instant"}
            </div>
          ) : (
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {TROPHIES.map(t => {
                const unlocked = wins >= t.wins;
                return (
                  <div key={t.id} style={{
                    display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                    padding:"12px 10px",borderRadius:14,flex:"1 1 80px",minWidth:80,
                    background: unlocked ? `rgba(${t.color.replace("#","").match(/.{2}/g).map(h=>parseInt(h,16)).join(",")},0.15)` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${unlocked ? t.color+"55" : "rgba(255,255,255,0.06)"}`,
                    opacity: unlocked ? 1 : 0.4,
                    filter: unlocked ? "none" : "grayscale(1)",
                  }}>
                    <span style={{fontSize:24}}>{t.icon}</span>
                    <span style={{fontSize:10,fontWeight:700,color: unlocked ? t.color : "#555",textAlign:"center",lineHeight:1.2}}>{t.label}</span>
                    <span style={{fontSize:9,color:"#555"}}>{t.wins} vic.</span>
                  </div>
                );
              })}
            </div>
          )}
          {nextTrophy && unlockedTrophies.length > 0 && (
            <div style={{marginTop:10,padding:"10px 14px",background:"rgba(255,255,255,0.04)",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{fontSize:11,color:"#888",marginBottom:4}}>Prochain trophée : <span style={{color:"#fff",fontWeight:600}}>{nextTrophy.icon} {nextTrophy.label}</span></div>
              <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:10,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.round((wins/nextTrophy.wins)*100)}%`,background:`linear-gradient(90deg,#A770EF,#CF8BF3)`,borderRadius:10,transition:"width 0.8s ease"}}/>
              </div>
              <div style={{fontSize:10,color:"#666",marginTop:4}}>{wins} / {nextTrophy.wins} victoires</div>
            </div>
          )}
        </div>

        {gameStats.length > 0 && (
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:1}}>Jeux joués</div>
              <div style={{display:"flex",gap:6}}>
                <SortBtn id="total" label="Parties"/>
                <SortBtn id="wins" label="Victoires"/>
                <SortBtn id="winPct" label="Win%"/>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {gameStats.map(({gId, count, gWins, gWinPct}, i) => {
                const g = games.find(x=>x.id===gId);
                return (
                  <div key={gId} style={{
                    display:"flex",alignItems:"center",gap:12,padding:"13px 14px",
                    background: i===0 ? "rgba(167,112,239,0.1)" : "rgba(255,255,255,0.04)",
                    borderRadius:12,
                    border: i===0 ? "1px solid rgba(167,112,239,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {i===0 ? <span style={{fontSize:16}}>⭐</span> : <span style={{fontSize:13,color:"#555",fontWeight:700}}>#{i+1}</span>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <span style={{color:"#fff",fontWeight:600,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"block"}}>{g?.name || "Jeu supprimé"}</span>
                      <span style={{fontSize:11,color:"#666"}}>{count} partie{count!==1?"s":""}</span>
                    </div>
                    <div style={{display:"flex",gap:10,flexShrink:0,alignItems:"center"}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:14,fontWeight:700,color:"#4ECDC4"}}>{gWins}</div>
                        <div style={{fontSize:10,color:"#555"}}>wins</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:14,fontWeight:700,color:winPctColor(gWinPct)}}>{gWinPct}%</div>
                        <div style={{fontSize:10,color:"#555"}}>rate</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {total === 0 && <EmptyState icon="dice" text="Aucune partie" sub="Ce joueur n'a pas encore joué"/>}
      </div>
    </div>
  );
}

// ─── NEW MATCH VIEW ────────────────────────────────────────────────────────────
function NewMatchView({ players: initialPlayers, games, initialGameId, onSave, onBack, onAddPlayer, onAddGame, onGoRanking }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [localGames, setLocalGames] = useState(games);
  const [gameId, setGameId] = useState(initialGameId || "");
  const [selected, setSelected] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [showNewGame, setShowNewGame] = useState(false);

  const handleAddGame = () => {
    const name = newGameName.trim();
    if (!name) return;
    const newG = onAddGame(name);
    setLocalGames(prev => [...prev, newG]);
    setGameId(newG.id);
    setNewGameName("");
    setShowNewGame(false);
  };

  const togglePlayer = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  };

  const handleAddNewPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    const newP = onAddPlayer(name);
    setPlayers(prev => [...prev, newP]);
    setSelected(s => [...s, newP.id]);
    setNewPlayerName("");
    setShowNewPlayer(false);
  };

  const canPlay = gameId && selected.length >= 1;

  return (
    <div style={{minHeight:"100vh",background:"#060612",fontFamily:"'DM Sans',sans-serif",maxWidth:480,margin:"0 auto",overflowY:"auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{display:none}`}</style>

      <div style={{padding:"52px 20px 40px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:12,padding:"8px 12px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:6,marginBottom:24,fontSize:13,fontWeight:600}}>
          <Icon name="back" size={16}/> Annuler
        </button>
        <h2 style={{margin:"0 0 4px",fontSize:24,fontWeight:800,color:"#fff",fontFamily:"'Poppins',sans-serif"}}>Nouvelle partie</h2>
        <p style={{margin:"0 0 28px",color:"#888",fontSize:14}}>Sélectionne le jeu et les joueurs</p>

        {/* Step 1: Game */}
        <Section title="1. Quel jeu ?" done={!!gameId}>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {localGames.map(g => (
              <button key={g.id} onClick={() => setGameId(g.id)} style={{
                padding:"8px 16px",borderRadius:20,border:"1px solid",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s",
                background: gameId===g.id ? "#A770EF" : "rgba(255,255,255,0.06)",
                borderColor: gameId===g.id ? "#A770EF" : "rgba(255,255,255,0.12)",
                color: gameId===g.id ? "#fff" : "#ccc",
              }}>{g.name}</button>
            ))}
            {showNewGame ? (
              <div style={{display:"flex",gap:6,padding:"6px 10px",borderRadius:20,border:"1px solid rgba(167,112,239,0.4)",background:"rgba(167,112,239,0.08)",alignItems:"center"}}>
                <input
                  autoFocus
                  value={newGameName}
                  onChange={e => setNewGameName(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter") handleAddGame(); if(e.key==="Escape") setShowNewGame(false); }}
                  placeholder="Nom du jeu"
                  style={{width:120,background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}
                />
                <button onClick={handleAddGame} style={{background:"#A770EF",border:"none",borderRadius:6,padding:"4px 10px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>OK</button>
                <button onClick={() => setShowNewGame(false)} style={{background:"none",border:"none",padding:"2px 4px",color:"#888",cursor:"pointer",display:"flex",alignItems:"center"}}>
                  <Icon name="close" size={12}/>
                </button>
              </div>
            ) : (
              <button onClick={() => setShowNewGame(true)} style={{
                padding:"8px 14px",borderRadius:20,border:"1px dashed rgba(167,112,239,0.4)",
                fontSize:13,fontWeight:600,cursor:"pointer",
                background:"rgba(167,112,239,0.07)",color:"#A770EF",
                display:"flex",alignItems:"center",gap:6,
              }}>
                <Icon name="plus" size={14}/> Nouveau jeu
              </button>
            )}
          </div>
        </Section>

        {/* Step 2: Players */}
        <Section title="2. Qui joue ?" done={selected.length>0}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[...players].sort((a,b)=>a.name.localeCompare(b.name,"fr",{sensitivity:"base"})).map(p => (
              <button key={p.id} onClick={() => togglePlayer(p.id)} style={{
                display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:14,border:"1px solid",cursor:"pointer",transition:"all 0.2s",textAlign:"left",
                background: selected.includes(p.id) ? "rgba(167,112,239,0.15)" : "rgba(255,255,255,0.04)",
                borderColor: selected.includes(p.id) ? "#A770EF" : "rgba(255,255,255,0.08)",
              }}>
                <Avatar name={p.name} photo={p.photo} size={38}/>
                <span style={{color:"#fff",fontWeight:600,flex:1,fontSize:14}}>{p.name}</span>
                {selected.includes(p.id) && <div style={{color:"#A770EF"}}><Icon name="check" size={18}/></div>}
              </button>
            ))}

            {showNewPlayer ? (
              <div style={{display:"flex",gap:8,padding:"10px 14px",borderRadius:14,border:"1px solid rgba(167,112,239,0.4)",background:"rgba(167,112,239,0.08)"}}>
                <input
                  autoFocus
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter") handleAddNewPlayer(); if(e.key==="Escape") setShowNewPlayer(false); }}
                  placeholder="Nom du nouveau joueur"
                  style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}
                />
                <button onClick={handleAddNewPlayer} style={{background:"#A770EF",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>OK</button>
                <button onClick={() => setShowNewPlayer(false)} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,padding:"6px 8px",color:"#888",cursor:"pointer",display:"flex",alignItems:"center"}}>
                  <Icon name="close" size={14}/>
                </button>
              </div>
            ) : (
              <button onClick={() => setShowNewPlayer(true)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:14,
                border:"1px dashed rgba(167,112,239,0.4)",background:"transparent",cursor:"pointer",textAlign:"left",
              }}>
                <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(167,112,239,0.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#A770EF",flexShrink:0}}>
                  <Icon name="plus" size={18}/>
                </div>
                <span style={{color:"#A770EF",fontWeight:600,fontSize:14}}>Nouveau joueur</span>
              </button>
            )}
          </div>
        </Section>

        {/* GO button */}
        <button
          disabled={!canPlay}
          onClick={() => onGoRanking(gameId, selected)}
          style={{
            width:"100%",padding:"18px",marginTop:8,
            background: canPlay ? "linear-gradient(135deg,#f7971e,#ffd200)" : "rgba(255,255,255,0.08)",
            border:"none",borderRadius:16,
            color: canPlay ? "#111" : "#555",
            fontSize:17,fontWeight:800,cursor: canPlay ? "pointer":"not-allowed",
            fontFamily:"'Syne',sans-serif",transition:"all 0.3s",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          }}>
          {canPlay ? <><Icon name="play" size={18}/> C'est parti !</> : "Sélectionne un jeu et des joueurs"}
        </button>
      </div>
    </div>
  );
}

// ─── RANKING VIEW ─────────────────────────────────────────────────────────────
function RankingView({ selectedPlayers, gameId, games, players, onSave, onReplay, onBack, onBackToMenu, onCorrect }) {
  const game = games.find(g => g.id === gameId);
  const playerObjs = selectedPlayers.map(id => players.find(p => p.id === id)).filter(Boolean);
  const n = playerObjs.length;

  // ranking[0] = last place player id, ranking[n-1] = first place player id
  const [ranking, setRanking] = useState(Array(n).fill(null));
  const [podium, setPodium] = useState(false);
  const [saved, setSaved] = useState(false);

  const assignedIds = ranking.filter(Boolean);
  const unassigned = playerObjs.filter(p => !assignedIds.includes(p.id));

  const selectForPlace = (placeIndex, playerId) => {
    setRanking(prev => {
      const next = [...prev];
      // Remove this player from any other slot
      for (let i = 0; i < next.length; i++) {
        if (next[i] === playerId) next[i] = null;
      }
      next[placeIndex] = playerId;
      return next;
    });
  };

  const clearSlot = (placeIndex) => {
    setRanking(prev => { const next=[...prev]; next[placeIndex]=null; return next; });
  };

  const allFilled = ranking.every(Boolean);

  const handleSave = () => {
    if (saved) return;
    const winner = ranking[n-1];
    onSave({
      gameId,
      players: playerObjs.map(p => ({ id: p.id })),
      winner,
      ranking: [...ranking].reverse(),
    });
    setSaved(true);
  };

  // Auto-show podium preview as soon as all players are ranked (don't save yet)
  useEffect(() => {
    if (allFilled && !podium) {
      setPodium(true);
    }
  }, [allFilled]);

  // Places from last to first for display
  const places = Array.from({ length: n }, (_, i) => ({
    placeNum: n - i,        // last place first
    rankIndex: i,           // index in ranking array
    label: n - i === 1 ? "🥇 1ère place" : n - i === 2 ? "🥈 2ème place" : n - i === 3 ? "🥉 3ème place" : `${n - i}ème place`,
  })).reverse(); // now first to last

  if (podium) {
    // ranking reversed: index 0 = 1st place
    const finalRanking = [...ranking].reverse();
    const first = players.find(p => p.id === finalRanking[0]);
    const second = finalRanking[1] ? players.find(p => p.id === finalRanking[1]) : null;
    const third = finalRanking[2] ? players.find(p => p.id === finalRanking[2]) : null;
    const rest = finalRanking.slice(3).map(id => players.find(p => p.id === id)).filter(Boolean);

    return (
      <div style={{minHeight:"100vh",background:"#060612",fontFamily:"'DM Sans',sans-serif",maxWidth:480,margin:"0 auto",overflowY:"auto"}}>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
        <style>{`
          *{box-sizing:border-box}::-webkit-scrollbar{display:none}
          @keyframes popIn{0%{transform:scale(0.5) translateY(30px);opacity:0}70%{transform:scale(1.08) translateY(-4px)}100%{transform:scale(1) translateY(0);opacity:1}}
          @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
          @keyframes shimmer{0%,100%{opacity:0.7}50%{opacity:1}}
        `}</style>

        {/* Confetti */}
        <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
          {Array.from({length:18}).map((_,i) => (
            <div key={i} style={{
              position:"absolute",
              left:`${(i*7+5)%100}%`,
              top:"-20px",
              width:8,height:8+(i%3)*4,
              borderRadius:i%2===0?2:"50%",
              background:["#FFD700","#A770EF","#4ECDC4","#FF6B6B","#ffd200","#CF8BF3"][i%6],
              animation:`confettiFall ${2+i*0.15}s ease-in ${i*0.12}s forwards`,
            }}/>
          ))}
        </div>

        <div style={{position:"relative",zIndex:1,padding:"52px 20px 40px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:13,color:"#A770EF",fontWeight:600,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{game?.name}</div>
            <h2 style={{margin:0,fontSize:28,fontWeight:800,color:"#fff",fontFamily:"'Poppins',sans-serif"}}>Résultats 🎉</h2>
          </div>

          {/* Podium */}
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:12,marginBottom:32,padding:"0 8px"}}>
            {/* 2nd */}
            {second && (
              <div style={{flex:1,textAlign:"center",animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both"}}>
                <Avatar name={second.name} size={52} style={{margin:"0 auto 8px"}}/>
                <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><Avatar name={second.name} photo={second.photo} size={52}/></div>
                <div style={{color:"#C0C0C0",fontWeight:800,fontSize:14,fontFamily:"'Syne',sans-serif",marginBottom:4}}>{second.name}</div>
                <div style={{background:"linear-gradient(180deg,#9e9e9e,#616161)",borderRadius:"12px 12px 0 0",padding:"20px 0 0",marginTop:8}}>
                  <div style={{fontSize:28}}>🥈</div>
                  <div style={{color:"#fff",fontWeight:800,fontSize:18,fontFamily:"'Syne',sans-serif",paddingBottom:12}}>2</div>
                </div>
              </div>
            )}
            {/* 1st */}
            {first && (
              <div style={{flex:1,textAlign:"center",animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0s both"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><Avatar name={first.name} photo={first.photo} size={64}/></div>
                <div style={{color:"#FFD700",fontWeight:800,fontSize:15,fontFamily:"'Syne',sans-serif",marginBottom:4}}>{first.name}</div>
                <div style={{background:"linear-gradient(180deg,#f7971e,#ffd200)",borderRadius:"12px 12px 0 0",padding:"24px 0 0",marginTop:8}}>
                  <div style={{fontSize:32}}>👑</div>
                  <div style={{color:"#111",fontWeight:800,fontSize:22,fontFamily:"'Syne',sans-serif",paddingBottom:12}}>1</div>
                </div>
              </div>
            )}
            {/* 3rd */}
            {third && (
              <div style={{flex:1,textAlign:"center",animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><Avatar name={third.name} photo={third.photo} size={44}/></div>
                <div style={{color:"#CD7F32",fontWeight:800,fontSize:13,fontFamily:"'Syne',sans-serif",marginBottom:4}}>{third.name}</div>
                <div style={{background:"linear-gradient(180deg,#cd7f32,#8B4513)",borderRadius:"12px 12px 0 0",padding:"14px 0 0",marginTop:8}}>
                  <div style={{fontSize:24}}>🥉</div>
                  <div style={{color:"#fff",fontWeight:800,fontSize:16,fontFamily:"'Syne',sans-serif",paddingBottom:12}}>3</div>
                </div>
              </div>
            )}
          </div>

          {/* Rest of ranking */}
          {rest.length > 0 && (
            <div style={{marginBottom:28}}>
              <div style={{fontSize:12,color:"#666",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:10,textAlign:"center"}}>Autres joueurs</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {rest.map((p, i) => (
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14}}>
                    <div style={{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",color:"#555",fontWeight:800,fontFamily:"'Syne',sans-serif",fontSize:14}}>#{i+4}</div>
                    <Avatar name={p.name} photo={p.photo} size={36}/>
                    <span style={{color:"#aaa",fontWeight:600,fontSize:14}}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {!saved ? (
              <>
                <button onClick={handleSave} style={{
                  width:"100%",padding:"16px",
                  background:"linear-gradient(135deg,#4ECDC4,#44A08D)",
                  border:"none",borderRadius:16,color:"#fff",fontSize:15,fontWeight:800,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  fontFamily:"'Syne',sans-serif",
                }}>
                  <Icon name="check" size={18}/> Valider les résultats
                </button>
                <button onClick={() => { setRanking(Array(n).fill(null)); setPodium(false); }} style={{
                  width:"100%",padding:"16px",
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,color:"#aaa",fontSize:14,fontWeight:600,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  fontFamily:"'Syne',sans-serif",
                }}>
                  <Icon name="back" size={15}/> Corriger le classement
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setRanking(Array(n).fill(null)); setPodium(false); setSaved(false); }} style={{
                  width:"100%",padding:"16px",
                  background:"linear-gradient(135deg,#A770EF,#4A00E0)",
                  border:"none",borderRadius:16,color:"#fff",fontSize:15,fontWeight:800,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  fontFamily:"'Syne',sans-serif",
                }}>
                  <Icon name="refresh" size={18}/> Rejouer
                </button>
                <button onClick={onBackToMenu} style={{
                  width:"100%",padding:"16px",
                  background:"rgba(255,255,255,0.07)",
                  border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,color:"#aaa",fontSize:15,fontWeight:700,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  fontFamily:"'Syne',sans-serif",
                }}>
                  <Icon name="back" size={16}/> Retour au menu
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"#060612",fontFamily:"'DM Sans',sans-serif",maxWidth:480,margin:"0 auto",overflowY:"auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{display:none}`}</style>

      <div style={{padding:"52px 20px 40px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:12,padding:"8px 12px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:6,marginBottom:24,fontSize:13,fontWeight:600}}>
          <Icon name="back" size={16}/> Retour
        </button>
        <div style={{marginBottom:4}}>
          <div style={{fontSize:13,color:"#A770EF",fontWeight:600,letterSpacing:1,marginBottom:4}}>{game?.name}</div>
          <h2 style={{margin:0,fontSize:24,fontWeight:800,color:"#fff",fontFamily:"'Poppins',sans-serif"}}>Classement de la partie</h2>
        </div>
        <p style={{margin:"8px 0 28px",color:"#888",fontSize:14}}>Assigne chaque joueur à sa place finale</p>

        {/* Place slots — from 1st to last */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
          {places.map(({ placeNum, rankIndex, label }) => {
            const assignedId = ranking[rankIndex];
            const assignedPlayer = assignedId ? players.find(p => p.id === assignedId) : null;
            const isTop3 = placeNum <= 3;

            return (
              <div key={placeNum}>
                <div style={{fontSize:12,color: placeNum===1?"#FFD700":placeNum===2?"#C0C0C0":placeNum===3?"#CD7F32":"#666",fontWeight:700,marginBottom:6,letterSpacing:0.5}}>{label}</div>
                {assignedPlayer ? (
                  <div style={{
                    display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
                    background: placeNum===1?"rgba(247,151,30,0.15)":placeNum===2?"rgba(192,192,192,0.1)":placeNum===3?"rgba(205,127,50,0.1)":"rgba(255,255,255,0.05)",
                    border: `1px solid ${placeNum===1?"rgba(255,210,0,0.4)":placeNum===2?"rgba(192,192,192,0.3)":placeNum===3?"rgba(205,127,50,0.3)":"rgba(255,255,255,0.08)"}`,
                    borderRadius:14,
                  }}>
                    <Avatar name={assignedPlayer.name} photo={assignedPlayer.photo} size={40}/>
                    <span style={{color:"#fff",fontWeight:700,flex:1,fontSize:15,fontFamily:"'Syne',sans-serif"}}>{assignedPlayer.name}</span>
                    <button onClick={() => clearSlot(rankIndex)} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,padding:6,cursor:"pointer",color:"#888",display:"flex"}}>
                      <Icon name="close" size={14}/>
                    </button>
                  </div>
                ) : (
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {unassigned.length === 0 ? (
                      <div style={{color:"#555",fontSize:13,padding:"8px 0"}}>Tous les joueurs sont placés</div>
                    ) : unassigned.map(p => (
                      <button key={p.id} onClick={() => selectForPlace(rankIndex, p.id)} style={{
                        display:"flex",alignItems:"center",gap:8,padding:"8px 12px",
                        borderRadius:20,border:"1px dashed rgba(167,112,239,0.4)",
                        background:"rgba(167,112,239,0.07)",cursor:"pointer",
                      }}>
                        <Avatar name={p.name} photo={p.photo} size={24}/>
                        <span style={{color:"#ccc",fontSize:13,fontWeight:600}}>{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!allFilled && (
          <div style={{textAlign:"center",padding:"12px 0",color:"#666",fontSize:14}}>
            Place tous les joueurs pour voir le podium
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INPUT MODAL ──────────────────────────────────────────────────────────────
function InputModal({ title, placeholder, emoji, onClose, onSubmit }) {
  const [val, setVal] = useState("");
  return (
    <Modal title={title} onClose={onClose}>
      <div style={{display:"flex",gap:10}}>
        <div style={{width:48,height:48,background:"rgba(255,255,255,0.06)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{emoji}</div>
        <input autoFocus value={val} onChange={e=>setVal(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&val.trim()&&onSubmit(val.trim())}
          placeholder={placeholder}
          style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"0 14px",color:"#fff",fontSize:15,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
      </div>
      <button onClick={() => val.trim() && onSubmit(val.trim())} style={{
        width:"100%",marginTop:14,padding:"15px",
        background: val.trim() ? "linear-gradient(135deg,#A770EF,#CF8BF3)" : "rgba(255,255,255,0.08)",
        border:"none",borderRadius:14,color: val.trim() ? "#fff":"#555",fontSize:15,fontWeight:700,cursor: val.trim()?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif",
      }}>Ajouter</button>
    </Modal>
  );
}

// ─── SECTION ──────────────────────────────────────────────────────────────────
function Section({ title, done, children }) {
  return (
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <span style={{fontSize:15,fontWeight:700,color: done?"#4ECDC4":"#ccc",fontFamily:"'Syne',sans-serif"}}>{title}</span>
        {done && <div style={{color:"#4ECDC4"}}><Icon name="check" size={14}/></div>}
      </div>
      {children}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ icon, text, sub, children }) {
  return (
    <div style={{textAlign:"center",padding:"48px 20px"}}>
      <div style={{color:"rgba(167,112,239,0.4)",marginBottom:16,display:"flex",justifyContent:"center"}}><Icon name={icon} size={48}/></div>
      <div style={{color:"#fff",fontWeight:700,fontSize:17,fontFamily:"'Syne',sans-serif",marginBottom:6}}>{text}</div>
      <div style={{color:"#666",fontSize:14}}>{sub}</div>
      {children}
    </div>
  );
}
