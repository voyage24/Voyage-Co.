// Parse the machine-readable zone (MRZ) on the bottom of a passport. Handles
// the TD3 format (two lines of 44 chars) used by passports. Returns the human
// name (and reference fields) or null if no valid MRZ line is found.

export type MrzResult = {
  surname: string;
  givenNames: string;
  fullName: string;
  passportNumber: string;
  nationality: string;
  birthDate: string;   // YYMMDD as printed
  expiryDate: string;  // YYMMDD as printed
  sex: string;
};

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).trim();
}

export function parseMrz(raw: string): MrzResult | null {
  // Normalise: uppercase, keep only MRZ-legal chars, split into candidate lines.
  const lines = raw
    .toUpperCase()
    .split(/\r?\n/)
    .map(l => l.replace(/[^A-Z0-9<]/g, ""))
    .filter(l => l.length >= 30);

  // Line 1 of a TD3 passport starts with "P<" then issuing country + names.
  const nameLine = lines.find(l => /^P[A-Z0-9<]</.test(l)) || lines.find(l => l.includes("<<"));
  if (!nameLine) return null;

  const namePart = nameLine.replace(/^P[A-Z0-9<]?[A-Z]{0,3}/, "");
  const [surnameRaw = "", givenRaw = ""] = namePart.split("<<");
  const surname = titleCase(surnameRaw.replace(/</g, " "));
  const givenNames = titleCase(givenRaw.replace(/</g, " "));
  const fullName = `${givenNames} ${surname}`.replace(/\s+/g, " ").trim();
  if (!fullName || fullName.length < 3) return null;

  // Line 2 (if present): passport no. (0-8), nationality (10-12), DOB (13-18),
  // sex (20), expiry (21-26).
  const dataLine = lines.find(l => l !== nameLine && /^[A-Z0-9<]{2,}\d/.test(l)) || "";
  const passportNumber = (dataLine.slice(0, 9).replace(/</g, "") || "").trim();
  const nationality = dataLine.slice(10, 13).replace(/</g, "").trim();
  const birthDate = dataLine.slice(13, 19).replace(/</g, "").trim();
  const sex = dataLine.slice(20, 21).replace(/</g, "").trim();
  const expiryDate = dataLine.slice(21, 27).replace(/</g, "").trim();

  return { surname, givenNames, fullName, passportNumber, nationality, birthDate, expiryDate, sex };
}
