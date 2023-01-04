import TagForm from "../components/tag-form";
import { useAuth } from "../contexts/auth";
import { useTags } from "../contexts/tags";

function GamePage() {
  const { currentUser } = useAuth();
  const { saveTag, error, setError, isLoading } = useTags();

  return (
    <main>
      {currentUser?.isAdmin && (
        <TagForm
          mode="create"
          error={error}
          setError={setError}
          isLoading={isLoading}
          saveTag={saveTag}
        />
      )}
    </main>
  );
}

export default GamePage;
