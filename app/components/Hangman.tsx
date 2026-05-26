"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getRandomWord, getMasked, isWon, getWrong, ALPHABET,
  MAX_WRONG, type GameStatus,
} from "@/app/lib/game";
import { connectWallet, getConnectedAccount, payToPlay, hasWallet, GAME_FEE } from "@/app/lib/wallet";
import HangmanDrawing from "@/app/components/HangmanDrawing";
import sdk from "@farcaster/miniapp-sdk";

const formatEth = (wei: bigint) => (Number(wei) / 1e18).toFixed(7);

export default function Hangman() {
  const [word, setWord] = useState("");
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<GameStatus>("idle");
  const [account, setAccount] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [isFarcaster, setIsFarcaster] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const ctx = await sdk.context;
        if (ctx?.user) { setIsFarcaster(true); await sdk.actions.ready(); }
      } catch { /* not in farcaster */ }
      const acc = await getConnectedAccount();
      if (acc) setAccount(acc);
    };
    init();
  }, []);

  const wrong = getWrong(word, guessed);
  const masked = getMasked(word, guessed);
  const won = status === "playing" && isWon(word, guessed);
  const lost = status === "playing" && wrong.length >= MAX_WRONG;

  useEffect(() => {
    if (won) setStatus("won");
    if (lost) setStatus("lost");
  }, [won, lost]);

  const handleConnect = async () => {
    setError(null);
    try {
      const acc = await connectWallet();
      setAccount(acc);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect");
    }
  };

  const handleStartGame = async () => {
    if (!account) { await handleConnect(); return; }
    setError(null);
    setStatus("paying");
    try {
      const hash = await payToPlay(account);
      setTxHash(hash);
      setWord(getRandomWord());
      setGuessed(new Set());
      setStatus("playing");
      setGamesPlayed((g) => g + 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transaction failed");
      setStatus("idle");
    }
  };

  const handleGuess = useCallback((letter: string) => {
    if (status !== "playing" || guessed.has(letter)) return;
    setGuessed((prev) => new Set([...prev, letter]));
  }, [status, guessed]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const l = e.key.toLowerCase();
      if (/^[a-z]$/.test(l)) handleGuess(l);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleGuess]);

  const shortAddr = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 font-mono">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-1 text-white">Hangman</h1>
        <p className="text-neutral-500 text-sm">on Base · {formatEth(GAME_FEE)} ETH per game · no refunds</p>
        {gamesPlayed > 0 && (
          <p className="text-neutral-600 text-xs mt-1">{gamesPlayed} game{gamesPlayed > 1 ? "s" : ""} played</p>
        )}
      </div>

      {/* Wallet */}
      <div className="mb-4 flex items-center gap-2">
        {account ? (
          <span className="text-xs bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 text-neutral-300">
            <span className="text-emerald-400">●</span> {shortAddr}
          </span>
        ) : (
          <button onClick={handleConnect}
            className="text-xs bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors">
            Connect MetaMask / Rabby
          </button>
        )}
        {isFarcaster && (
          <span className="text-xs bg-purple-900/40 border border-purple-700/40 rounded-full px-3 py-1 text-purple-300">Farcaster</span>
        )}
      </div>

      <div className="w-full max-w-sm">
        {/* Hangman drawing */}
        <div className="mb-4">
          <HangmanDrawing wrong={wrong.length} />
          <p className="text-center text-sm text-neutral-500 mt-1">
            {wrong.length} / {MAX_WRONG} wrong
          </p>
        </div>

        {/* Word display */}
        {status === "playing" || status === "won" || status === "lost" ? (
          <div className="mb-6">
            <div className="flex justify-center gap-2 flex-wrap mb-4">
              {masked.map((letter, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className={`text-2xl font-bold w-8 text-center ${
                    letter !== "_"
                      ? status === "lost" && !guessed.has(letter)
                        ? "text-red-400"
                        : "text-emerald-400"
                      : "text-transparent"
                  }`}>
                    {status === "lost" ? word[i] : letter}
                  </span>
                  <span className="w-8 border-b-2 border-neutral-600 mt-1"></span>
                </div>
              ))}
            </div>

            {/* Wrong letters */}
            {wrong.length > 0 && (
              <p className="text-center text-red-400/70 text-xs mb-4">
                wrong: {wrong.join(" ")}
              </p>
            )}
          </div>
        ) : null}

        {/* Keyboard */}
        {(status === "playing") && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {ALPHABET.map((letter) => {
              const isGuessed = guessed.has(letter);
              const isWrong = isGuessed && !word.includes(letter);
              const isCorrect = isGuessed && word.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={isGuessed}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    isWrong ? "bg-red-900/40 text-red-400 cursor-not-allowed" :
                    isCorrect ? "bg-emerald-900/40 text-emerald-400 cursor-not-allowed" :
                    "bg-neutral-800 hover:bg-neutral-600 text-white"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}

        {/* Status messages */}
        {status === "idle" && (
          <div className="text-center">
            <p className="text-neutral-400 text-sm mb-4">
              Guess the word. {MAX_WRONG} wrong guesses and you're done.<br />
              Pay <span className="text-white font-bold">{formatEth(GAME_FEE)} ETH</span> to play. No refunds.
            </p>
            {!hasWallet() ? (
              <div>
                <p className="text-yellow-400 text-xs mb-3">No wallet detected. Install MetaMask or Rabby.</p>
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer"
                  className="inline-block w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-xl transition-colors text-sm mb-2">
                  Get MetaMask ↗
                </a>
                <a href="https://rabby.io" target="_blank" rel="noopener noreferrer"
                  className="inline-block w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-xl transition-colors text-sm">
                  Get Rabby ↗
                </a>
              </div>
            ) : (
              <button onClick={handleStartGame}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors text-sm">
                {account ? `Play for ${formatEth(GAME_FEE)} ETH` : "Connect wallet & Play"}
              </button>
            )}
          </div>
        )}

        {status === "paying" && (
          <div className="text-center py-4">
            <div className="text-2xl mb-2 animate-spin inline-block">⏳</div>
            <p className="text-neutral-400 text-sm">Confirm transaction in your wallet…</p>
          </div>
        )}

        {status === "won" && (
          <div className="text-center">
            <p className="text-emerald-400 text-2xl font-bold mb-1">You got it! 🎉</p>
            <p className="text-neutral-500 text-xs mb-4">The word was <span className="text-white font-bold">{word}</span>. Still no refund.</p>
            <button onClick={handleStartGame}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors text-sm">
              Play again · {formatEth(GAME_FEE)} ETH
            </button>
          </div>
        )}

        {status === "lost" && (
          <div className="text-center">
            <p className="text-red-400 text-2xl font-bold mb-1">You were hanged 💀</p>
            <p className="text-neutral-500 text-xs mb-4">The word was <span className="text-white font-bold">{word}</span>.</p>
            <button onClick={handleStartGame}
              className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-xl transition-colors text-sm">
              Try again · {formatEth(GAME_FEE)} ETH
            </button>
          </div>
        )}

        {/* TX hash */}
        {txHash && (
          <div className="mt-4 text-center">
            <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
              tx: {txHash.slice(0, 10)}…{txHash.slice(-6)} ↗
            </a>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 text-center">
            <p className="text-red-400 text-xs">{error}</p>
            <button onClick={() => setError(null)} className="text-neutral-600 text-xs mt-1 hover:text-neutral-400">dismiss</button>
          </div>
        )}
      </div>

      <div className="mt-8 text-neutral-700 text-xs text-center">
        <p>built on Base · payments are final</p>
      </div>
    </div>
  );
}
