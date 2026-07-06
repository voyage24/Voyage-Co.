// Offline phrasebook: essential travel phrases per language. Bundled static
// data, so it works with no signal. Mapped from destination country → language.
// English-speaking destinations intentionally have no phrasebook.

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
  Mandarin: ["你好 (Nǐ hǎo)", "谢谢 (Xièxie)", "请 (Qǐng)", "是 / 不是 (Shì / Bù shì)", "对不起 (Duìbùqǐ)", "多少钱？(Duōshǎo qián?)", "…在哪里？(…zài nǎlǐ?)", "救命！(Jiùmìng!)", "干杯！(Gānbēi!)", "再见 (Zàijiàn)"],
  Korean: ["안녕하세요 (Annyeonghaseyo)", "감사합니다 (Gamsahamnida)", "주세요 (Juseyo)", "네 / 아니요 (Ne / Aniyo)", "실례합니다 (Sillyehamnida)", "얼마예요? (Eolmayeyo?)", "…어디예요? (…eodiyeyo?)", "도와주세요! (Dowajuseyo!)", "건배! (Geonbae!)", "안녕히 가세요 (Annyeonghi gaseyo)"],
  Vietnamese: ["Xin chào", "Cảm ơn", "Làm ơn", "Vâng / Không", "Xin lỗi", "Bao nhiêu tiền?", "… ở đâu?", "Cứu với!", "Dzô!", "Tạm biệt"],
  Thai: ["สวัสดี (Sawasdee)", "ขอบคุณ (Khob khun)", "กรุณา (Karuna)", "ใช่ / ไม่ (Chai / Mai)", "ขอโทษ (Kho thot)", "เท่าไหร่ (Thao rai)", "…อยู่ที่ไหน (…yu thi nai)", "ช่วยด้วย (Chuay duay)", "ไชโย (Chai yo)", "ลาก่อน (La kon)"],
  Malay: ["Helo", "Terima kasih", "Tolong", "Ya / Tidak", "Maafkan saya", "Berapa harganya?", "Di mana… ?", "Tolong!", "Sorak!", "Selamat tinggal"],
  Filipino: ["Kumusta", "Salamat", "Pakiusap", "Oo / Hindi", "Paumanhin", "Magkano ito?", "Nasaan ang… ?", "Saklolo!", "Tagay!", "Paalam"],
  Hindi: ["नमस्ते (Namaste)", "धन्यवाद (Dhanyavaad)", "कृपया (Kripya)", "हाँ / नहीं (Haan / Nahin)", "माफ़ कीजिए (Maaf kijiye)", "कितने का है? (Kitne ka hai?)", "…कहाँ है? (…kahaan hai?)", "बचाओ! (Bachao!)", "चियर्स!", "अलविदा (Alvida)"],
  Turkish: ["Merhaba", "Teşekkürler", "Lütfen", "Evet / Hayır", "Affedersiniz", "Ne kadar?", "… nerede?", "İmdat!", "Şerefe!", "Hoşça kal"],
  Indonesian: ["Halo", "Terima kasih", "Tolong", "Ya / Tidak", "Permisi", "Berapa harganya?", "Di mana… ?", "Tolong!", "Bersulang!", "Selamat tinggal"],
  Russian: ["Здравствуйте (Zdravstvuyte)", "Спасибо (Spasibo)", "Пожалуйста (Pozhaluysta)", "Да / Нет (Da / Net)", "Извините (Izvinite)", "Сколько стоит? (Skol'ko stoit?)", "Где… ? (Gde… ?)", "Помогите! (Pomogite!)", "Будем здоровы! (Budem zdorovy!)", "До свидания (Do svidaniya)"],
};

// Country → language. Keys are lower-cased for case-insensitive matching.
const COUNTRY_LANG: Record<string, string> = {
  france: "French", switzerland: "French", belgium: "French", monaco: "French", "french polynesia": "French", tahiti: "French",
  italy: "Italian",
  spain: "Spanish", mexico: "Spanish", argentina: "Spanish", peru: "Spanish", colombia: "Spanish", chile: "Spanish", "costa rica": "Spanish", ecuador: "Spanish",
  germany: "German", austria: "German",
  portugal: "Portuguese", brazil: "Portuguese",
  greece: "Greek", turkey: "Turkish",
  japan: "Japanese", china: "Mandarin", taiwan: "Mandarin", "hong kong": "Mandarin",
  "south korea": "Korean", vietnam: "Vietnamese", thailand: "Thai", malaysia: "Malay", philippines: "Filipino",
  india: "Hindi", indonesia: "Indonesian", russia: "Russian",
  "united arab emirates": "Arabic", uae: "Arabic", egypt: "Arabic", morocco: "Arabic", "saudi arabia": "Arabic", jordan: "Arabic", qatar: "Arabic", oman: "Arabic",
};

export function getPhrasebook(country: string | null | undefined): { language: string; phrases: Phrase[] } | null {
  if (!country) return null;
  const language = COUNTRY_LANG[country.trim().toLowerCase()];
  if (!language || !PHRASES[language]) return null;
  const phrases = KEYS.map((en, i) => ({ en, local: PHRASES[language][i] }));
  return { language, phrases };
}
