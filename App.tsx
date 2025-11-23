import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Zap, Award, CheckCircle, XCircle, Volume2, Lock, RotateCcw, Target, X } from 'lucide-react';
import { THEMES, CATEGORIES, ACHIEVEMENTS } from './constants';
import { UserProgress, Language, GameState, Question, CategoryId } from './types';
import { generateLesson } from './services/lessonService';
import { Button } from './components/Button';
import { OptionCard } from './components/OptionCard';

// Initial State defaults
const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  lastLoginDate: '',
  lessonsCompleted: 0,
  completedCategories: {},
  claimedAchievements: []
};

const SESSION_STORAGE_KEY = 'ancestral_lingo_active_session';

export default function App() {
  // --- Global State ---
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [gameState, setGameState] = useState<GameState>({
    view: 'home',
    activeLanguage: null,
    activeCategory: null,
    hearts: 5,
    currentLessonXP: 0
  });

  // --- UI State ---
  const [showGoals, setShowGoals] = useState(false);

  // --- Lesson State ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lessonStatus, setLessonStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isLessonComplete, setIsLessonComplete] = useState(false);

  // --- Matching Game State ---
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // List of pair IDs resolved
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null); // ID of currently clicked card
  const [matchingError, setMatchingError] = useState<string | null>(null);

  // --- Persistence: User Progress ---
  useEffect(() => {
    const saved = localStorage.getItem('ancestral_lingo_progress_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toDateString();
        const last = parsed.lastLoginDate;
        let newStreak = parsed.streak;
        
        if (last !== today) {
           const yesterday = new Date();
           yesterday.setDate(yesterday.getDate() - 1);
           if (last !== yesterday.toDateString()) {
             // Logic to reset streak could go here, keeping simple for now
           }
        }
        
        // Merge with defaults for new fields (backward compatibility)
        setProgress({ ...INITIAL_PROGRESS, ...parsed, streak: newStreak });
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ancestral_lingo_progress_v2', JSON.stringify(progress));
  }, [progress]);

  // --- Persistence: Active Session (Auto-save) ---
  useEffect(() => {
    // Only save if we are in a lesson and it's not complete
    if (gameState.view === 'lesson' && questions.length > 0 && !isLessonComplete) {
      const sessionData = {
        gameState,
        questions,
        currentIndex,
        matchedPairs // Save matching game progress too
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    }
  }, [gameState, questions, currentIndex, isLessonComplete, matchedPairs]);

  // --- Audio Services ---
  const playText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES'; // Phonetic approximation
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Effect to auto-play audio when a listening question appears
  useEffect(() => {
    if (gameState.view === 'lesson' && questions.length > 0) {
      const currentQ = questions[currentIndex];
      if (currentQ && currentQ.type === 'listening' && currentQ.audioText) {
        const timer = setTimeout(() => playText(currentQ.audioText!), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.view, currentIndex, questions, playText]);

  const playSoundEffect = (type: 'success' | 'error' | 'click' | 'claim') => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); 
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'claim') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(1000, now + 0.2);
      osc.frequency.linearRampToValueAtTime(1500, now + 0.4);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    setTimeout(() => {
      if(ctx.state !== 'closed') ctx.close();
    }, 1000);
  };

  // --- Actions ---

  const startLesson = (lang: Language, category: CategoryId) => {
    // Check for saved session first
    const savedSessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
    
    if (savedSessionRaw) {
      try {
        const savedSession = JSON.parse(savedSessionRaw);
        // Only resume if it matches the requested language and category
        if (
          savedSession.gameState.activeLanguage === lang && 
          savedSession.gameState.activeCategory === category &&
          savedSession.gameState.view === 'lesson' // Ensure it was a valid lesson state
        ) {
          setQuestions(savedSession.questions);
          setGameState(savedSession.gameState);
          setCurrentIndex(savedSession.currentIndex);
          setMatchedPairs(savedSession.matchedPairs || []);
          
          setLessonStatus('idle');
          setSelectedOption(null);
          setSelectedPairId(null);
          setIsLessonComplete(false);
          return;
        }
      } catch (e) {
        console.error("Error parsing saved session", e);
        localStorage.removeItem(SESSION_STORAGE_KEY); // Clear corrupt data
      }
    }

    // Default: Start new lesson
    const newQuestions = generateLesson(lang, category);
    setQuestions(newQuestions);
    setGameState({
      view: 'lesson',
      activeLanguage: lang,
      activeCategory: category,
      hearts: 5,
      currentLessonXP: 0
    });
    setCurrentIndex(0);
    setLessonStatus('idle');
    setSelectedOption(null);
    setMatchedPairs([]);
    setSelectedPairId(null);
    setIsLessonComplete(false);
  };

  const handleMatchingCardClick = (cardId: string, matchId: string) => {
    playSoundEffect('click');
    setMatchingError(null);

    // If first selection
    if (!selectedPairId) {
      setSelectedPairId(cardId);
      return;
    }

    // If clicked same card
    if (selectedPairId === cardId) {
      setSelectedPairId(null);
      return;
    }

    // Find the matchId of the previously selected card
    const currentQ = questions[currentIndex];
    const previousCard = currentQ.pairs?.find(p => p.id === selectedPairId);

    if (previousCard && previousCard.matchId === matchId) {
      // Match found!
      setMatchedPairs(prev => [...prev, previousCard.matchId]);
      setSelectedPairId(null);
      playSoundEffect('success');
      
      // Check if all pairs matched
      const uniqueMatches = new Set([...matchedPairs, matchId]);
      if (uniqueMatches.size >= (currentQ.pairs?.length || 0) / 2) {
         setLessonStatus('correct');
      }
    } else {
      // Mismatch
      setMatchingError(cardId);
      playSoundEffect('error');
      setTimeout(() => {
        setSelectedPairId(null);
        setMatchingError(null);
      }, 500);
      setGameState(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
    }
  };

  const handleCheck = () => {
    if (questions[currentIndex].type === 'matching') return; // Handled by click
    if (!selectedOption || lessonStatus !== 'idle') return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    if (isCorrect) {
      setLessonStatus('correct');
      playSoundEffect('success');
    } else {
      setLessonStatus('incorrect');
      playSoundEffect('error');
      setGameState(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
    }
  };

  const handleNext = () => {
    if (gameState.hearts === 0) {
      finishLesson(false);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setLessonStatus('idle');
      setSelectedOption(null);
      setMatchedPairs([]);
      setSelectedPairId(null);
    } else {
      finishLesson(true);
    }
  };

  const finishLesson = (success: boolean) => {
    setIsLessonComplete(true);
    // Clear the active session since the lesson is over
    localStorage.removeItem(SESSION_STORAGE_KEY);

    if (success && gameState.activeLanguage && gameState.activeCategory) {
      const xpGained = 15;
      const today = new Date().toDateString();
      const isNewDay = progress.lastLoginDate !== today;
      const categoryKey = `${gameState.activeLanguage}-${gameState.activeCategory}`;
      
      setProgress(prev => ({
        ...prev,
        xp: prev.xp + xpGained,
        streak: isNewDay ? prev.streak + 1 : (prev.streak === 0 ? 1 : prev.streak),
        lastLoginDate: today,
        lessonsCompleted: prev.lessonsCompleted + 1,
        completedCategories: {
          ...prev.completedCategories,
          [categoryKey]: true
        }
      }));
      setGameState(prev => ({ ...prev, currentLessonXP: xpGained, view: 'result' }));
    } else {
       setGameState(prev => ({ ...prev, currentLessonXP: 0, view: 'result' }));
    }
  };

  const claimAchievement = (id: string, reward: number) => {
    playSoundEffect('claim');
    setProgress(prev => ({
      ...prev,
      xp: prev.xp + reward,
      claimedAchievements: [...prev.claimedAchievements, id]
    }));
  };

  const returnHome = () => {
    setGameState(prev => ({ ...prev, view: 'home', activeLanguage: null, activeCategory: null }));
  };

  const toggleLanguage = () => {
    setGameState(prev => ({ ...prev, activeLanguage: prev.activeLanguage === 'kichwa' ? 'shuar' : 'kichwa' }));
  };

  const restartLesson = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    if (gameState.activeLanguage && gameState.activeCategory) {
       startLesson(gameState.activeLanguage, gameState.activeCategory);
    }
  }

  // --- Derived Styles ---
  const activeTheme = gameState.activeLanguage ? THEMES[gameState.activeLanguage] : THEMES.kichwa;

  // --- Views ---

  const renderGoalsModal = () => {
    if (!showGoals) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
             <div className="flex items-center gap-2">
               <Target className="text-yellow-500 w-6 h-6" />
               <h2 className="text-xl font-bold text-slate-700">Metas y Logros</h2>
             </div>
             <button onClick={() => setShowGoals(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
               <X className="w-6 h-6 text-slate-400" />
             </button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
             {ACHIEVEMENTS.map((achievement) => {
               const isClaimed = progress.claimedAchievements.includes(achievement.id);
               let currentValue = 0;
               if (achievement.type === 'xp') currentValue = progress.xp;
               if (achievement.type === 'streak') currentValue = progress.streak;
               if (achievement.type === 'lessons') currentValue = progress.lessonsCompleted;

               const isCompleted = currentValue >= achievement.targetValue;
               const percent = Math.min(100, (currentValue / achievement.targetValue) * 100);
               const Icon = achievement.icon;

               return (
                 <div key={achievement.id} className={`p-4 rounded-xl border-2 flex items-center gap-4 ${isClaimed ? 'bg-yellow-50 border-yellow-200 opacity-60' : 'border-slate-100'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isCompleted || isClaimed ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                       <h3 className="font-bold text-slate-700">{achievement.title}</h3>
                       <p className="text-xs text-slate-500 mb-2">{achievement.description}</p>
                       <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                       </div>
                    </div>
                    <div>
                      {isClaimed ? (
                        <CheckCircle className="w-8 h-8 text-yellow-500" />
                      ) : isCompleted ? (
                        <button 
                          onClick={() => claimAchievement(achievement.id, achievement.xpReward)}
                          className="px-3 py-1 bg-yellow-400 border-b-4 border-yellow-600 text-yellow-900 font-bold rounded-xl text-xs active:border-b-0 active:translate-y-1 transition-all animate-bounce"
                        >
                          +{achievement.xpReward} XP
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-300">{currentValue}/{achievement.targetValue}</span>
                      )}
                    </div>
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => {
    const selectedLang = gameState.activeLanguage || 'kichwa';
    const theme = THEMES[selectedLang];

    // Check if there is an active session to visually indicate
    const savedSessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
    let savedCategory = null;
    if (savedSessionRaw) {
       try {
         const saved = JSON.parse(savedSessionRaw);
         if (saved.gameState.activeLanguage === selectedLang) {
            savedCategory = saved.gameState.activeCategory;
         }
       } catch (e) {}
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        {renderGoalsModal()}
        
        {/* Header Stats */}
        <header className="w-full bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto p-4 flex justify-between items-center">
            <div className="flex gap-2 items-center cursor-pointer" onClick={toggleLanguage}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${selectedLang === 'kichwa' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                 {selectedLang === 'kichwa' ? 'K' : 'S'}
               </div>
               <span className="font-bold text-slate-600 uppercase text-sm tracking-wider">
                 {selectedLang.toUpperCase()}
               </span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowGoals(true)} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
                <Target className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-1 text-orange-500 font-bold">
                <Zap className="w-5 h-5 fill-current" />
                <span>{progress.streak}</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500 font-bold">
                <Award className="w-5 h-5 fill-current" />
                <span>{progress.xp}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Language Toggler / Selector */}
        <div className="w-full max-w-md p-4 flex gap-2">
           <button 
             onClick={() => setGameState(prev => ({...prev, activeLanguage: 'kichwa'}))}
             className={`flex-1 p-3 rounded-xl font-bold border-b-4 transition-all ${selectedLang === 'kichwa' ? 'bg-emerald-100 text-emerald-700 border-emerald-500' : 'bg-white text-slate-400 border-slate-200'}`}
           >
             Kichwa (Sierra)
           </button>
           <button 
             onClick={() => setGameState(prev => ({...prev, activeLanguage: 'shuar'}))}
             className={`flex-1 p-3 rounded-xl font-bold border-b-4 transition-all ${selectedLang === 'shuar' ? 'bg-amber-100 text-amber-700 border-amber-500' : 'bg-white text-slate-400 border-slate-200'}`}
           >
             Shuar (Amazonía)
           </button>
        </div>

        {/* World Map / Categories */}
        <main className="w-full max-w-md flex-1 p-6 flex flex-col items-center gap-8 pb-20">
          {CATEGORIES.map((cat, index) => {
            const isCompleted = progress.completedCategories[`${selectedLang}-${cat.id}`];
            const isSaved = savedCategory === cat.id;
            const isLocked = false; 

            return (
              <div key={cat.id} className="flex flex-col items-center relative w-full group">
                <button
                  onClick={() => !isLocked && startLesson(selectedLang, cat.id)}
                  disabled={isLocked}
                  className={`
                    w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg border-b-4 transition-transform active:translate-y-1 relative z-10
                    ${isLocked ? 'bg-gray-200 border-gray-300 grayscale cursor-not-allowed' : `${theme.primary} ${theme.primaryBorder} hover:scale-105 text-white`}
                  `}
                >
                  {isCompleted ? <CheckCircle className="w-10 h-10 text-white/50" /> : cat.icon}
                  {isLocked && <Lock className="absolute w-8 h-8 text-gray-400" />}
                  {isSaved && !isCompleted && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-md">
                      REANUDAR
                    </div>
                  )}
                </button>
                
                <div className="mt-3 text-center">
                  <h3 className="font-bold text-slate-700 text-lg">{cat.title}</h3>
                  <p className={`text-xs font-bold ${theme.text} opacity-80 uppercase`}>{cat.nativeTitle}</p>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    );
  };

  const renderLesson = () => {
    const question = questions[currentIndex];
    const progressPercent = ((currentIndex) / questions.length) * 100;
    const isMatching = question.type === 'matching';

    return (
      <div className="min-h-screen bg-white flex flex-col items-center max-w-lg mx-auto relative overflow-hidden">
        {/* Top Bar */}
        <div className="w-full p-4 grid grid-cols-[auto_1fr_auto] items-center gap-4">
           <button onClick={returnHome} className="text-slate-300 hover:text-slate-400">
             <XCircle className="w-8 h-8" />
           </button>
           <div className="h-4 bg-slate-100 rounded-full w-full overflow-hidden">
             <div 
               className={`h-full ${activeTheme.progress} transition-all duration-500 ease-out`}
               style={{ width: `${progressPercent}%` }}
             ></div>
           </div>
           <div className="flex items-center gap-1 text-rose-500 font-bold text-lg">
             <Heart className="w-6 h-6 fill-current animate-pulse" />
             <span>{gameState.hearts}</span>
           </div>
        </div>

        {/* Question Area */}
        <div key={question.id} className="flex-1 w-full p-4 md:p-6 flex flex-col max-w-md overflow-y-auto">
          <h2 className="text-2xl font-bold text-slate-700 mb-6 leading-tight">
            {question.type === 'translate_to_spanish' && `Traduce esta oración:`}
            {question.type === 'listening' && `Escucha y selecciona la palabra:`}
            {question.type === 'matching' && `Selecciona los pares correctos:`}
          </h2>

          {/* Type: Listening */}
          {question.type === 'listening' && (
             <div className="flex justify-center mb-8">
               <button 
                  onClick={() => playText(question.audioText || '')}
                  className={`${activeTheme.primary} w-32 h-32 rounded-2xl flex items-center justify-center shadow-lg border-b-4 ${activeTheme.primaryBorder} active:translate-y-1 transition-all`}
               >
                 <Volume2 className="w-16 h-16 text-white" />
               </button>
             </div>
          )}

          {/* Type: Text Translation */}
          {(question.type === 'translate_to_spanish') && (
            <div className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-2xl mb-8">
              <button 
                onClick={() => playText(question.audioText || '')}
                className={`p-3 rounded-xl bg-slate-100 ${activeTheme.text} hover:bg-slate-200`}
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-slate-400 uppercase">Kichwa / Shuar</span>
                 <span className="text-xl font-bold text-slate-700">{question.question}</span>
              </div>
            </div>
          )}

          {/* Options: Multiple Choice */}
          {!isMatching && (
            <div className="grid grid-cols-1 gap-3 w-full">
              {question.options?.map((opt, idx) => {
                let animationClass = "";
                // Animation logic for MC
                if (lessonStatus === 'correct' && opt === question.correctAnswer) {
                  animationClass = "animate-bounce-sm";
                } else if (lessonStatus === 'incorrect' && selectedOption === opt) {
                  animationClass = "animate-shake";
                }

                return (
                  <OptionCard 
                    key={idx}
                    text={opt}
                    selected={selectedOption === opt}
                    correct={lessonStatus === 'idle' ? null : (opt === question.correctAnswer ? true : (selectedOption === opt ? false : null))}
                    className={animationClass}
                    onClick={() => {
                       if(lessonStatus === 'idle') {
                         setSelectedOption(opt);
                         playText(opt); 
                       }
                    }}
                    disabled={lessonStatus !== 'idle'}
                    shortcut={idx + 1}
                  />
                );
              })}
            </div>
          )}

          {/* Options: Matching Game */}
          {isMatching && question.pairs && (
            <div className="grid grid-cols-2 gap-3 w-full">
              {question.pairs.map((card) => {
                const isMatched = matchedPairs.includes(card.matchId);
                const isSelected = selectedPairId === card.id;
                const isError = matchingError === card.id;

                if (isMatched) return <div key={card.id} className="h-20" />; // Spacer

                return (
                  <div
                    key={card.id}
                    onClick={() => handleMatchingCardClick(card.id, card.matchId)}
                    className={`
                      h-20 rounded-xl border-2 border-b-4 font-bold text-lg transition-all cursor-pointer
                      flex items-center justify-between px-3 text-center leading-tight relative group select-none
                      ${isSelected 
                        ? 'bg-sky-100 border-sky-400 text-sky-700' 
                        : isError 
                          ? 'bg-red-100 border-red-400 text-red-700 animate-shake' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    <span className="flex-1 text-center">{card.text}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        playText(card.text);
                      }}
                      className="p-1.5 rounded-full hover:bg-black/5 text-current opacity-50 hover:opacity-100 transition-all ml-1 shrink-0"
                      aria-label="Escuchar pronunciación"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom Action Area */}
        <div className={`w-full p-6 border-t-2 ${lessonStatus === 'correct' ? 'bg-lime-100 border-lime-200' : (lessonStatus === 'incorrect' ? 'bg-red-100 border-red-200' : 'bg-white border-slate-100')}`}>
           <div className="max-w-md mx-auto flex items-center justify-between">
              {lessonStatus === 'idle' && !isMatching && (
                <Button 
                  fullWidth 
                  onClick={handleCheck} 
                  disabled={!selectedOption}
                  colorClass={activeTheme.primary}
                  borderColorClass={activeTheme.primaryBorder}
                >
                  COMPROBAR
                </Button>
              )}
               {lessonStatus === 'idle' && isMatching && (
                 <div className="text-slate-400 text-sm font-bold w-full text-center uppercase tracking-widest">
                   Encuentra los pares
                 </div>
               )}

              {lessonStatus === 'correct' && (
                <div className="flex justify-between items-center w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
                   <div className="flex items-center gap-3">
                      <div className="bg-lime-500 rounded-full p-2">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lime-800 font-extrabold text-xl">¡Excelente!</span>
                      </div>
                   </div>
                   <Button variant="secondary" onClick={handleNext}>CONTINUAR</Button>
                </div>
              )}

              {lessonStatus === 'incorrect' && (
                 <div className="flex justify-between items-center w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="flex items-center gap-3">
                       <div className="bg-red-500 rounded-full p-2">
                         <XCircle className="w-8 h-8 text-white" />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-red-800 font-extrabold text-xl">Solución:</span>
                         <span className="text-red-700 font-medium text-sm">{question.correctAnswer || "Inténtalo de nuevo"}</span>
                       </div>
                    </div>
                    <Button variant="danger" onClick={handleNext}>ENTENDIDO</Button>
                 </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const isSuccess = gameState.currentLessonXP > 0;
    
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
        <div className="mb-8 relative">
          {isSuccess ? (
             <>
               <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
               <div className="text-8xl animate-bounce">🎉</div>
             </>
          ) : (
            <div className="text-8xl filter grayscale opacity-50">💔</div>
          )}
        </div>

        <h1 className={`text-3xl font-extrabold mb-4 ${isSuccess ? 'text-yellow-500' : 'text-slate-400'}`}>
          {isSuccess ? '¡Nivel Completado!' : '¡Te quedaste sin vidas!'}
        </h1>
        
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
           {isSuccess ? "Has dado un gran paso para preservar esta lengua ancestral." : "No te rindas, la perseverancia es la clave del aprendizaje."}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-12">
           <div className={`p-4 rounded-2xl border-2 flex flex-col items-center ${isSuccess ? 'bg-yellow-50 border-yellow-400' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs font-bold uppercase text-slate-400 mb-1">XP Total</span>
              <span className={`text-2xl font-extrabold ${isSuccess ? 'text-yellow-600' : 'text-slate-500'}`}>{progress.xp}</span>
           </div>
           <div className={`p-4 rounded-2xl border-2 flex flex-col items-center ${isSuccess ? 'bg-orange-50 border-orange-400' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs font-bold uppercase text-slate-400 mb-1">Racha</span>
              <span className={`text-2xl font-extrabold ${isSuccess ? 'text-orange-600' : 'text-slate-500'}`}>{progress.streak} días</span>
           </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button fullWidth onClick={returnHome}>
            CONTINUAR
          </Button>
          {!isSuccess && (
            <Button fullWidth variant="ghost" onClick={restartLesson}>
              <div className="flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>INTENTAR DE NUEVO</span>
              </div>
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {gameState.view === 'home' && renderHome()}
      {gameState.view === 'lesson' && renderLesson()}
      {gameState.view === 'result' && renderResult()}
    </>
  );
}