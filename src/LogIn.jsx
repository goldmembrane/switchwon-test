import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LogIn() {
  const base = "/api";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(`${base}/auth/login`, null, {
        params: { email },
      })
      .then((response) => {
        console.log("Login successful:", response.data);
        localStorage.setItem("token", response.data.data.token);
        navigate("/home");
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            "Login failed:",
            error.response.status,
            error.response.data
          );
        } else {
          console.error("Login failed:", error.message);
        }
      });
  };

  return (
    <div>
      <h1>LogIn Page</h1>
      <input
        type="text"
        placeholder="Email"
        onChange={handleEmailChange}
        value={email}
      />

      <button onClick={handleSubmit}>LogIn</button>
    </div>
  );
}

export default LogIn;
