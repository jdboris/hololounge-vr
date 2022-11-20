import theme from "@jdboris/css-themes/space-station/theme.module.scss";
import GoogleLoginButton from "../components/google-login-button";
import UserForm from "../components/user-form";
import { useAuth } from "../contexts/auth";

function LoginPage() {
  const { signup, login, authenticate } = useAuth();

  return (
    <main>
      <UserForm mode="login" signup={signup} login={login} />
      <span className={theme.sideLines}>OR</span>
      <GoogleLoginButton
        onSuccess={(jwt) => {
          authenticate(jwt, "google");
        }}
      />
    </main>
  );
}

export default LoginPage;
