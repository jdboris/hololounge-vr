import theme from "@jdboris/css-themes/space-station";
import { FaChevronDown } from "react-icons/fa";

function HomePage() {
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
    </main>
  );
}

export default HomePage;
