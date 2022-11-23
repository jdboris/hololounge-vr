import theme from "@jdboris/css-themes/space-station";
import { useState } from "react";
import {
  FaChevronDown,
  FaNetworkWired,
  FaUserAlt,
  FaWifi,
} from "react-icons/fa";

function HomePage() {
  const [isOpen, setIsOpen] = useState(false);

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
              <li
                className={theme.card}
                style={{ flexGrow: isOpen ? 1 : "initial" }}
                onClick={() => setIsOpen(true)}
              >
                <header>Among Us VR</header>
                <video
                  poster="https://cdn.akamai.steamstatic.com/steam/apps/1849900/header.jpg"
                  src="https://cdn.akamai.steamstatic.com/steam/apps/256910182/movie480_vp9.webm"
                  onClick={(e) =>
                    e.target.paused ? e.target.play() : e.target.pause()
                  }
                />
                <ul>
                  <li className={theme.badge}>casual</li>
                  <li className={theme.badge}>social</li>
                  <li className={theme.badge}>funny</li>
                </ul>
                <ul>
                  <li>
                    <FaUserAlt /> 4-10 (<FaNetworkWired /> <FaWifi />)
                  </li>
                </ul>
                {isOpen && (
                  <p>
                    Teamwork and betrayal in space! In this VR party game,
                    Crewmates work together to complete tasks before one or more
                    Impostors kill everyone aboard. Experience all of the same
                    deception and deceit as the original game, but now in your
                    own virtual spaceship.
                  </p>
                )}
              </li>
            </ul>
          </section>
        </main>
      </section>
    </main>
  );
}

export default HomePage;
