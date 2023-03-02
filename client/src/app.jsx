import theme from "@jdboris/css-themes/space-station";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/footer";
import Header from "./components/header";
import { AuthProvider } from "./contexts/auth";
import { GameProvider } from "./contexts/games";
import { ModalProvider } from "./contexts/modal";
import { ScrollRoutingProvider } from "./contexts/scroll-routing";
import { TagProvider } from "./contexts/tags";
import GamePage from "./pages/game-page";
import HomePage from "./pages/home-page";
import LoginPage from "./pages/login-page";
import PosPage from "./pages/pos-page";
import SignupPage from "./pages/signup-page";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TagProvider>
          <GameProvider>
            <div className={theme.root}>
              <ModalProvider>
                <ScrollRoutingProvider roots={["/pos", "/"]}>
                  <Header></Header>

                  <Routes>
                    <Route path="/login" element={<LoginPage />}></Route>
                    <Route path="/signup" element={<SignupPage />}></Route>
                    <Route
                      path="/games"
                      element={
                        <main>
                          <GamePage />
                        </main>
                      }
                    ></Route>

                    <Route
                      path="/pos/*"
                      element={<PosPage path="/pos" />}
                    ></Route>

                    <Route path="/*" element={<HomePage />}></Route>
                  </Routes>

                  <Footer></Footer>
                </ScrollRoutingProvider>
              </ModalProvider>
            </div>
          </GameProvider>
        </TagProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
