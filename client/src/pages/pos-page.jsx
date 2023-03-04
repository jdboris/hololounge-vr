import theme from "@jdboris/css-themes/space-station";
import { useEffect, useRef } from "react";
import { FaLocationArrow, FaRegCalendar } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import BookNowButton from "../components/book-now-button";
import CheckInButton from "../components/check-in-button";
import { useScrollRouting } from "../contexts/scroll-routing";
import BookingPage from "./booking-page";
import CheckInPage from "./check-in-page";

function PosPage() {
  const location = useLocation();
  const { addSection, navigate } = useScrollRouting();
  const bookingSectionRef = useRef();
  const checkInSectionRef = useRef();

  useEffect(
    () => addSection({ route: "/pos/booking", ref: bookingSectionRef }),
    []
  );

  useEffect(
    () => addSection({ route: "/pos/check-in", ref: checkInSectionRef }),
    []
  );

  return (
    <main className={theme.posPage}>
      <div className={theme.landingPage}>
        <BookNowButton root="/pos" />
        <CheckInButton root="/pos" />
      </div>

      <section ref={bookingSectionRef} style={{ scrollMargin: "-3em" }}>
        <BookingPage />
      </section>

      <section ref={checkInSectionRef}>
        <CheckInPage />
      </section>

      {location.pathname != "/pos" && location.pathname != "/pos/booking" && (
        <Link
          to="/pos/booking"
          className={[theme.button, theme.fixedButton, theme.blue].join(" ")}
          onClick={(e) => e.preventDefault() || navigate("/pos/booking")}
        >
          <FaRegCalendar />
          BOOK NOW
        </Link>
      )}

      {location.pathname != "/pos" && location.pathname != "/pos/check-in" && (
        <Link
          to="/pos/check-in"
          className={[theme.button, theme.fixedButton, theme.orange].join(" ")}
          onClick={(e) => e.preventDefault() || navigate("/pos/check-in")}
        >
          <FaLocationArrow />
          CHECK IN NOW
        </Link>
      )}
    </main>
  );
}

export default PosPage;
