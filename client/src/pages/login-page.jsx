import theme from "@jdboris/css-themes/space-station";
import { useContext } from "react";
import { useEffect } from "react";
import GoogleLoginButton from "../components/google-login-button";
import { AuthContext, useAuth } from "../contexts/auth";

function LoginPage() {
  const { authenticate } = useAuth();

  return (
    <main>
      <GoogleLoginButton
        onSuccess={(jwt) => {
          authenticate(jwt, "google");
        }}
      />
    </main>
  );
}

export default LoginPage;
