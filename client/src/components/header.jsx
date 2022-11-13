import { useEffect, useState } from "react";
import theme from "@jdboris/css-themes/space-station";
import { FaBars } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const currentUser = null;
  const login = () => {};
  const logout = () => {};

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

        {!isLoading &&
          (currentUser ? (
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
              {currentUser && currentUser.isAuthor && (
                <li>
                  <Link to="/article/new">New Article</Link>
                </li>
              )}

              <li>
                <Link to={`/user/${currentUser.id}`}>Profile</Link>
              </li>

              {currentUser && currentUser.isAdmin && (
                <li>
                  <Link to="/settings">Settings</Link>
                </li>
              )}

              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
              <li>
                <button onClick={login}>Login</button>
              </li>
            </ul>
          ))}

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
