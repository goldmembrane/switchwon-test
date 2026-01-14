import { Route, Routes } from "react-router-dom";
import "./App.css";
import LogIn from "./Login/LogIn.jsx";
import Home from "./Home/Home.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
