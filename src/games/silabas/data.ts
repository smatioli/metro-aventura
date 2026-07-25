export type Family = {
  consonant: string;
  label: string;
  words: string[];
};

export type SyllableSet = {
  id: number;
  color: string;
  softColor: string;
  families: Family[];
};

export const syllableSets: SyllableSet[] = [
  {
    id: 1, color: "#18a999", softColor: "#c9f5eb",
    families: [
      { consonant: "T", label: "TA • TE • TI • TO • TU", words: ["TATU", "TETO", "TIA", "TUTU", "TIO", "IATE"] },
      { consonant: "L", label: "LA • LE • LI • LO • LU", words: ["LUTA", "LEI", "TELA", "LEITE", "LUA", "LATA"] },
      { consonant: "M", label: "MA • ME • MI • MO • MU", words: ["MOLA", "MATO", "TOMATE", "MALA", "MEIA", "MULETA"] },
    ],
  },
  {
    id: 2, color: "#ef5b7d", softColor: "#ffe0e8",
    families: [
      { consonant: "F", label: "FA • FE • FI • FO • FU", words: ["FILA", "FOME", "MOFO", "FOLIA", "FATIA", "FAMÍLIA"] },
      { consonant: "B", label: "BA • BE • BI • BO • BU", words: ["BOLA", "BAÚ", "BIFE", "BATEU", "BELA", "BALEIA"] },
      { consonant: "R", label: "RA • RE • RI • RO • RU", words: ["RATO", "RIO", "RIMA", "RIFA", "RABO", "ROLO"] },
    ],
  },
  {
    id: 3, color: "#2589bd", softColor: "#d7effc",
    families: [
      { consonant: "P", label: "PA • PE • PI • PO • PU", words: ["PATO", "MAPA", "APITO", "PIPA", "PALITO", "PIA"] },
      { consonant: "N", label: "NA • NE • NI • NO • NU", words: ["NOME", "PENA", "MENINA", "PANELA", "NETO", "ALUNO"] },
      { consonant: "V", label: "VA • VE • VI • VO • VU", words: ["NOVE", "LUVA", "NOVELA", "VOVÓ", "VELA", "VIOLETA"] },
    ],
  },
  {
    id: 4, color: "#f59e0b", softColor: "#fff0c2",
    families: [
      { consonant: "S", label: "SA • SE • SI • SO • SU", words: ["SAPO", "SOFÁ", "SALA", "SAPATO", "SETE", "SABONETE"] },
      { consonant: "D", label: "DA • DE • DI • DO • DU", words: ["DADO", "RODA", "DIA", "SALADA", "IDADE", "DATA"] },
      { consonant: "J", label: "JA • JE • JI • JO • JU", words: ["SUJO", "JUBA", "JILÓ", "PAJÉ", "BEIJO", "JANELA"] },
    ],
  },
  {
    id: 5, color: "#8b5cf6", softColor: "#e9ddff",
    families: [
      { consonant: "X", label: "XA • XE • XI • XO • XU", words: ["XALE", "LIXO", "PEIXE", "ROXO", "FAXINA", "TAXA"] },
      { consonant: "Z", label: "ZA • ZE • ZI • ZO • ZU", words: ["ZEBU", "BUZINA", "AZEDO", "DOZE", "VAZIO", "BELEZA"] },
    ],
  },
  {
    id: 6, color: "#65a30d", softColor: "#e2f6bd",
    families: [
      { consonant: "C", label: "CA • CO • CU", words: ["CALO", "FACA", "SACOLA", "CUECA", "COXA", "ABACAXI"] },
      { consonant: "G", label: "GA • GO • GU", words: ["GATO", "GOMA", "GULA", "FOGO", "BIGODE", "BEXIGA"] },
    ],
  },
];

const vowels = "AEIOUÁÉÍÓÚ";

export function syllablesForFamily(family: Family): string[] {
  return [...new Set(family.words.flatMap(word => {
    const normalized = word.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const result: string[] = [];
    for (let i = 0; i < normalized.length - 1; i += 1) {
      if (normalized[i] === family.consonant && vowels.includes(normalized[i + 1])) {
        result.push(normalized.slice(i, i + 2));
      }
    }
    return result;
  }))];
}

export function targetSyllable(word: string, consonant: string): { syllable: string; start: number } {
  const normalized = word.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  for (let i = 0; i < normalized.length - 1; i += 1) {
    if (normalized[i] === consonant && vowels.includes(normalized[i + 1])) {
      return { syllable: normalized.slice(i, i + 2), start: i };
    }
  }
  return { syllable: normalized.slice(0, 2), start: 0 };
}
