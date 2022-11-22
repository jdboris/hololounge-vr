import theme from "@jdboris/css-themes/space-station/theme.module.scss";
import GoogleLoginButton from "../components/google-login-button";
import UserForm from "../components/user-form";
import { useAuth } from "../contexts/auth";

function SignupPage() {
  const { signup, authenticate, error, setError, isLoading } = useAuth();

  return (
    <main>
      <UserForm
        mode="signup"
        signup={signup}
        error={error}
        setError={setError}
        isLoading={isLoading}
      />
      <span className={theme.sideLines}>OR</span>
      <GoogleLoginButton
        onSuccess={(jwt) => {
          authenticate(jwt, "google");
        }}
      />
    </main>
  );
}

export default SignupPage;
