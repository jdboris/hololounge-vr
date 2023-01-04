import { useEffect, useState } from "react";
import theme from "@jdboris/css-themes/space-station";
import { FaBars, FaUser, FaVrCardboard } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdLanguage } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth";

function Header() {
  const { currentUser, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onScroll = (e) => {
      if (window.scrollY > 0) {
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header>
      <nav className={isMenuOpen ? theme.open : ""}>
        <Link
          to="/"
          // className={theme.logo}
        >
          <img src="logo.svg" />
        </Link>

        <div
          className={theme.overlay}
          onClick={(e) => {
            setIsMenuOpen(false);
            e.target.closest("header").scrollTo({ top: 0 });
          }}
        ></div>
        <ul
          onFocus={(e) => {
            e.target.closest("header").scrollTo({ top: 0 });
            if (
              e.target.getBoundingClientRect().top + 5 >=
              e.target.closest("header").getBoundingClientRect().bottom
            ) {
              setIsMenuOpen(true);
            }
          }}
        >
          <li>
            <Link to="/games">{isMenuOpen && <FaVrCardboard />} Games</Link>
          </li>
          <li>
            <Link to="/account">{isMenuOpen && <FaUser />} Account</Link>
          </li>
          <li>
            <button className={theme.altButton}>
              <MdLanguage /> {isMenuOpen && "Language"}
            </button>
          </li>
          {!isLoading &&
            (currentUser ? (
              <>
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <li>
                <Link className={theme.button} to="/login">
                  Login
                </Link>
              </li>
            ))}
        </ul>

        <button
          className={theme.altButton}
          onFocus={(e) => {
            e.target.closest("header").scrollTo({ top: 0 });
          }}
          onClick={(e) => {
            e.target.closest("header").scrollTo({ top: 0 });
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          {!isMenuOpen ? <FaBars /> : <IoMdClose />}
        </button>
      </nav>
    </header>
  );
}

export default Header;
