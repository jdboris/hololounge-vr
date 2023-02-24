import theme from "@jdboris/css-themes/space-station";
import { useEffect, useRef } from "react";
import { FaChevronDown, FaRegCalendar } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import BookNowButton from "../components/book-now-button";
import { useScrollRouting } from "../contexts/scroll-routing";
import BookingPage from "./booking-page";
import LocationPage from "./location-page";

function PosPage() {
  const location = useLocation();
  const { addSection, navigate } = useScrollRouting();
  const locationSectionRef = useRef();
  const bookingSectionRef = useRef();
  useEffect(
    () => addSection({ route: "/pos/location", ref: locationSectionRef }),
    []
  );
  useEffect(
    () => addSection({ route: "/pos/booking", ref: bookingSectionRef }),
    []
  );

  return (
    <main className={theme.posPage}>
      <div className={theme.landingPage}>
        <BookNowButton root="/pos" />
      </div>

      <section ref={bookingSectionRef}>
        <BookingPage />
      </section>

      {location.pathname != "/pos" && location.pathname != "/pos/booking" && (
        <button
          className={[theme.fixedButton, theme.blue].join(" ")}
          onClick={() => {
            navigate("/pos/booking");
          }}
        >
          <FaRegCalendar /> Book Now
        </button>
      )}
    </main>
  );
}

export default PosPage;
