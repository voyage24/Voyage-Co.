// Power (plug types + voltage/frequency) and mobile-connectivity notes per
// country, so guests know which adapter to pack and how to get online. Plug/
// voltage data is standardised; curated for the main destination countries with
// a graceful null for the rest. Most modern phones support eSIM, so we point to
// the concierge for a local eSIM as the easy option.

export type Connectivity = {
  plugs: string[];   // plug-type letters, e.g. ["C", "D", "M"]
  voltage: string;   // e.g. "230V"
  frequency: string; // e.g. "50Hz"
  converter: boolean; // true where visitors from 230V regions need a voltage converter (110–120V countries)
  sim: string;       // one-line connectivity note
};

const G: Omit<Connectivity, "sim"> = { plugs: ["G"], voltage: "230V", frequency: "50Hz", converter: false };
const CEF: Omit<Connectivity, "sim"> = { plugs: ["C", "E", "F"], voltage: "230V", frequency: "50Hz", converter: false };
const AB: Omit<Connectivity, "sim"> = { plugs: ["A", "B"], voltage: "120V", frequency: "60Hz", converter: true };
const I: Omit<Connectivity, "sim"> = { plugs: ["I"], voltage: "230V", frequency: "50Hz", converter: false };

const DATA: Record<string, Connectivity> = {
  India: { plugs: ["C", "D", "M"], voltage: "230V", frequency: "50Hz", converter: false, sim: "Jio & Airtel have excellent 4G/5G. eSIM widely supported — ask the concierge to set one up on arrival." },
  Maldives: { ...G, sim: "Resort Wi-Fi is generally strong; Dhiraagu/Ooredoo eSIMs work on the local islands." },
  "Sri Lanka": { plugs: ["D", "G", "M"], voltage: "230V", frequency: "50Hz", converter: false, sim: "Dialog & Mobitel offer cheap data SIMs/eSIMs; coverage is good on the coasts." },
  Thailand: { plugs: ["A", "B", "C", "O"], voltage: "230V", frequency: "50Hz", converter: false, sim: "AIS & TrueMove tourist eSIMs are cheap with fast 5G in the cities." },
  Indonesia: { ...CEF, plugs: ["C", "F"], sim: "Telkomsel has the widest reach; eSIMs are easy to arrange for Bali and beyond." },
  Vietnam: { plugs: ["A", "C", "F"], voltage: "220V", frequency: "50Hz", converter: false, sim: "Viettel & Vinaphone offer fast, inexpensive data eSIMs." },
  Cambodia: { plugs: ["A", "C", "G"], voltage: "230V", frequency: "50Hz", converter: false, sim: "Smart & Cellcard data SIMs are cheap; coverage is good around the temples." },
  Malaysia: { ...G, sim: "Maxis & Celcom give strong urban 5G; tourist eSIMs are simple to set up." },
  Singapore: { ...G, sim: "Superb nationwide 5G; Singtel/StarHub eSIMs activate in minutes." },
  Philippines: { plugs: ["A", "B", "C"], voltage: "220V", frequency: "60Hz", converter: false, sim: "Globe & Smart cover the resorts; buy a tourist eSIM before island-hopping." },
  Japan: { plugs: ["A", "B"], voltage: "100V", frequency: "50/60Hz", converter: true, sim: "Ubiquitous fast 5G; data-only eSIMs are the easiest option for visitors." },
  China: { ...I, plugs: ["A", "I"], sim: "Buy a roaming eSIM that routes outside the local firewall so your usual apps work." },
  "South Korea": { plugs: ["C", "F"], voltage: "220V", frequency: "60Hz", converter: false, sim: "Among the world's fastest networks; KT/SKT eSIMs are effortless." },
  Nepal: { plugs: ["C", "D", "M"], voltage: "230V", frequency: "50Hz", converter: false, sim: "Ncell & NTC cover the valleys; signal thins on high treks." },
  Bhutan: { plugs: ["C", "D", "G"], voltage: "230V", frequency: "50Hz", converter: false, sim: "TashiCell/B-Mobile SIMs are usually arranged by your guide." },
  UAE: { ...G, sim: "Etisalat (e&) & du have flawless 5G; tourist eSIMs are quick to buy." },
  Oman: { ...G, sim: "Omantel & Ooredoo give strong coverage; eSIMs are readily available." },
  Qatar: { ...G, sim: "Ooredoo & Vodafone offer fast 5G and easy tourist eSIMs." },
  Bahrain: { ...G, sim: "Batelco & stc provide excellent island-wide coverage." },
  "Saudi Arabia": { ...G, sim: "stc & Mobily cover the cities well; eSIMs are simple to activate." },
  Jordan: { plugs: ["B", "C", "D", "F", "G", "J"], voltage: "230V", frequency: "50Hz", converter: false, sim: "Zain & Orange data SIMs are cheap and reach Petra and Wadi Rum." },
  Israel: { plugs: ["C", "H", "M"], voltage: "230V", frequency: "50Hz", converter: false, sim: "Excellent 5G; tourist eSIMs (Partner/Cellcom) are easy." },
  Egypt: { ...CEF, sim: "Vodafone & Orange cover the Nile route; buy a tourist SIM at the airport." },
  Morocco: { ...CEF, sim: "Maroc Telecom & Orange have good coverage; eSIMs work in the cities." },
  Turkey: { ...CEF, sim: "Turkcell & Vodafone are strong; tourist SIMs must be registered (concierge can help)." },
  Kenya: { ...G, sim: "Safaricom's M-Pesa network reaches most lodges; buy a data SIM on arrival." },
  Tanzania: { plugs: ["D", "G"], voltage: "230V", frequency: "50Hz", converter: false, sim: "Vodacom & Airtel cover towns; expect gaps on remote safari." },
  "South Africa": { plugs: ["C", "D", "M", "N"], voltage: "230V", frequency: "50Hz", converter: false, sim: "Vodacom & MTN give strong urban 5G; eSIMs are easy for visitors." },
  Mauritius: { ...G, plugs: ["C", "G"], sim: "my.t & Emtel cover the island; resort Wi-Fi is reliable." },
  Seychelles: { ...G, sim: "Airtel & Cable & Wireless cover the main islands." },
  Italy: { plugs: ["C", "F", "L"], voltage: "230V", frequency: "50Hz", converter: false, sim: "TIM & Vodafone offer cheap EU-wide data eSIMs." },
  France: { ...CEF, plugs: ["C", "E"], sim: "Orange & SFR eSIMs cover France and roam across the EU." },
  Spain: { ...CEF, sim: "Movistar & Vodafone give strong 5G with EU-wide roaming." },
  Portugal: { ...CEF, sim: "MEO & Vodafone eSIMs are cheap and roam across Europe." },
  Greece: { ...CEF, sim: "Cosmote & Vodafone cover the islands well in season." },
  Croatia: { ...CEF, sim: "Hrvatski Telekom & A1 give good coastal coverage with EU roaming." },
  Montenegro: { ...CEF, sim: "Crnogorski Telekom covers the coast; EU roaming is not automatic here." },
  UK: { ...G, sim: "EE & Vodafone offer fast 5G; eSIMs activate instantly." },
  Ireland: { ...G, sim: "Three & Vodafone give strong coverage with EU-wide roaming." },
  Germany: { ...CEF, plugs: ["C", "F"], sim: "Telekom & Vodafone 5G is strong in cities; eSIMs roam across the EU." },
  Netherlands: { ...CEF, plugs: ["C", "F"], sim: "KPN & Vodafone offer excellent nationwide 5G." },
  Switzerland: { plugs: ["C", "J"], voltage: "230V", frequency: "50Hz", converter: false, sim: "Swisscom has superb reach even in the Alps; note Switzerland is outside EU roaming." },
  Austria: { ...CEF, plugs: ["C", "F"], sim: "A1 & Magenta give strong coverage with EU roaming." },
  Iceland: { ...CEF, plugs: ["C", "F"], sim: "Síminn & Vodafone cover the Ring Road well; signal thins in the highlands." },
  Norway: { ...CEF, plugs: ["C", "F"], sim: "Telenor covers the fjords impressively; note Norway is outside EU roaming." },
  Sweden: { ...CEF, plugs: ["C", "F"], sim: "Telia & Tele2 offer strong 5G with EU roaming." },
  Finland: { ...CEF, plugs: ["C", "F"], sim: "Elisa & Telia reach Lapland; EU roaming applies." },
  USA: { ...AB, sim: "AT&T & T-Mobile 5G is strong in cities; a US/roaming eSIM is the simplest route." },
  Canada: { ...AB, sim: "Rogers & Bell cover cities well; a tourist eSIM avoids high roaming fees." },
  Mexico: { ...AB, plugs: ["A", "B"], sim: "Telcel has the widest reach; tourist eSIMs are easy to buy." },
  "Costa Rica": { ...AB, plugs: ["A", "B"], sim: "Kölbi & Claro cover most areas; expect gaps in the rainforest." },
  Brazil: { plugs: ["C", "N"], voltage: "127/220V", frequency: "60Hz", converter: false, sim: "Vivo & Claro cover cities; voltage varies by region, so check before charging." },
  Peru: { ...AB, plugs: ["A", "B", "C"], voltage: "220V", converter: false, sim: "Claro & Movistar cover the highlands; signal thins on the Inca Trail." },
  Argentina: { plugs: ["C", "I"], voltage: "220V", frequency: "50Hz", converter: false, sim: "Claro & Movistar cover cities; Patagonia has gaps." },
  Chile: { plugs: ["C", "L"], voltage: "220V", frequency: "50Hz", converter: false, sim: "Entel has the best reach, including much of Patagonia." },
  Australia: { ...I, sim: "Telstra has the widest coverage, including the Outback; eSIMs are easy." },
  "New Zealand": { ...I, sim: "One NZ & Spark cover both islands well; buy a traveller eSIM on arrival." },
  Fiji: { plugs: ["I"], voltage: "240V", frequency: "50Hz", converter: false, sim: "Vodafone Fiji covers the main islands; resort Wi-Fi fills the gaps." },
  "French Polynesia": { ...CEF, plugs: ["C", "E"], sim: "Vini/Vodafone covers Tahiti & Bora Bora; rely on resort Wi-Fi on remote motus." },
  Bahamas: { ...AB, plugs: ["A", "B"], sim: "BTC & Aliv cover the main islands; a roaming eSIM is easiest." },
  Jamaica: { ...AB, plugs: ["A", "B"], sim: "Digicel & Flow cover the resorts well." },
};

const ALIAS: Record<string, string> = {
  "United Arab Emirates": "UAE",
  "United Kingdom": "UK",
  "United States": "USA",
};

export function getConnectivity(country?: string | null): Connectivity | null {
  if (!country) return null;
  return DATA[country] ?? DATA[ALIAS[country] ?? ""] ?? null;
}
