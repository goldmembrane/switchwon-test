import { Route, Routes } from "react-router-dom";
import "./App.css";
import LogIn from "./Login.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/home" element={<h1>Home Page</h1>} />
      </Routes>
    </>
  );
}

export default App;
