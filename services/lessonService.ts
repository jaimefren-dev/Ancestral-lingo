import { KICHWA_DB, SHUAR_DB } from '../constants';
import { Language, Question, CategoryId } from '../types';

const shuffle = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export const generateLesson = (language: Language, category: CategoryId, questionCount: number = 8): Question[] => {
  const db = language === 'kichwa' ? KICHWA_DB : SHUAR_DB;
  const vocabList = db[category] || [];
  
  // Basic validation to prevent crashes if category is empty
  if (vocabList.length === 0) return [];

  const questions: Question[] = [];

  for (let i = 0; i < questionCount; i++) {
    const item = vocabList[Math.floor(Math.random() * vocabList.length)];
    const otherItems = vocabList.filter(v => v.native !== item.native);
    const distractors = shuffle(otherItems).slice(0, 3);
    
    let q: Question;
    const id = `q-${Date.now()}-${i}`;
    const typeRoll = Math.random();

    if (typeRoll < 0.35) {
      // Type 1: Text Translation (Native -> Spanish)
      const options = shuffle([item.spanish, ...distractors.map(d => d.spanish)]);
      q = {
        id,
        type: 'translate_to_spanish',
        question: item.native,
        correctAnswer: item.spanish,
        options,
        audioText: item.native
      };
    } else if (typeRoll < 0.6) {
      // Type 2: Listening (Audio -> Native Text Selection)
      const options = shuffle([item.native, ...distractors.map(d => d.native)]);
      q = {
        id,
        type: 'listening',
        audioText: item.native,
        correctAnswer: item.native,
        options
      };
    } else {
      // Type 3: Matching Pairs (Word Bank)
      // Pick 3-4 pairs
      const pairCount = 3;
      const roundVocab = shuffle(vocabList).slice(0, pairCount);
      const pairs: { id: string; text: string; type: 'native' | 'spanish'; matchId: string }[] = [];
      
      roundVocab.forEach((v, idx) => {
        const matchId = `pair-${idx}`;
        pairs.push({ id: `${matchId}-n`, text: v.native, type: 'native', matchId });
        pairs.push({ id: `${matchId}-s`, text: v.spanish, type: 'spanish', matchId });
      });

      q = {
        id,
        type: 'matching',
        question: 'Empareja las palabras',
        pairs: shuffle(pairs)
      };
    }

    questions.push(q);
  }

  return questions;
};