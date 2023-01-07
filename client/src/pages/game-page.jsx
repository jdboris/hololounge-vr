import theme from "@jdboris/css-themes/space-station";
import { useState } from "react";
import { useEffect } from "react";
import GameForm from "../components/game-form";
import TagForm from "../components/tag-form";
import { useAuth } from "../contexts/auth";
import { useGames } from "../contexts/games";
import { useTags } from "../contexts/tags";

function GamePage() {
  const { currentUser } = useAuth();
  const [tags, setTags] = useState([]);
  const [games, setGames] = useState([]);
  const { saveTag, getTags, error, setError, isLoading } = useTags();
  const {
    saveGame,
    getGames,
    error: gameError,
    setError: setGameError,
    isLoading: isLoadingGames,
  } = useGames();

  useEffect(() => {
    (async () => {
      setTags((await getTags()) || []);
    })();
  }, []);

  return (
    <main>
      <section>
        <header>
          <h1>Games</h1>
        </header>

        <ul className={theme.badges}>
          {tags.map((tag) => (
            <li key={`tag-${tag.id}`} className={theme.badge}>
              {tag.name}
            </li>
          ))}
        </ul>
        {currentUser?.isAdmin && (
          <TagForm
            mode="create"
            error={error}
            setError={setError}
            isLoading={isLoading}
            saveTag={saveTag}
            onCreate={async () => setTags((await getTags()) || tags)}
          />
        )}

        {currentUser?.isAdmin && (
          <GameForm
            mode="create"
            error={gameError}
            setError={setGameError}
            isLoading={isLoadingGames}
            saveGame={saveGame}
            onCreate={async () => setGames((await getGames()) || games)}
            tags={tags}
          />
        )}
      </section>
    </main>
  );
}

export default GamePage;
