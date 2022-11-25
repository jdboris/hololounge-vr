import theme from "@jdboris/css-themes/space-station";
import { useEffect, useRef, useState } from "react";
import { FaNetworkWired, FaUserAlt, FaWifi } from "react-icons/fa";
import { MdClose } from "react-icons/md";

function GameCard() {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current) {
      if (isOpen) {
        videoRef.current.play();
        videoRef.current.scrollIntoView({
          alignToTop: true,
          behavior: "smooth",
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  return (
    <li className={theme.card + " " + (isOpen ? theme.open : "")}>
      <div className={theme.overlay} onClick={() => setIsOpen(false)}></div>
      {!isOpen && (
        <img
          onClick={() => setIsOpen(true)}
          src="https://cdn.akamai.steamstatic.com/steam/apps/1849900/header.jpg"
        />
      )}
      {isOpen && (
        <video
          ref={videoRef}
          poster="https://cdn.akamai.steamstatic.com/steam/apps/1849900/header.jpg"
          src="https://cdn.akamai.steamstatic.com/steam/apps/256910182/movie480_vp9.webm"
          onClick={(e) =>
            e.target.paused ? e.target.play() : e.target.pause()
          }
        />
      )}
      <header>
        <span onClick={() => setIsOpen(true)}>Among Us VR</span>
        {isOpen && (
          <button className={theme.altButton} onClick={() => setIsOpen(false)}>
            <MdClose />
          </button>
        )}
      </header>
      {isOpen && (
        <main>
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
          <p>
            Teamwork and betrayal in space! In this VR party game, Crewmates
            work together to complete tasks before one or more Impostors kill
            everyone aboard. Experience all of the same deception and deceit as
            the original game, but now in your own virtual spaceship.
          </p>
        </main>
      )}
    </li>
  );
}

export default GameCard;
