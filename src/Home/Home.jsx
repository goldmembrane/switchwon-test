import { useState } from "react";
import axios from "axios";

import "./Home.css";
import Header from "./Header";
import Exchange from "./Exchange";
import History from "./History";

function Home() {
  const base = "/api";
  const [pageMode, setPageMode] = useState("EXCHANGE");
  const [exchangeHistory, setExchangeHistory] = useState([]);

  const fetchExchangeHistory = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`${base}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setExchangeHistory(response.data.data);
      })
      .catch((error) => {
        console.error("Failed to fetch exchange history:", error);
      });
  };

  return (
    <>
      <div className="home-main-container">
        <Header pageMode={pageMode} setPageMode={setPageMode} />

        {/* 환율 정보 */}
        <div
          className={`exchange-container ${
            pageMode !== "EXCHANGE" ? "hidden" : ""
          }`}
        >
          <Exchange fetchExchangeHistory={fetchExchangeHistory} />
        </div>

        {/* 환전 내역 */}
        <div
          className={`history-container ${
            pageMode !== "HISTORY" ? "hidden" : ""
          }`}
        >
          <History
            fetchExchangeHistory={fetchExchangeHistory}
            exchangeHistory={exchangeHistory}
          />
        </div>
      </div>
    </>
  );
}

export default Home;
