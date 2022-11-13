import theme from "@jdboris/css-themes/space-station";
import { FaChevronDown } from "react-icons/fa";

function HomePage() {
  return (
    <main>
      <div
        className={theme.landingPage}
        style={{ backgroundImage: `url('landing-page.jpeg')` }}
      >
        <strong>HoloLounge</strong>
        <small>Relax, hang out, have fun.</small>

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
    </main>
  );
}

export default HomePage;
