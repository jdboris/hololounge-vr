import { BrowserRouter, Route, Routes } from "react-router-dom";
import theme from "@jdboris/css-themes/space-station";
import Footer from "./components/footer";
import Header from "./components/header";
import HomePage from "./pages/home-page";

function App() {
  return (
    <div className={theme.root}>
      <BrowserRouter>
        <Header></Header>

        <Routes>
          <Route path="/" element={<HomePage />}></Route>
        </Routes>

        <Footer></Footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
