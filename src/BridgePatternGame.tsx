import React, { useState, useEffect } from 'react';
import { Sword, Zap, Shield, Heart, Trophy, X, Check, ArrowUp } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  icon: string;
  bonus: string;
  colorFrom: string;
  colorTo: string;
}

interface Weapon {
  id: string;
  name: string;
  icon: string;
  power: number;
}

interface Enemy {
  id: string;
  name: string;
  icon: string;
  hp: number;
  weakness: string;
  color: string;
}

const BridgePatternGame: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'explanation' | 'win' | 'lose'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(25); // Start with 25 seconds
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);

  // Added 'Bárbaro' for the Axe (Hacha)
  const characters: Character[] = [
    { id: 'warrior', name: 'Guerrero', icon: '🛡️', bonus: 'espada', colorFrom: 'from-red-500', colorTo: 'to-red-700' },
    { id: 'mage', name: 'Mago', icon: '🧙', bonus: 'varita', colorFrom: 'from-purple-500', colorTo: 'to-purple-700' },
    { id: 'thief', name: 'Ladrón', icon: '🥷', bonus: 'daga', colorFrom: 'from-gray-600', colorTo: 'to-gray-800' },
    { id: 'archer', name: 'Arquero', icon: '🏹', bonus: 'arco', colorFrom: 'from-green-500', colorTo: 'to-green-700' },
    { id: 'barbarian', name: 'Bárbaro', icon: '🦁', bonus: 'hacha', colorFrom: 'from-orange-500', colorTo: 'to-orange-700' }
  ];

  const weapons: Weapon[] = [
    { id: 'espada', name: 'Espada', icon: '⚔️', power: 10 },
    { id: 'varita', name: 'Varita', icon: '✨', power: 12 },
    { id: 'arco', name: 'Arco', icon: '🏹', power: 11 },
    { id: 'daga', name: 'Daga', icon: '🗡️', power: 9 },
    { id: 'hacha', name: 'Hacha', icon: '🪓', power: 13 }
  ];

  const enemies: Enemy[] = [
    { id: 'goblin', name: 'Goblin', icon: '👺', hp: 15, weakness: 'espada', color: 'from-green-700 to-green-900' },
    { id: 'dragon', name: 'Dragón', icon: '🐉', hp: 22, weakness: 'varita', color: 'from-red-700 to-red-900' },
    { id: 'skeleton', name: 'Esqueleto', icon: '💀', hp: 18, weakness: 'hacha', color: 'from-gray-600 to-gray-800' },
    { id: 'orc', name: 'Orco', icon: '👹', hp: 20, weakness: 'daga', color: 'from-orange-700 to-orange-900' },
    { id: 'wolf', name: 'Lobo', icon: '🐺', hp: 12, weakness: 'arco', color: 'from-blue-700 to-blue-900' }
  ];

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0 && !isAttacking) {
      timer = window.setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('lose');
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, isAttacking]);

  const generateEnemy = () => {
    // Filter out the current enemy to avoid consecutive duplicates
    const availableEnemies = enemy 
      ? enemies.filter(e => e.id !== enemy.id) 
      : enemies;
      
    const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    setEnemy(randomEnemy);
    setSelectedCharacter(null);
    setSelectedWeapon(null);
    setFeedback('');
    setIsAttacking(false);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTimeLeft(25); // Set initial time to 25s
    setStreak(0);
    generateEnemy();
  };

  const getActiveBonuses = () => {
    let bonuses = { combo: false, weakness: false, totalDamage: 0 };
    if (!selectedWeapon) return bonuses;
    
    let dmg = selectedWeapon.power;
    
    if (selectedCharacter && selectedCharacter.bonus === selectedWeapon.id) {
      bonuses.combo = true;
      dmg += 5;
    }
    
    if (enemy && selectedWeapon.id === enemy.weakness) {
      bonuses.weakness = true;
      dmg += 8;
    }
    
    bonuses.totalDamage = dmg;
    return bonuses;
  };

  const attack = () => {
    if (!selectedCharacter || !selectedWeapon || !enemy || isAttacking) return;
    
    setIsAttacking(true);
    const { totalDamage, combo, weakness } = getActiveBonuses();
    let bonusPoints = 0;
    let currentFeedback = '';

    if (combo) {
      bonusPoints += 15;
      currentFeedback += `💥 COMBO! `;
    }

    if (weakness) {
      bonusPoints += 15;
      currentFeedback += `🎯 DEBILIDAD! `;
    }

    // Si mata al enemigo
    if (totalDamage >= enemy.hp) {
      const points = 50 + bonusPoints + (streak * 10);
      const newScore = score + points;
      const newLevel = level + 1;
      
      setScore(newScore);
      setStreak(prev => prev + 1);
      
      let victoryMsg = `✅ +${points} pts`;
      
      if (newScore >= level * 200) {
        setLevel(newLevel);
        setTimeLeft(prev => prev + 20); // Add 20s on level up
        victoryMsg += `\n🎉 NIVEL UP!`;
      }
      
      setFeedback(currentFeedback ? `${currentFeedback} ${victoryMsg}` : victoryMsg);

      setTimeout(generateEnemy, 1500);
    } else {
      setStreak(0);
      setFeedback(`❌ Fallaste (${totalDamage} daño). El ${enemy.name} tiene ${enemy.hp} HP.`);
      setIsAttacking(false);
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 max-w-md w-full border border-white/20 shadow-2xl flex flex-col gap-8 z-10">
          <div className="text-center">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              BRIDGE
            </h1>
            <p className="text-2xl font-light text-purple-200 tracking-widest uppercase">Legends</p>
          </div>

          <div className="bg-black/30 rounded-2xl p-6 border border-white/10 text-center">
            <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <p className="text-purple-100 font-medium leading-relaxed">
              Domina el <strong>Patrón Bridge</strong> combinando héroes y armas legendarias.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 active:scale-95 text-white font-bold py-5 px-6 rounded-2xl text-xl shadow-lg shadow-blue-900/40 border border-white/20 transition-all flex items-center justify-center gap-3"
            >
              <span>⚔️</span> Jugar Ahora
            </button>
            <button
              onClick={() => setGameState('explanation')}
              className="w-full bg-slate-800/50 hover:bg-slate-700/50 active:scale-95 text-slate-300 font-semibold py-4 px-6 rounded-2xl text-lg border border-white/10 transition-all"
            >
              📖 Aprender Teoría
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'explanation') {
    return (
      <div className="min-h-screen bg-slate-900 p-4 pb-24 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 sticky top-0 z-10 shadow-xl bg-slate-900/80">
            <h1 className="text-3xl font-bold text-white text-center">🌉 Teoría</h1>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                <X className="w-6 h-6" /> El Problema
              </h2>
              <p className="text-gray-300 mb-4">La herencia tradicional crea demasiadas combinaciones:</p>
              <div className="bg-black/40 p-4 rounded-xl space-y-2 font-mono text-sm text-red-200">
                <div className="opacity-50">GuerreroConEspada</div>
                <div className="opacity-75">GuerreroConHacha</div>
                <div className="opacity-100 font-bold">BárbaroConHacha...</div>
                <div className="text-center text-xs mt-2 text-gray-500">¡Explosión de clases! 💥</div>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <Check className="w-6 h-6" /> La Solución
              </h2>
              <div className="flex flex-col gap-3">
                 <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-500/30">
                    <strong className="text-indigo-300 block text-lg mb-1">Abstracción</strong>
                    <span className="text-gray-400 text-sm">El Personaje (Guerrero, Bárbaro...)</span>
                 </div>
                 <div className="flex justify-center"><ArrowUp className="text-gray-600 animate-bounce" /></div>
                 <div className="bg-orange-500/20 p-4 rounded-xl border border-orange-500/30">
                    <strong className="text-orange-300 block text-lg mb-1">Implementación</strong>
                    <span className="text-gray-400 text-sm">El Arma (Espada, Hacha...)</span>
                 </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setGameState('menu')}
            className="fixed bottom-6 left-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-2xl border-t border-white/20 z-50 text-lg"
          >
            Entendido, ¡A jugar!
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'lose' || gameState === 'win') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-8 max-w-sm w-full border border-white/10 text-center shadow-2xl">
          <div className="text-8xl mb-6 filter drop-shadow-lg animate-bounce">
            {gameState === 'win' ? '🏆' : '☠️'}
          </div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-wide">
            {gameState === 'win' ? 'Victoria' : 'Derrota'}
          </h2>
          <div className="py-8 my-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-white/5 shadow-inner">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">
              {score}
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Puntuación Final</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="w-full bg-white text-slate-900 font-bold py-5 rounded-2xl text-xl shadow-lg active:scale-95 transition-transform"
            >
              Reintentar
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="w-full text-slate-500 font-bold py-4 rounded-2xl hover:text-white transition-colors"
            >
              Salir al Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing state
  const activeBonuses = getActiveBonuses();
  
  return (
    <div className="min-h-screen bg-slate-950 pb-40 relative">
      
      {/* Top HUD */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-5 py-4 shadow-2xl flex justify-between items-center">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
            <span className="font-black text-white text-xl leading-none font-mono">{score}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nivel</span>
             <span className="font-black text-blue-400 text-xl leading-none font-mono">{level}</span>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-slate-900 ${timeLeft <= 10 ? 'animate-pulse border-red-500/50 bg-red-900/20' : ''}`}>
          <span className={`font-mono font-bold text-xl ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-bold">s</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-5 space-y-6">
        
        {/* Enemy Card - Focal Point */}
        {enemy && (
          <div className={`relative bg-gradient-to-br ${enemy.color} rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 transform`}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className="text-7xl mb-2 drop-shadow-md">{enemy.icon}</div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-1">{enemy.name}</h2>
                
                <div className="flex items-center gap-4 mt-2 bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                   <div className="flex items-center gap-1.5">
                      <Heart className="w-5 h-5 text-red-400 fill-current" />
                      <span className="font-bold text-white">{enemy.hp}</span>
                   </div>
                   <div className="w-px h-6 bg-white/20"></div>
                   <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-300 uppercase font-bold">Débil a:</span>
                      <span className="text-xl">{weapons.find(w => w.id === enemy.weakness)?.icon}</span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Feedback Message Overlay */}
        {feedback && (
           <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm pointer-events-none">
            <div className={`rounded-2xl p-4 text-center font-black shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-4 fade-in duration-300 ${feedback.includes('❌') ? 'bg-red-500/80 text-white border-red-400' : 'bg-green-500/80 text-white border-green-400'}`}>
              <span className="drop-shadow-sm text-lg">{feedback}</span>
            </div>
          </div>
        )}

        {/* Characters Grid (2 Columns = Big Buttons) */}
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase mb-3 flex items-center gap-2 pl-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> 
            Personaje (Abstracción)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {characters.map(char => {
              const isSelected = selectedCharacter?.id === char.id;
              const isBonus = selectedWeapon && char.bonus === selectedWeapon.id;
              
              return (
                <button
                  key={char.id}
                  onClick={() => !isAttacking && setSelectedCharacter(char)}
                  className={`relative h-28 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? `bg-gradient-to-br ${char.colorFrom} ${char.colorTo} ring-4 ring-white/20 scale-[1.02] shadow-xl z-10`
                      : 'bg-slate-800/60 border border-white/5 hover:bg-slate-800'
                  }`}
                >
                  <div className={`text-4xl mb-2 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                    {char.icon}
                  </div>
                  <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {char.name}
                  </div>
                  
                  {/* Bonus Badge */}
                  {isBonus && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Zap className="w-3 h-3 text-black fill-current" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Weapons Grid (3 Columns = Medium/Large Buttons) */}
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase mb-3 flex items-center gap-2 pl-1">
             <span className="w-2 h-2 rounded-full bg-orange-500"></span>
             Arma (Implementación)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {weapons.map(weapon => {
              const isSelected = selectedWeapon?.id === weapon.id;
              const isWeakness = enemy && weapon.id === enemy.weakness;

              return (
                <button
                  key={weapon.id}
                  onClick={() => !isAttacking && setSelectedWeapon(weapon)}
                  className={`relative h-24 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 ring-4 ring-white/20 scale-[1.02] shadow-xl z-10'
                      : 'bg-slate-800/60 border border-white/5 hover:bg-slate-800'
                  }`}
                >
                  <div className={`text-3xl mb-1 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                    {weapon.icon}
                  </div>
                  <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {weapon.power} DMG
                  </div>

                  {/* Weakness Indicator */}
                  {isWeakness && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Action Button with 3D effect */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-50">
        <button
          onClick={attack}
          disabled={!selectedCharacter || !selectedWeapon || isAttacking}
          className={`w-full h-16 rounded-2xl text-xl font-black uppercase tracking-wide shadow-2xl transition-all active:scale-[0.98] active:translate-y-1 flex items-center justify-center gap-3 relative overflow-hidden group
            ${!selectedCharacter || !selectedWeapon || isAttacking
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border-2 border-slate-700' 
              : activeBonuses.combo || activeBonuses.weakness
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 border-b-4 border-orange-700 shadow-orange-500/20'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-b-4 border-indigo-800 shadow-blue-500/30'
            }`}
        >
          {isAttacking ? (
             <span className="animate-pulse">⚔️ Resolviendo...</span>
          ) : !selectedCharacter || !selectedWeapon ? (
             <span className="opacity-50">Elige tu equipo</span>
          ) : (
             <>
               <div className="relative z-10 flex items-center gap-2">
                 <span>ATACAR</span>
                 {activeBonuses.totalDamage > 0 && (
                   <span className="bg-black/20 px-2 py-0.5 rounded text-sm font-mono">
                     {activeBonuses.totalDamage}
                   </span>
                 )}
               </div>
               
               {/* Shine effect animation */}
               <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
             </>
          )}
        </button>
      </div>

    </div>
  );
};

export default BridgePatternGame;
