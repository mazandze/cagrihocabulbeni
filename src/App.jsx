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
  "Real Madrid", "Barcelona",
  // İngiltere - Premier League
  "Manchester United", "Manchester City", "Liverpool", "Chelsea", "Arsenal", "Tottenham",
  // İtalya - Serie A
  "Juventus", "AC Milan", "Inter Milan", "Napoli", "Roma",
  // Almanya - Bundesliga
  "Bayern Münih", "Borussia Dortmund",
  // Fransa - Ligue 1
  "Paris Saint-Germain",
  // Hollanda
  "Ajax",
  // Portekiz
  "Porto",
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
  "Real Madrid": ["Cristiano Ronaldo", "David Beckham", "Zinedine Zidane", "Luka Modric", "Karim Benzema", "Toni Kroos", "Gareth Bale", "Ronaldo Nazario", "Xabi Alonso", "Fabio Cannavaro", "Angel Di Maria", "James Rodriguez", "Alvaro Morata", "Luis Figo", "Kaka", "Robinho", "Sami Khedira", "Pepe", "Gonzalo Higuain", "Mesut Ozil"],
  Barcelona: ["Lionel Messi", "Neymar", "Luis Suarez", "Ronaldinho", "Samuel Eto'o", "Zlatan Ibrahimovic", "Thierry Henry", "Philippe Coutinho", "Antoine Griezmann", "Ronaldo Nazario", "Luis Figo", "Arturo Vidal", "Miralem Pjanic", "Frenkie de Jong", "Deco"],
  "Manchester United": ["Cristiano Ronaldo", "David Beckham", "Wayne Rooney", "Angel Di Maria", "Alexis Sanchez", "Robin van Persie", "Zlatan Ibrahimovic", "Juan Mata", "Radamel Falcao", "Henrikh Mkhitaryan", "Dimitar Berbatov", "Edinson Cavani", "Christian Eriksen", "Matthijs de Ligt", "Nani"],
  "Manchester City": ["Robinho", "Sergio Aguero", "Kevin De Bruyne", "David Silva", "Yaya Toure", "Erling Haaland", "Jack Grealish", "Edin Dzeko"],
  Liverpool: ["Fernando Torres", "Luis Suarez", "Xabi Alonso", "Philippe Coutinho", "Dirk Kuyt"],
  Chelsea: ["Fernando Torres", "Juan Mata", "David Luiz", "Diego Costa", "Alvaro Morata", "Willian", "Eden Hazard", "Radamel Falcao", "Andriy Shevchenko", "Demba Ba", "Kalidou Koulibaly", "Didier Drogba", "Deco"],
  Arsenal: ["Thierry Henry", "Robin van Persie", "Alexis Sanchez", "Mesut Ozil", "Cesc Fabregas", "Emmanuel Adebayor", "Henrikh Mkhitaryan", "David Luiz"],
  Tottenham: ["Gareth Bale", "Luka Modric", "Dimitar Berbatov", "Emmanuel Adebayor", "Christian Eriksen"],
  Juventus: ["Zinedine Zidane", "Cristiano Ronaldo", "Fabio Cannavaro", "David Trezeguet", "Paul Pogba", "Gonzalo Higuain", "Sami Khedira", "Angel Di Maria", "Arturo Vidal", "Miralem Pjanic", "Matthijs de Ligt"],
  "AC Milan": ["Zlatan Ibrahimovic", "Ronaldinho", "David Beckham", "Kaka", "Andriy Shevchenko", "Ronaldo Nazario", "Robinho"],
  "Inter Milan": ["Ronaldo Nazario", "Samuel Eto'o", "Wesley Sneijder", "Zlatan Ibrahimovic", "Christian Vieri", "Romelu Lukaku", "Arturo Vidal", "Ricardo Quaresma", "Mauro Icardi", "Edin Dzeko", "Christian Eriksen", "Henrikh Mkhitaryan"],
  Napoli: ["Marek Hamsik", "Edinson Cavani", "Gonzalo Higuain", "Kalidou Koulibaly"],
  Roma: ["Edin Dzeko", "Henrikh Mkhitaryan", "Miralem Pjanic"],
  "Paris Saint-Germain": ["Zlatan Ibrahimovic", "David Beckham", "Neymar", "Lionel Messi", "Angel Di Maria", "Thiago Silva", "Kylian Mbappe", "David Luiz", "Edinson Cavani", "Mauro Icardi"],
  "Bayern Münih": ["Robert Lewandowski", "Franck Ribery", "Arjen Robben", "Philippe Coutinho", "Jerome Boateng", "Arturo Vidal", "James Rodriguez", "Matthijs de Ligt"],
  "Borussia Dortmund": ["Robert Lewandowski", "Mario Gotze", "Ousmane Dembele", "Erling Haaland", "Jadon Sancho", "Shinji Kagawa", "Henrikh Mkhitaryan"],
  Ajax: ["Wesley Sneijder", "Luis Suarez", "Christian Eriksen", "Frenkie de Jong", "Matthijs de Ligt", "Dusan Tadic"],
  Porto: ["Deco", "Hulk", "Radamel Falcao", "Ricardo Quaresma", "James Rodriguez", "Pepe"],
  Galatasaray: ["Wesley Sneijder", "Didier Drogba", "Radamel Falcao", "Mauro Icardi"],
  Fenerbahçe: ["Robin van Persie", "Dirk Kuyt", "Nani", "Mesut Ozil", "Edin Dzeko", "Dusan Tadic"],
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
    
