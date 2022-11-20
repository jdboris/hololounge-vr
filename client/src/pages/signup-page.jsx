import UserForm from "../components/user-form";
import { useAuth } from "../contexts/auth";

function SignupPage() {
  const { currentUser, signup, login, authenticate } = useAuth();

  return (
    <main>
      <UserForm mode="signup" signup={signup} />
    </main>
  );
}

export default SignupPage;
