import theme from "@jdboris/css-themes/space-station";
import { useState } from "react";
import { FaRegEnvelope } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { Link } from "react-router-dom";
import InputError from "./input-error";

function UserForm({
  mode: defaultMode,
  user: defaultUser,
  signup,
  login,
  error,
  setError,
  isLoading,
}) {
  const [mode, setMode] = useState(defaultMode);
  const [user, setUser] = useState({ ...defaultUser });
  const [repeatPassword, setRepeatPassword] = useState("");

  function errorDetail(detail) {
    setError({
      ...error,
      details: {
        ...error?.details,
        ...detail,
      },
    });
  }

  return (
    <form
      autoComplete="on"
      className={theme.smallForm}
      onSubmit={(e) => {
        e.preventDefault();

        setError(null);

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
      <fieldset disabled={isLoading}>
        <div className={theme.h3}>
          {mode === "login" && "Login"} {mode === "signup" && "Signup"}
        </div>
        {error?.message && <div className={theme.error}>{error.message}</div>}
        <label>
          <InputError message={error?.details?.email} />

          <span>
            <FaRegEnvelope />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={user.email || ""}
              onChange={(e) =>
                setUser((old) => ({ ...old, email: e.target.value })) ||
                errorDetail({ email: null })
              }
            />
          </span>
        </label>
        <label>
          <InputError message={error?.details?.password} />

          <MdPassword />
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="password"
            value={user.password || ""}
            onChange={(e) =>
              setUser((old) => ({ ...old, password: e.target.value })) ||
              errorDetail({ password: null, repeatPassword: null })
            }
            onBlur={(e) =>
              repeatPassword &&
              e.target.value != repeatPassword &&
              errorDetail({ repeatPassword: "Passwords must match." })
            }
          />
        </label>
        {mode === "signup" && (
          <label>
            <InputError message={error?.details?.repeatPassword} />

            <MdPassword />
            <input
              type="password"
              name="repeatPassword"
              placeholder="Password (repeat)"
              value={repeatPassword}
              onChange={(e) =>
                setRepeatPassword(e.target.value) ||
                errorDetail({ repeatPassword: null })
              }
              onBlur={(e) =>
                e.target.value != user.password &&
                errorDetail({ repeatPassword: "Passwords must match." })
              }
            />
          </label>
        )}
        {mode === "login" && (
          <Link
            to={"/signup"}
            style={{ marginLeft: "1em", marginRight: "auto" }}
            onClick={() => {
              setError(null);
            }}
          >
            Signup
          </Link>
        )}
        {mode === "signup" && (
          <Link
            to={"/login"}
            style={{ marginLeft: "1em", marginRight: "auto" }}
            onClick={() => {
              setError(null);
            }}
          >
            Login
          </Link>
        )}
        <button>
          {mode === "login" && "Login"} {mode === "signup" && "Signup"}
        </button>
      </fieldset>
    </form>
  );
}

export default UserForm;
