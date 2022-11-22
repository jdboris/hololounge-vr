import UserForm from "../components/user-form";
import { useAuth } from "../contexts/auth";

function SignupPage() {
  const { currentUser, signup, error, setError } = useAuth();

  return (
    <main>
      <UserForm
        mode="signup"
        signup={signup}
        error={error}
        setError={setError}
      />
    </main>
  );
}

export default SignupPage;
