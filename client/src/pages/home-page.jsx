import theme from "@jdboris/css-themes/space-station";
import { useEffect } from "react";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import GameForm from "../components/game-form";
import { useGames } from "../contexts/games";

function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [games, setGames] = useState([]);
  const {
    saveGame,
    getGames,
    error: gameError,
    setError: setGameError,
    isLoading: isLoadingGames,
  } = useGames();

  useEffect(() => {
    (async () => {
      setGames((await getGames()) || []);
    })();
  }, []);

  return (
    <main>
      <div
        className={theme.landingPage}
        style={{ backgroundImage: `url('landing-page.jpeg')` }}
      >
        <strong>Casual VR Fun</strong>
        <small>Try something new. Stay a while.</small>

        <button
          onClick={(e) => {
            e.target
              .closest(`.${theme.landingPage}`)
              .current.nextSibling.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          <FaChevronDown />
        </button>
      </div>
      <section>
        <header>
          <h1>Games</h1>
        </header>
        <main>
          <section>
            <ul>
              {games?.map((game) => (
                <li key={`game-${game.id}`}>
                  <GameForm
                    mode="read"
                    game={game}
                    error={gameError}
                    setError={setGameError}
                    isLoading={isLoadingGames}
                    saveGame={saveGame}
                    onUpdate={async () => setGames((await getGames()) || games)}
                  />
                </li>
              ))}
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </section>
        </main>
      </section>
    </main>
  );
}

export default HomePage;
