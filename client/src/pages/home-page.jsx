import theme from "@jdboris/css-themes/space-station";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaRegCalendar } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import BookNowButton from "../components/book-now-button";
import GameForm from "../components/game-form";
import PwaInstallButton from "../components/pwa-install-button";
import { useGames } from "../contexts/games";
import { useScrollRouting } from "../contexts/scroll-routing";
import BookingPage from "./booking-page";
import LocationPage from "./location-page";

function HomePage() {
  const { addSection, navigate } = useScrollRouting();
  const location = useLocation();
  const locationSectionRef = useRef();
  const bookingSectionRef = useRef();
  useEffect(
    () => addSection({ route: "/location", ref: locationSectionRef }),
    []
  );
  useEffect(
    () => addSection({ route: "/booking", ref: bookingSectionRef }),
    []
  );
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
        <BookNowButton />

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
            <main>
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
                      onUpdate={async () =>
                        setGames((await getGames()) || games)
                      }
                    />
                  </li>
                ))}
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
              </ul>
            </main>
          </section>
        </main>
      </section>
      <section ref={locationSectionRef}>
        <LocationPage />
      </section>
      <section ref={bookingSectionRef}>
        <BookingPage />
      </section>

      {location.pathname != "/" && location.pathname != "/booking" && (
        <button
          className={[theme.fixedButton, theme.blue].join(" ")}
          onClick={() => {
            navigate("/booking");
          }}
        >
          <FaRegCalendar /> Book Now
        </button>
      )}
    </main>
  );
}

export default HomePage;
