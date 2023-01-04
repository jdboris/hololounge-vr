import theme from "@jdboris/css-themes/space-station";
import { useState } from "react";
import { useEffect } from "react";
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

        <h4>Tags</h4>
        <ul className={theme.badges}>
          {tags.map((tag) => (
            <li className={theme.badge}>{tag.name}</li>
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
      </section>
    </main>
  );
}

export default GamePage;