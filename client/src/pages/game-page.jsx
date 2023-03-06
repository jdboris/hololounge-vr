import theme from "@jdboris/css-themes/space-station";
import { useState } from "react";
import { useEffect } from "react";
import GameForm from "../components/game-form";
import TagForm from "../components/tag-form";
import { useAuth } from "../contexts/auth";
import { useGames } from "../contexts/games";
import { useTags } from "../contexts/tags";
import useDebounced from "../hooks/debounced";

function GamePage({ showDisabled = false, onlyFeatured = false }) {
  const { currentUser } = useAuth();
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({ tagIds: [] });
  const debouncedFilters = useDebounced(filters, 1);
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const { saveTag, getTags, error, setError, isLoading } = useTags();
  const {
    saveGame,
    getGames,
    error: gameError,
    setError: setGameError,
    isLoading: isLoadingGames,
  } = useGames();

  useEffect(() => {
    if (!onlyFeatured) {
      (async () => {
        setTags((await getTags()) || []);
      })();
    }

    (async () => {
      setGames(
        (await getGames(null, { onlyFeatured, isDisabled: showDisabled })) || []
      );
    })();
  }, [showDisabled]);

  useEffect(() => {
    // (async () => {
    //   setGames((await getGames(debouncedFilters)) || []);
    // })();

    setFilteredGames(
      games.filter((game) =>
        debouncedFilters.tagIds.every((id) =>
          game.tags.find((gameTag) => gameTag.id == id)
        )
      )
    );
  }, [debouncedFilters, games]);

  return (
    <section className={theme.gamePage}>
      <header>
        {onlyFeatured ? <h1>Featured Content</h1> : <h1>Catalog</h1>}
      </header>
      <main>
        <ul className={theme.badges}>
          {tags?.map((tag) => (
            <li key={`tag-${tag.id}`}>
              <label className={theme.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(filters.tagIds?.find((id) => id === tag.id))}
                  onChange={(e) =>
                    setFilters((old) => {
                      const copy = { ...old };
                      const id = copy.tagIds?.find((id) => id === tag.id);

                      if (e.target.checked) {
                        if (!id) {
                          copy.tagIds.push(tag.id);
                        }
                      } else {
                        copy.tagIds = copy.tagIds.filter(
                          (tagId) => tagId != id
                        );
                      }
                      return copy;
                    })
                  }
                />
                <span className={theme.badge}>{tag.name}</span>
              </label>
            </li>
          ))}
        </ul>
        {currentUser?.isAdmin == true && (
          <TagForm
            mode="create"
            error={error}
            setError={setError}
            isLoading={isLoading}
            saveTag={saveTag}
            onCreate={async () => setTags((await getTags()) || tags)}
          />
        )}

        <ul className={theme.games}>
          {filteredGames?.map((game) => (
            <li key={`game-${game.id}`}>
              <GameForm
                mode="read"
                game={game}
                error={gameError}
                setError={setGameError}
                isLoading={isLoadingGames}
                saveGame={saveGame}
                onUpdate={async () =>
                  setGames(
                    (await getGames(null, {
                      onlyFeatured,
                      isDisabled: showDisabled,
                    })) || games
                  )
                }
                tags={tags}
                currentUser={currentUser}
              />
            </li>
          ))}
          <li>
            {currentUser?.isAdmin == true && (
              <GameForm
                mode="create"
                error={gameError}
                setError={setGameError}
                isLoading={isLoadingGames}
                saveGame={saveGame}
                onCreate={async () =>
                  setGames(
                    (await getGames(null, {
                      onlyFeatured,
                      isDisabled: showDisabled,
                    })) || games
                  )
                }
                tags={tags}
              />
            )}
          </li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </main>
    </section>
  );
}

export default GamePage;
