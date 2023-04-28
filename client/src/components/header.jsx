import theme from "@jdboris/css-themes/space-station";
import { useEffect, useRef, useState } from "react";
import {
  FaBars,
  FaCalendarAlt,
  FaFacebookSquare,
  FaInstagram,
  FaLocationArrow,
  FaRegCalendar,
  FaRegQuestionCircle,
  FaTwitter,
  FaVrCardboard,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdLanguage } from "react-icons/md";
import { TbMap2 } from "react-icons/tb";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { useLocalization } from "../contexts/localization";
import { useScrollRouting } from "../contexts/scroll-routing";

function Header() {
  const { language, setLanguage } = useLocalization();
  const location = useLocation();
  const { navigate, root } = useScrollRouting();
  const { currentUser, logout } = useAuth();

  const headerRef = useRef();

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
            headerRef.current && headerRef.current.scrollTo({ top: 0 });
          }}
        ></div>
      )}
      <header className={root == "/pos" ? theme.minimal : ""} ref={headerRef}>
        <nav className={isMenuOpen ? theme.open : ""}>
          <Link
            to={root == "/pos" ? "/pos/language" : "/"}
            onClick={(e) =>
              e.preventDefault() ||
              navigate(root == "/pos" ? "/pos/language" : "/")
            }
            className={theme.logo}
          >
            <img src="/logo.svg" />
            HoloLounge
          </Link>

          <ul
            onFocus={(e) => {
              headerRef.current && headerRef.current.scrollTo({ top: 0 });
              if (
                headerRef.current &&
                e.target.getBoundingClientRect().top + 5 >=
                  headerRef.current.getBoundingClientRect().bottom
              ) {
                setIsMenuOpen(true);
              }
            }}
          >
            {!location.pathname.startsWith("/pos") && (
              <>
                <li>
                  <a
                    className={theme.small}
                    href="https://goo.gl/maps/DENfphT6i7zmz3Z47"
                    target="_blank"
                  >
                    <TbMap2 />
                  </a>
                  <a
                    className={theme.small}
                    href="https://www.instagram.com/hololoungevr"
                    target="_blank"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    className={theme.small}
                    href="https://www.twitter.com/HoloLounge"
                    target="_blank"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    className={theme.small}
                    href="https://www.facebook.com/profile?id=100090034414820"
                    target="_blank"
                  >
                    <FaFacebookSquare />
                  </a>
                </li>

                <li>
                  <Link to="/catalog">
                    {isMenuOpen && <FaVrCardboard />}CATALOG
                  </Link>
                </li>
                <li>
                  <Link to="/help">
                    {isMenuOpen && <FaRegQuestionCircle />}HELP
                  </Link>
                </li>
                {currentUser && currentUser.isAdmin ? (
                  <li>
                    <Link to="/bookings">
                      {isMenuOpen && <FaCalendarAlt />}BOOKINGS
                    </Link>
                  </li>
                ) : (
                  ""
                )}
                {/* <li>
                  <Link to="/account">{isMenuOpen && <FaUser />}ACCOUNT</Link>
                </li> */}
              </>
            )}

            {root == "/pos" &&
              location.pathname != "/pos" &&
              location.pathname != "/pos/language" &&
              location.pathname != "/pos/landing" &&
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
                    CHECK IN
                  </Link>
                </li>
              )}
            {root == "/pos" &&
              location.pathname != "/pos" &&
              location.pathname != "/pos/language" &&
              location.pathname != "/pos/landing" &&
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
            {location.pathname != "/pos" &&
              location.pathname != "/pos/language" && (
                <li>
                  {language == "en-US" ? (
                    <button
                      className={theme.alt}
                      onClick={() => setLanguage("ja-JP")}
                    >
                      <MdLanguage /> 日本語
                    </button>
                  ) : (
                    <button
                      className={theme.alt}
                      onClick={() => setLanguage("en-US")}
                    >
                      <MdLanguage /> EN
                    </button>
                  )}
                </li>
              )}

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
                headerRef.current && headerRef.current.scrollTo({ top: 0 });
              }}
              onClick={(e) => {
                headerRef.current && headerRef.current.scrollTo({ top: 0 });
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
