import { VocabItem, Category, Achievement } from './types';
import { Zap, BookOpen, Star, Crown } from 'lucide-react';

// Categories Configuration
export const CATEGORIES: Category[] = [
  { id: 'greetings', title: 'Saludos', nativeTitle: 'Napaykuna / Chicham', icon: '👋', color: 'bg-green-500' },
  { id: 'numbers', title: 'Números', nativeTitle: 'Yupaykuna / Iwiakma', icon: '🔢', color: 'bg-blue-500' },
  { id: 'colors', title: 'Colores', nativeTitle: 'Tullpukuna / Aniamu', icon: '🎨', color: 'bg-purple-500' },
  { id: 'animals', title: 'Animales', nativeTitle: 'Wiwakuna', icon: '🐾', color: 'bg-orange-500' },
  { id: 'food', title: 'Alimentos', nativeTitle: 'Mikuna', icon: '🌽', color: 'bg-red-500' },
];

// Achievements Configuration
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'streak_3',
    title: 'Constancia',
    description: 'Alcanza una racha de 3 días',
    type: 'streak',
    targetValue: 3,
    xpReward: 50,
    icon: Zap
  },
  {
    id: 'xp_100',
    title: 'Estudiante Dedicado',
    description: 'Gana 100 XP en total',
    type: 'xp',
    targetValue: 100,
    xpReward: 30,
    icon: Star
  },
  {
    id: 'lessons_5',
    title: 'Ratón de Biblioteca',
    description: 'Completa 5 lecciones',
    type: 'lessons',
    targetValue: 5,
    xpReward: 40,
    icon: BookOpen
  },
  {
    id: 'xp_500',
    title: 'Sabio Ancestral',
    description: 'Gana 500 XP en total',
    type: 'xp',
    targetValue: 500,
    xpReward: 100,
    icon: Crown
  },
  {
    id: 'streak_7',
    title: 'Imparable',
    description: 'Alcanza una racha de 7 días',
    type: 'streak',
    targetValue: 7,
    xpReward: 150,
    icon: Zap
  }
];

type VocabDB = Record<string, VocabItem[]>;

export const KICHWA_DB: VocabDB = {
  greetings: [
    { native: "Alli punlla", spanish: "Buenos días" },
    { native: "Alli chishi", spanish: "Buenas tardes" },
    { native: "Alli tuta", spanish: "Buenas noches" },
    { native: "Imanalla", spanish: "Hola" },
    { native: "Kayan kama", spanish: "Hasta mañana" },
    { native: "Rikurinakushun", spanish: "Nos vemos" },
    { native: "Yupaychani", spanish: "Gracias" },
    { native: "Allimanta", spanish: "De nada" },
    { native: "Ari", spanish: "Sí" },
    { native: "Mana", spanish: "No" },
  ],
  numbers: [
    { native: "Shuk", spanish: "Uno" },
    { native: "Ishkay", spanish: "Dos" },
    { native: "Kimsa", spanish: "Tres" },
    { native: "Chusku", spanish: "Cuatro" },
    { native: "Pichka", spanish: "Cinco" },
    { native: "Sukta", spanish: "Seis" },
    { native: "Kanchis", spanish: "Siete" },
    { native: "Pusak", spanish: "Ocho" },
    { native: "Iskun", spanish: "Nueve" },
    { native: "Chunka", spanish: "Diez" },
    { native: "Chunka shuk", spanish: "Once" },
    { native: "Chunka ishkay", spanish: "Doce" },
    { native: "Chunka kimsa", spanish: "Trece" },
    { native: "Chunka chusku", spanish: "Catorce" },
    { native: "Chunka pichka", spanish: "Quince" },
    { native: "Ishkay chunka", spanish: "Veinte" },
  ],
  colors: [
    { native: "Puka", spanish: "Rojo" },
    { native: "Ankas", spanish: "Azul" },
    { native: "Killu", spanish: "Amarillo" },
    { native: "Waylla", spanish: "Verde" },
    { native: "Yana", spanish: "Negro" },
    { native: "Yurak", spanish: "Blanco" },
    { native: "Uchu", spanish: "Gris" },
    { native: "Chawa puka", spanish: "Rosado" },
    { native: "Chawa ankas", spanish: "Celeste" },
    { native: "Kuru", spanish: "Café" },
  ],
  animals: [
    { native: "Allku", spanish: "Perro" },
    { native: "Misi", spanish: "Gato" },
    { native: "Kuchi", spanish: "Cerdo" },
    { native: "Atallpa", spanish: "Gallina" },
    { native: "Wakra", spanish: "Vaca" },
    { native: "Chita", spanish: "Chivo" },
    { native: "Kuy", spanish: "Cuy" },
    { native: "Urpi", spanish: "Paloma" },
    { native: "Amaru", spanish: "Serpiente" },
    { native: "Anka", spanish: "Águila" },
  ],
  food: [
    { native: "Tanta", spanish: "Pan" },
    { native: "Yaku", spanish: "Agua" },
    { native: "Aycha", spanish: "Carne" },
    { native: "Lulun", spanish: "Huevo" },
    { native: "Sara", spanish: "Maíz" },
    { native: "Papa", spanish: "Papa" },
    { native: "Uchu", spanish: "Ají" },
    { native: "Kachi", spanish: "Sal" },
    { native: "Rumu", spanish: "Yuca" },
    { native: "Palanta", spanish: "Plátano" },
  ],
};

