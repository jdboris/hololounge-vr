import theme from "@jdboris/css-themes/space-station";
import { useEffect } from "react";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import GameForm from "../components/game-form";
import { useGames } from "../contexts/games";
import PwaInstallButton from "../components/pwa-install-button";

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
        <PwaInstallButton />

        <button
          onClick={(e) => {
            e.target
              .closest(`.${theme.landingPage}`)
              .nextSibling.scrollIntoView({
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
      <section>
        <header>
          <h1>Location</h1>
        </header>
        <main>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d202.47334663880358!2d139.7979293720199!3d35.71211056125108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188ec6af0d5daf%3A0xb9b05ef5841365b9!2z44CSMTExLTAwMzMgVG9reW8sIFRhaXRvIENpdHksIEhhbmFrYXdhZG8sIDEtY2jFjW1l4oiSNeKIkjIg44K144OG44Op44Kk44OI44OV44K444OT44Or!5e0!3m2!1sen!2sjp!4v1675420143790!5m2!1sen!2sjp"
            style={{ border: 0, width: "100%", height: "600px" }}
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </main>
      </section>
    </main>
  );
}

export default HomePage;
