import { Route, Routes, useNavigate } from "react-router-dom";

function HelpPage() {
  const navigate = useNavigate();

  return (
    <main>
      <Routes>
        <Route path="/*" element={<>COMING SOON...</>}></Route>
      </Routes>
    </main>
  );
}

export default HelpPage;