export const SHUAR_DB: VocabDB = {
  greetings: [
    { native: "Winshi", spanish: "Hola" },
    { native: "Pujamek", spanish: "Hola / Estás ahí" },
    { native: "Peñkeráiti Tsawan", spanish: "Buenos días" },
    { native: "Peñkeráiti Kashi", spanish: "Buenas noches" },
    { native: "Yuminsajme", spanish: "Gracias" },
    { native: "Weajai", spanish: "Adiós" },
    { native: "Ma ketai", spanish: "Qué pasa" },
    { native: "Shiir", spanish: "Bien" },
    { native: "Tsawant", spanish: "Día" },
    { native: "Kashi", spanish: "Noche" },
  ],
  numbers: [
    { native: "Chikíchik", spanish: "Uno" },
    { native: "Jímiar", spanish: "Dos" },
    { native: "Menaint", spanish: "Tres" },
    { native: "Aíntiuk", spanish: "Cuatro" },
    { native: "Ewéj", spanish: "Cinco" },
    { native: "Ujúk", spanish: "Seis" },
    { native: "Tsénkent", spanish: "Siete" },
    { native: "Yarúsh", spanish: "Ocho" },
    { native: "Usúmtai", spanish: "Nueve" },
    { native: "Náwe", spanish: "Diez" },
    { native: "Náwe chikíchik", spanish: "Once" },
    { native: "Náwe jímiar", spanish: "Doce" },
    { native: "Náwe menaint", spanish: "Trece" },
    { native: "Náwe aíntiuk", spanish: "Catorce" },
    { native: "Náwe ewéj", spanish: "Quince" },
    { native: "Jímiar náwe", spanish: "Veinte" },
  ],
  colors: [
    { native: "Kapáku", spanish: "Rojo" },
    { native: "Kinkia", spanish: "Azul" },
    { native: "Yunkuma", spanish: "Amarillo" },
    { native: "Samenkma", spanish: "Verde" },
    { native: "Puju", spanish: "Blanco" },
    { native: "Mukusa", spanish: "Negro" },
    { native: "Tuntú", spanish: "Gris" },
    { native: "Yamakai", spanish: "Morado" },
    { native: "Kinkiam Patin", spanish: "Celeste" },
    { native: "Sámik", spanish: "Naranja" },
  ],
  animals: [
    { native: "Yawá", spanish: "Perro" },
    { native: "Michiku", spanish: "Gato" },
    { native: "Kúchi", spanish: "Cerdo" },
    { native: "Atash", spanish: "Gallina" },
    { native: "Áyum", spanish: "Gallo" },
    { native: "Jempe", spanish: "Colibrí" },
    { native: "Namák", spanish: "Pez" },
    { native: "Pákki", spanish: "Sajino" },
    { native: "Káyu", spanish: "Guatusa" },
    { native: "Ete", spanish: "Avispa" },
  ],
  food: [
    { native: "Mama", spanish: "Yuca" },
    { native: "Inchi", spanish: "Camote" },
    { native: "Jímia", spanish: "Ají" },
    { native: "Kapántaku", spanish: "Tomate" },
    { native: "Entsa", spanish: "Agua" },
    { native: "Chiú", spanish: "Fruta" },
    { native: "Káshai", spanish: "Guanta" },
    { native: "Uwi", spanish: "Chonta" },
    { native: "Kúk", spanish: "Chancho" },
    { native: "Sangu", spanish: "Plato" },
  ],
};

export const THEMES = {
  kichwa: {
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-500',
    primaryBorder: 'border-emerald-700',
    text: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    progress: 'bg-emerald-500',
    icon: 'text-emerald-600',
  },
  shuar: {
    primary: 'bg-amber-600',
    primaryHover: 'hover:bg-amber-500',
    primaryBorder: 'border-amber-700',
    text: 'text-amber-700',
    bgLight: 'bg-amber-50',
    progress: 'bg-amber-500',
    icon: 'text-amber-600',
  },
};