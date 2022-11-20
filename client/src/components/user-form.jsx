import theme from "@jdboris/css-themes/space-station/theme.module.scss";
import { useState } from "react";
import { FaRegEnvelope } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";

function UserForm({ mode: defaultMode, user: defaultUser, signup, login }) {
  const [mode, setMode] = useState(defaultMode);
  const [user, setUser] = useState({ ...defaultUser });
  const [repeatPassword, setRepeatPassword] = useState("");
  const navigate = useNavigate();

  return (
    <form
      autoComplete="on"
      className={theme.smallForm}
      onSubmit={(e) => {
        e.preventDefault();

        if (mode === "signup") {
          signup(user);
          return;
        }

        if (mode === "login") {
          login(user);
          return;
        }
      }}
    >
      <div className={theme.h3}>
        {mode === "login" && "Login"} {mode === "signup" && "Signup"}
      </div>
      <label>
        <FaRegEnvelope />
        <input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          value={user.email || ""}
          onChange={(e) =>
            setUser((old) => ({ ...old, email: e.target.value }))
          }
        />
      </label>
      <label>
        <MdPassword />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="password"
          value={user.password || ""}
          onChange={(e) =>
            setUser((old) => ({ ...old, password: e.target.value }))
          }
        />
      </label>
      {mode === "signup" && (
        <label>
          <MdPassword />
          <input
            type="password"
            name="repeatPassword"
            placeholder="Password (repeat)"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </label>
      )}
      {mode === "login" && (
        <Link to={"/signup"} style={{ marginLeft: "1em", marginRight: "auto" }}>
          Signup
        </Link>
      )}
      {mode === "signup" && (
        <Link to={"/login"} style={{ marginLeft: "1em", marginRight: "auto" }}>
          Login
        </Link>
      )}
      <button>
        {mode === "login" && "Login"} {mode === "signup" && "Signup"}
      </button>
    </form>
  );
}

export default UserForm;
