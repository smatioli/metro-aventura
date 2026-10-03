const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function isLetter(char: string | undefined): boolean {
  return char !== undefined && /^[A-Z]$/.test(char);
}

// Primeira posição a partir de `from` que contém uma letra (pula espaços).
// Retorna `word.length` quando não há mais letras.
export function nextLetterIndex(word: string, from: number): number {
  let index = from;
  while (index < word.length && !isLetter(word[index])) index += 1;
  return index;
}

export function shuffled<T>(list: T[], random: () => number = Math.random): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// A letra certa + 2 letras diferentes, em ordem aleatória (botões para toque).
export function letterChoicesFor(expected: string, random: () => number = Math.random): string[] {
  const decoys = shuffled(alphabet.filter(letter => letter !== expected), random).slice(0, 2);
  return shuffled([expected, ...decoys], random);
}
