import theme from "@jdboris/css-themes/space-station";
import { useState } from "react";
import {
  FaChevronDown,
  FaNetworkWired,
  FaUserAlt,
  FaWifi,
} from "react-icons/fa";
import GameCard from "../components/game-card";

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
              <GameCard />
              <GameCard />
              <GameCard />
              <GameCard />
              <GameCard />
              <GameCard />
              <li className={theme.card + " " + theme.flexFiller}></li>
              <li className={theme.card + " " + theme.flexFiller}></li>
              <li className={theme.card + " " + theme.flexFiller}></li>
            </ul>
          </section>
        </main>
      </section>
    </main>
  );
}

export default HomePage;
