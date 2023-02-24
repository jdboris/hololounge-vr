import { useEffect, useState } from "react";
import theme from "@jdboris/css-themes/space-station";
import { FaBars, FaUser, FaVrCardboard } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdLanguage } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth";

function Header() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {isMenuOpen && (
        <div
          className={theme.overlay}
          onClick={(e) => {
            setIsMenuOpen(false);
            e.target.closest("header").scrollTo({ top: 0 });
          }}
        ></div>
      )}
      <header>
        <nav className={isMenuOpen ? theme.open : ""}>
          <Link to="/" className={theme.logo}>
            <img src="/logo.svg" />
            HoloLounge
          </Link>

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
            {!location.pathname.startsWith("/pos") && (
              <>
                <li>
                  <Link to="/games">
                    {isMenuOpen && <FaVrCardboard />} Games
                  </Link>
                </li>
                <li>
                  <Link to="/account">{isMenuOpen && <FaUser />} Account</Link>
                </li>
              </>
            )}

            <li>
              <button className={theme.alt}>
                <MdLanguage /> English
              </button>
            </li>

            {!location.pathname.startsWith("/pos") &&
              !isLoading &&
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

          {!location.pathname.startsWith("/pos") && (
            <button
              className={theme.alt}
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
          )}
        </nav>
      </header>
    </>
  );
}

export default Header;
