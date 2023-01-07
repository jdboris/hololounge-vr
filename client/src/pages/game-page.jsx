import theme from "@jdboris/css-themes/space-station";
import { useState } from "react";
import { useEffect } from "react";
import GameForm from "../components/game-form";
import TagForm from "../components/tag-form";
import { useAuth } from "../contexts/auth";
import { useTags } from "../contexts/tags";

function GamePage() {
  const { currentUser } = useAuth();
  const [tags, setTags] = useState([]);
  const { saveTag, getTags, error, setError, isLoading } = useTags();

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
            error={error}
            setError={setError}
            isLoading={isLoading}
            saveGame={saveTag}
            onCreate={async () => setTags((await getTags()) || tags)}
            tags={tags}
          />
        )}
      </section>
    </main>
  );
}

export default GamePage;
