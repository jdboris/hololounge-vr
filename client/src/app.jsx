import { BrowserRouter, Route, Routes } from "react-router-dom";
import theme from "@jdboris/css-themes/space-station";
import Footer from "./components/footer";
import Header from "./components/header";
import HomePage from "./pages/home-page";
import LoginPage from "./pages/login-page";
import { AuthProvider } from "./contexts/auth";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className={theme.root}>
          <Header></Header>

          <Routes>
            <Route path="/login" element={<LoginPage />}></Route>

            <Route path="/" element={<HomePage />}></Route>
          </Routes>

          <Footer></Footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
