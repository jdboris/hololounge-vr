import theme from "@jdboris/css-themes/space-station";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/footer";
import Header from "./components/header";
import { AuthProvider } from "./contexts/auth";
import { GameProvider } from "./contexts/games";
import { ModalProvider } from "./contexts/modal";
import { TagProvider } from "./contexts/tags";
import GamePage from "./pages/game-page";
import HomePage from "./pages/home-page";
import LoginPage from "./pages/login-page";
import SignupPage from "./pages/signup-page";

function App() {
  // // Add the Springboard Booking Widget
  // useEffect(() => {
  //   (function () {
  //     window.SpringboardVRWidget = {
  //       url: "https://customer.springboardvr.com",
  //       reservationUUID: "1eb9c7a0-9cd0-11ed-8119-538252e85149",
  //       mini: 0,
  //       color_button_background: "#000000",
  //       color_button_text: "#ffffff",
  //       button_text: "Book Now",
  //     };
  //     var e = document.createElement("script");
  //     e.type = "text/javascript";
  //     e.src = window.SpringboardVRWidget.url + "/static/embed/embed.js";
  //     document.getElementsByTagName("head")[0].appendChild(e);
  //     var t = document.createElement("link");
  //     t.href = window.SpringboardVRWidget.url + "/static/embed/embed.css";
  //     t.rel = "stylesheet";
  //     document.getElementsByTagName("head")[0].appendChild(t);
  //     var n = document.createElement("link");
  //     n.href = "https://fonts.googleapis.com/css?family=Open+Sans:600";
  //     n.rel = "stylesheet";
  //     document.getElementsByTagName("head")[0].appendChild(n);
  //   })();
  // });

  return (
    <BrowserRouter>
      <AuthProvider>
        <TagProvider>
          <GameProvider>
            <div className={theme.root}>
              <ModalProvider>
                <Header></Header>

                <Routes>
                  <Route path="/login" element={<LoginPage />}></Route>
                  <Route path="/signup" element={<SignupPage />}></Route>

                  <Route path="/games" element={<GamePage />}></Route>

                  <Route path="/" element={<HomePage />}></Route>
                </Routes>

                <Footer></Footer>
              </ModalProvider>
            </div>
          </GameProvider>
        </TagProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
