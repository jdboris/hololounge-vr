import theme from "@jdboris/css-themes/space-station";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import BookNowButton from "../components/book-now-button";
import CheckInButton from "../components/check-in-button";
import { useScrollRouting } from "../contexts/scroll-routing";
import LanguagePage from "./language-page";
import BookingPage from "./booking-page";
import CheckInPage from "./check-in-page";

function PosPage() {
  const location = useLocation();
  const { addSection, navigate } = useScrollRouting();
  const languageSectionRef = useRef();
  const landingSectionRef = useRef();
  const bookingSectionRef = useRef();
  const checkInSectionRef = useRef();

  useEffect(
    () => addSection({ route: "/pos/language", ref: languageSectionRef }),
    []
  );

  useEffect(
    () => addSection({ route: "/pos/landing", ref: landingSectionRef }),
    []
  );

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
      <section ref={languageSectionRef}>
        <LanguagePage />
      </section>

      <div ref={landingSectionRef} className={theme.landingPage}>
        <BookNowButton root="/pos" />
        <CheckInButton root="/pos" />
      </div>

      <section ref={bookingSectionRef} style={{ scrollMargin: "-3em" }}>
        <BookingPage />
      </section>

      <section ref={checkInSectionRef}>
        <CheckInPage />
      </section>
    </main>
  );
}

export default PosPage;
