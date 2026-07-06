// Offline phrasebook: essential travel phrases per language. Bundled static
// data, so it works with no signal. Mapped from destination country → language.

export type Phrase = { en: string; local: string; say?: string };

const KEYS = ["Hello", "Thank you", "Please", "Yes / No", "Excuse me", "How much?", "Where is…?", "Help!", "Cheers!", "Goodbye"];

const PHRASES: Record<string, string[]> = {
  French: ["Bonjour", "Merci", "S'il vous plaît", "Oui / Non", "Excusez-moi", "C'est combien ?", "Où est… ?", "Au secours !", "Santé !", "Au revoir"],
  Italian: ["Ciao", "Grazie", "Per favore", "Sì / No", "Mi scusi", "Quanto costa?", "Dov'è… ?", "Aiuto!", "Salute!", "Arrivederci"],
  Spanish: ["Hola", "Gracias", "Por favor", "Sí / No", "Perdón", "¿Cuánto cuesta?", "¿Dónde está… ?", "¡Ayuda!", "¡Salud!", "Adiós"],
  German: ["Hallo", "Danke", "Bitte", "Ja / Nein", "Entschuldigung", "Wie viel kostet das?", "Wo ist… ?", "Hilfe!", "Prost!", "Auf Wiedersehen"],
  Portuguese: ["Olá", "Obrigado/a", "Por favor", "Sim / Não", "Com licença", "Quanto custa?", "Onde fica… ?", "Socorro!", "Saúde!", "Adeus"],
  Greek: ["Γεια σας (Yá sas)", "Ευχαριστώ (Efharistó)", "Παρακαλώ (Parakaló)", "Ναι / Όχι (Ne / Óhi)", "Συγγνώμη (Signómi)", "Πόσο κάνει; (Póso káni?)", "Πού είναι…; (Pou íne?)", "Βοήθεια! (Voíthia!)", "Γεια μας! (Yá mas!)", "Αντίο (Adío)"],
  Arabic: ["مرحبا (Marhaban)", "شكرا (Shukran)", "من فضلك (Min fadlik)", "نعم / لا (Na'am / La)", "عفوا (Afwan)", "بكم هذا؟ (Bikam hatha?)", "أين… ؟ (Ayna?)", "النجدة! (An-najda!)", "في صحتك (Fi sahtak)", "مع السلامة (Ma'a salama)"],
  Japanese: ["こんにちは (Konnichiwa)", "ありがとう (Arigatō)", "お願いします (Onegai shimasu)", "はい / いいえ (Hai / Iie)", "すみません (Sumimasen)", "いくらですか (Ikura desu ka)", "…はどこですか (…wa doko desu ka)", "助けて (Tasukete)", "乾杯 (Kanpai)", "さようなら (Sayōnara)"],
  Thai: ["สวัสดี (Sawasdee)", "ขอบคุณ (Khob khun)", "กรุณา (Karuna)", "ใช่ / ไม่ (Chai / Mai)", "ขอโทษ (Kho thot)", "เท่าไหร่ (Thao rai)", "…อยู่ที่ไหน (…yu thi nai)", "ช่วยด้วย (Chuay duay)", "ไชโย (Chai yo)", "ลาก่อน (La kon)"],
  Hindi: ["नमस्ते (Namaste)", "धन्यवाद (Dhanyavaad)", "कृपया (Kripya)", "हाँ / नहीं (Haan / Nahin)", "माफ़ कीजिए (Maaf kijiye)", "कितने का है? (Kitne ka hai?)", "…कहाँ है? (…kahaan hai?)", "बचाओ! (Bachao!)", "चियर्स!", "अलविदा (Alvida)"],
  Turkish: ["Merhaba", "Teşekkürler", "Lütfen", "Evet / Hayır", "Affedersiniz", "Ne kadar?", "… nerede?", "İmdat!", "Şerefe!", "Hoşça kal"],
  Indonesian: ["Halo", "Terima kasih", "Tolong", "Ya / Tidak", "Permisi", "Berapa harganya?", "Di mana… ?", "Tolong!", "Bersulang!", "Selamat tinggal"],
};

const COUNTRY_LANG: Record<string, string> = {
  France: "French", Switzerland: "French", Belgium: "French", Monaco: "French",
  Italy: "Italian", Spain: "Spanish", Mexico: "Spanish", Argentina: "Spanish",
  Germany: "German", Austria: "German", Portugal: "Portuguese", Brazil: "Portuguese",
  Greece: "Greek", Turkey: "Turkish", Japan: "Japanese", Thailand: "Thai",
  India: "Hindi", Indonesia: "Indonesian",
  "United Arab Emirates": "Arabic", UAE: "Arabic", Egypt: "Arabic", Morocco: "Arabic",
};

export function getPhrasebook(country: string | null | undefined): { language: string; phrases: Phrase[] } | null {
  if (!country) return null;
  const language = COUNTRY_LANG[country.trim()];
  if (!language || !PHRASES[language]) return null;
  const phrases = KEYS.map((en, i) => ({ en, local: PHRASES[language][i] }));
  return { language, phrases };
}
