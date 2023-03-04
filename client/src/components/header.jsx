import theme from "@jdboris/css-themes/space-station";
import { useEffect, useState } from "react";
import {
  FaBars,
  FaLocationArrow,
  FaRegCalendar,
  FaVrCardboard,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdLanguage } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { useLocalization } from "../contexts/localization";
import { useScrollRouting } from "../contexts/scroll-routing";

function Header() {
  const { language, setLanguage } = useLocalization();
  const location = useLocation();
  const { navigate, root } = useScrollRouting();
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
          style={{ position: "fixed" }}
          onClick={(e) => {
            setIsMenuOpen(false);
            e.target.closest("header").scrollTo({ top: 0 });
          }}
        ></div>
      )}
      <header className={root == "/pos" ? theme.minimal : ""}>
        <nav className={isMenuOpen ? theme.open : ""}>
          <Link
            to={root == "/pos" ? "/pos" : "/"}
            onClick={(e) =>
              e.preventDefault() || navigate(root == "/pos" ? "/pos" : "/")
            }
            className={theme.logo}
          >
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
                  <Link to="/catalog">
                    {isMenuOpen && <FaVrCardboard />}CATALOG
                  </Link>
                </li>
                {/* <li>
                  <Link to="/account">{isMenuOpen && <FaUser />}ACCOUNT</Link>
                </li> */}
              </>
            )}

            {location.pathname != "/pos" &&
              location.pathname != "/pos/check-in" && (
                <li>
                  <Link
                    to="/pos/check-in"
                    className={[theme.button, theme.orange].join(" ")}
                    onClick={(e) =>
                      e.preventDefault() || navigate("/pos/check-in")
                    }
                  >
                    <FaLocationArrow />
                    CHECK IN NOW
                  </Link>
                </li>
              )}

            {location.pathname != "/pos" &&
              location.pathname != "/pos/booking" && (
                <li>
                  <Link
                    to="/pos/booking"
                    className={[theme.button, theme.blue].join(" ")}
                    onClick={(e) =>
                      e.preventDefault() || navigate("/pos/booking")
                    }
                  >
                    <FaRegCalendar />
                    BOOK NOW
                  </Link>
                </li>
              )}

            <li>
              {language == "EN" ? (
                <button className={theme.alt} onClick={() => setLanguage("JP")}>
                  <MdLanguage /> 日本語
                </button>
              ) : (
                <button className={theme.alt} onClick={() => setLanguage("EN")}>
                  <MdLanguage /> English
                </button>
              )}
            </li>

            {!location.pathname.startsWith("/pos") &&
              !isLoading &&
              (currentUser ? (
                <>
                  <li>
                    <button onClick={logout}>LOGOUT</button>
                  </li>
                </>
              ) : (
                <li>
                  <Link className={theme.button} to="/login">
                    LOGIN
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
