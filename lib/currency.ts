// All mock prices in this app are denominated in INR. `rate` below is the
// number of units of that currency equal to 1 INR, used purely for display
// conversion — not a live feed.
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

export const CURRENCIES: Currency[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee",          rate: 1 },
  { code: "USD", symbol: "$", name: "US Dollar",             rate: 0.012 },
  { code: "EUR", symbol: "€", name: "Euro",                  rate: 0.011 },
  { code: "GBP", symbol: "£", name: "British Pound",         rate: 0.0094 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham",          rate: 0.044 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal",           rate: 0.045 },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal",        rate: 0.044 },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar",       rate: 0.0037 },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar",     rate: 0.0045 },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial",         rate: 0.0046 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen",          rate: 1.83 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan",          rate: 0.086 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar",    rate: 0.094 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar",     rate: 0.016 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit",    rate: 0.054 },
  { code: "THB", symbol: "฿", name: "Thai Baht",             rate: 0.42 },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah",    rate: 190 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso",       rate: 0.68 },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong",       rate: 305 },
  { code: "KRW", symbol: "₩", name: "South Korean Won",      rate: 16.5 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar",    rate: 0.018 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar",  rate: 0.020 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar",      rate: 0.016 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc",         rate: 0.0105 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona",        rate: 0.13 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone",      rate: 0.13 },
  { code: "DKK", symbol: "kr", name: "Danish Krone",         rate: 0.083 },
  { code: "PLN", symbol: "zł", name: "Polish Złoty",         rate: 0.048 },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna",         rate: 0.28 },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint",     rate: 4.3 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira",          rate: 0.41 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble",         rate: 1.10 },
  { code: "ZAR", symbol: "R", name: "South African Rand",    rate: 0.22 },
  { code: "EGP", symbol: "ج.م", name: "Egyptian Pound",      rate: 0.59 },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel",        rate: 0.044 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real",       rate: 0.066 },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso",       rate: 0.21 },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee",       rate: 3.4 },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka",      rate: 1.4 },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee",     rate: 3.6 },
  { code: "NPR", symbol: "Rs", name: "Nepalese Rupee",       rate: 1.6 },
  { code: "MVR", symbol: "Rf", name: "Maldivian Rufiyaa",    rate: 0.18 },
];
