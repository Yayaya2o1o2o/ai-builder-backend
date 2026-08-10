import type { ChantType, Deity, Occasion } from "./types";

export const DEITIES: Record<Deity, { en: string; hi: string; emoji: string }> = {
  ganesha: { en: "Ganesha", hi: "गणेश", emoji: "🐘" },
  shiva: { en: "Shiva", hi: "शिव", emoji: "🔱" },
  vishnu: { en: "Vishnu", hi: "विष्णु", emoji: "🪷" },
  rama: { en: "Rama", hi: "राम", emoji: "🏹" },
  krishna: { en: "Krishna", hi: "कृष्ण", emoji: "🪈" },
  hanuman: { en: "Hanuman", hi: "हनुमान", emoji: "🐒" },
  devi: { en: "Devi", hi: "देवी", emoji: "🌺" },
  durga: { en: "Durga", hi: "दुर्गा", emoji: "🦁" },
  lakshmi: { en: "Lakshmi", hi: "लक्ष्मी", emoji: "🪙" },
  saraswati: { en: "Saraswati", hi: "सरस्वती", emoji: "🎻" },
  surya: { en: "Surya", hi: "सूर्य", emoji: "☀️" },
  shani: { en: "Shani", hi: "शनि", emoji: "🪐" },
  "sai-baba": { en: "Sai Baba", hi: "साईं बाबा", emoji: "🕉️" },
  skanda: { en: "Skanda / Murugan", hi: "स्कंद", emoji: "🔱" },
  general: { en: "General / Universal", hi: "सामान्य", emoji: "🕉️" },
};

export const CHANT_TYPES: Record<ChantType, { en: string; hi: string; description: string }> = {
  aarti: { en: "Aarti", hi: "आरती", description: "Devotional song sung while offering a lit lamp" },
  chalisa: { en: "Chalisa", hi: "चालीसा", description: "A 40-verse devotional hymn" },
  mantra: { en: "Mantra", hi: "मंत्र", description: "A short, sacred, repeated chant" },
  stotra: { en: "Stotra", hi: "स्तोत्र", description: "A longer hymn of praise" },
  bhajan: { en: "Bhajan", hi: "भजन", description: "A devotional song, often sung in groups" },
  mangalacharan: { en: "Mangalacharan", hi: "मंगलाचरण", description: "An auspicious opening invocation" },
  ashtakam: { en: "Ashtakam", hi: "अष्टकम्", description: "An eight-verse hymn of praise" },
  suprabhatam: { en: "Suprabhatam", hi: "सुप्रभातम्", description: "A gentle hymn to wake a deity at dawn" },
};

export const OCCASIONS: Record<Occasion, { en: string; hi: string }> = {
  "daily-morning": { en: "Daily Morning Puja", hi: "प्रातः पूजा" },
  "daily-evening": { en: "Daily Evening Aarti", hi: "संध्या आरती" },
  diwali: { en: "Diwali", hi: "दीवाली" },
  navratri: { en: "Navratri", hi: "नवरात्रि" },
  "ganesh-chaturthi": { en: "Ganesh Chaturthi", hi: "गणेश चतुर्थी" },
  "maha-shivratri": { en: "Maha Shivratri", hi: "महाशिवरात्रि" },
  "ram-navami": { en: "Ram Navami", hi: "राम नवमी" },
  janmashtami: { en: "Janmashtami", hi: "जन्माष्टमी" },
  "hanuman-jayanti": { en: "Hanuman Jayanti", hi: "हनुमान जयंती" },
  "vasant-panchami": { en: "Vasant Panchami", hi: "वसंत पंचमी" },
  "guru-purnima": { en: "Guru Purnima", hi: "गुरु पूर्णिमा" },
  "karva-chauth": { en: "Karva Chauth", hi: "करवा चौथ" },
  "raksha-bandhan": { en: "Raksha Bandhan", hi: "रक्षा बंधन" },
  "general-puja": { en: "General Puja", hi: "सामान्य पूजा" },
};

export const LANGUAGES = [
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "en", label: "English", native: "English" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
