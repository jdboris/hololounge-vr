import theme from "@jdboris/css-themes/space-station";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/footer";
import Header from "./components/header";
import { AuthProvider } from "./contexts/auth";
import { GameProvider } from "./contexts/games";
import { Localizationprovider } from "./contexts/localization";
import { ModalProvider } from "./contexts/modal";
import { ScrollRoutingProvider } from "./contexts/scroll-routing";
import { TagProvider } from "./contexts/tags";
import GamePage from "./pages/game-page";
import HelpPage from "./pages/help-page";
import HomePage from "./pages/home-page";
import LoginPage from "./pages/login-page";
import PosPage from "./pages/pos-page";
import SignupPage from "./pages/signup-page";

function App() {
  if (localStorage.getItem("pos")) {
    return (
      <BrowserRouter>
        <AuthProvider>
          <Localizationprovider>
            <div className={theme.root}>
              <ModalProvider>
                <ScrollRoutingProvider roots={["/pos", "/"]}>
                  <Header></Header>

                  <Routes>
                    <Route path="/help/*" element={<HelpPage />}></Route>

                    <Route
                      path="/pos/*"
                      element={<PosPage path="/pos" />}
                    ></Route>

                    <Route path="/*" element={<PosPage path="/pos" />}></Route>
                  </Routes>

                  <Footer></Footer>
                </ScrollRoutingProvider>
              </ModalProvider>
            </div>
          </Localizationprovider>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Localizationprovider>
          <TagProvider>
            <GameProvider>
              <div className={theme.root}>
                <ModalProvider>
                  <ScrollRoutingProvider
                    roots={[
                      "/pos",
                      "/catalog",
                      "/help",
                      "/login",
                      "/signup",
                      "/",
                    ]}
                  >
                    <Header></Header>

                    <Routes>
                      <Route
                        path="/login"
                        element={
                          <LoginPage
                            onLogin={(user) =>
                              user &&
                              user.email == "pos@hololounge.jp" &&
                              localStorage.setItem("pos", 1) &&
                              window.location.reload()
                            }
                          />
                        }
                      ></Route>
                      <Route path="/signup" element={<SignupPage />}></Route>
                      <Route
                        path="/catalog"
                        element={
                          <main>
                            <GamePage />
                          </main>
                        }
                      ></Route>
                      <Route path="/help/*" element={<HelpPage />}></Route>

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
        </Localizationprovider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
