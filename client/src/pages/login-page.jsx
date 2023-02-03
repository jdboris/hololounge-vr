import theme from "@jdboris/css-themes/space-station";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/google-login-button";
import UserForm from "../components/user-form";
import { useAuth } from "../contexts/auth";

function LoginPage() {
  const {
    currentUser,
    signup,
    login,
    authenticate,
    error,
    setError,
    isLoading,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser]);

  if (currentUser) {
    return <main></main>;
  }

  return (
    <main>
      <UserForm
        mode="login"
        signup={signup}
        login={login}
        error={error}
        setError={setError}
        isLoading={isLoading}
      />
      <span className={theme.sideLines}>OR</span>
      <GoogleLoginButton
        onSuccess={(jwt) => {
          authenticate(jwt, "google");
          setError(null);
        }}
      />
    </main>
  );
}

export default LoginPage;
