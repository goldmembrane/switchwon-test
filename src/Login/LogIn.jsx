import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./LogIn.css";

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
    <div className="login-container">
      <h1>반갑습니다.</h1>
      <label className="login-container-label">
        로그인 정보를 입력해주세요.
      </label>
      <div className="login-input-container">
        <label className="login-input-label">이메일 주소를 입력해주세요.</label>
        <input
          type="text"
          placeholder="Email"
          onChange={handleEmailChange}
          className="login-input"
          value={email}
        />

        <button onClick={handleSubmit} className="login-button">
          로그인하기
        </button>
      </div>
    </div>
  );
}

export default LogIn;
