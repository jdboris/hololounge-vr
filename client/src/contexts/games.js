import React, { createContext, useContext, useEffect, useState } from "react";

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [error, setError] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  async function getGames(filters = null) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        params.set("filters", JSON.stringify(filters));
      }
      const response = await fetch(`/api/games?` + params, {
        method: "GET",
        credentials: "same-origin",
      });

      const { error, games } = await response.json();

      if (!response.ok) {
        throw error;
      }

      return games;
    } catch (error) {
      setError(error);
    }

    return null;
  }

  async function saveGame(game) {
    try {
      const response = await fetch(`/api/games`, {
        method: game.id ? "PUT" : "POST",
        credentials: "same-origin",
        body: JSON.stringify(game),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { error, ...data } = await response.json();

      if (!response.ok) {
        throw error;
      }

      return data.game;
    } catch (error) {
      setError(error);
    }

    return null;
  }

  return (
    <GameContext.Provider
      value={{
        getGames,
        saveGame,
        isLoading,
        error,
        setError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

/**
 * @typedef GameContextValue
 * @property {() => Promise<Array | undefined>} getGames
 * @property {(game: any) => Promise<void>} saveGame
 */

/**
 *  @returns {GameContextValue}
 */
export function useGames() {
  return useContext(GameContext);
}
