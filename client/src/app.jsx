import { BrowserRouter, Route, Routes } from "react-router-dom";
import theme from "@jdboris/css-themes/space-station";
import Footer from "./components/footer";
import Header from "./components/header";
import HomePage from "./pages/home-page";
import LoginPage from "./pages/login-page";
import { AuthProvider } from "./contexts/auth";
import SignupPage from "./pages/signup-page";
import GamePage from "./pages/game-page";
import { TagProvider } from "./contexts/tags";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TagProvider>
          <div className={theme.root}>
            <Header></Header>

            <Routes>
              <Route path="/login" element={<LoginPage />}></Route>
              <Route path="/signup" element={<SignupPage />}></Route>

              <Route path="/games" element={<GamePage />}></Route>

              <Route path="/" element={<HomePage />}></Route>
            </Routes>

            <Footer></Footer>
          </div>
        </TagProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
