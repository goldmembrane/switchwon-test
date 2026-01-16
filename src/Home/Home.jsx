import { useState } from "react";

import "./Home.css";
import Header from "./Header";
import Exchange from "./Exchange";
import History from "./History";

function Home() {
  const [pageMode, setPageMode] = useState("EXCHANGE");

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
          <Exchange />
        </div>

        {/* 환전 내역 */}
        <div
          className={`history-container ${
            pageMode !== "HISTORY" ? "hidden" : ""
          }`}
        >
          <History />
        </div>
      </div>
    </>
  );
}

export default Home;
