export type GameStatus = "idle" | "paying" | "playing" | "won" | "lost";

export const MAX_WRONG = 6;

export const WORDS = [
  // Tech / crypto
  "blockchain", "ethereum", "wallet", "token", "protocol", "decentralized",
  "validator", "consensus", "merkle", "cryptography", "signature", "contract",
  // General
  "phantom", "algorithm", "keyboard", "javascript", "developer", "network",
  "terminal", "database", "framework", "interface", "function", "variable",
  "overflow", "recursion", "compiler", "bandwidth", "firewall", "encryption",
  "bootstrap", "gradient", "velocity", "quantum", "spectrum", "latitude",
  "dinosaur", "labyrinth", "wilderness", "symphony", "avalanche", "telescope",
  "architect", "boulevard", "crocodile", "labyrinth", "mnemonic", "phosphor",
];

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function getMasked(word: string, guessed: Set<string>): string[] {
  return word.split("").map((l) => (guessed.has(l) ? l : "_"));
}

export function isWon(word: string, guessed: Set<string>): boolean {
  return word.split("").every((l) => guessed.has(l));
}

export function getWrong(word: string, guessed: Set<string>): string[] {
  return Array.from(guessed).filter((l) => !word.includes(l));
}

export const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
