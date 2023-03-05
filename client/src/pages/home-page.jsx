import theme from "@jdboris/css-themes/space-station";
import { useEffect, useRef } from "react";
import { FaChevronDown, FaRegCalendar } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import BookNowButton from "../components/book-now-button";
import PwaInstallButton from "../components/pwa-install-button";
import { useScrollRouting } from "../contexts/scroll-routing";
import BookingPage from "./booking-page";
import GamePage from "./game-page";
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

  return (
    <main>
      <div
        className={theme.landingPage}
        style={{ backgroundImage: `url('landing-page.jpeg')` }}
      >
        <strong>Casual VR Fun</strong>
        <small>Try something new. Stay a while.</small>
        <BookNowButton />
        <PwaInstallButton />

        <button
          onClick={(e) => {
            navigate("/location");
          }}
        >
          <FaChevronDown />
        </button>
      </div>
      <section>
        <GamePage onlyFeatured={true} />
      </section>
      <section ref={locationSectionRef}>
        <LocationPage />
      </section>
      <section ref={bookingSectionRef}>
        <BookingPage />
      </section>

      {location.pathname != "/" && location.pathname != "/booking" && (
        <Link
          to="/booking"
          className={[theme.button, theme.fixedButton, theme.blue].join(" ")}
          onClick={(e) => e.preventDefault() || navigate("/booking")}
        >
          <FaRegCalendar /> BOOK NOW
        </Link>
      )}
    </main>
  );
}

export default HomePage;
