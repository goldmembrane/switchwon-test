import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { formatCurrency } from "../Util/utils";
import "./Home.css";

function Home() {
  const base = "/api";
  const navigate = useNavigate();

  const [pageMode, setPageMode] = useState("EXCHANGE");
  const [exchangeRateUSD, setExchangeRateUSD] = useState(null);
  const [exchangeRateJPY, setExchangeRateJPY] = useState(null);
  const [totalBalanceKRW, setTotalBalanceKRW] = useState(0);
  const [KRWWallet, setKRWWallet] = useState(null);
  const [USDWallet, setUSDWallet] = useState(null);
  const [JPYWallet, setJPYWallet] = useState(null);

  const fetchExchangeRate = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${base}/exchange-rates/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const byCurrency = response.data.data.reduce((acc, cur) => {
        acc[cur.currency] = cur;
        return acc;
      }, {});
      setExchangeRateUSD(byCurrency["USD"]);
      setExchangeRateJPY(byCurrency["JPY"]);
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
    }
  };

  const fetchWallets = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`${base}/wallets`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTotalBalanceKRW(response.data.data.totalKrwBalance);
        const byCurrency = response.data.data.wallets.reduce((acc, cur) => {
          acc[cur.currency] = cur;
          return acc;
        }, {});
        setKRWWallet(byCurrency["KRW"]);
        setUSDWallet(byCurrency["USD"]);
        setJPYWallet(byCurrency["JPY"]);
      })
      .catch((error) => {
        console.error("Failed to fetch wallets:", error);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetchExchangeRate();
    fetchWallets();

    // Refresh exchange rates every 1 minute
    const intervalId = setInterval(() => {
      fetchExchangeRate();
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const [amountToExchange, setAmountToExchange] = useState(0);
  const [resultEstimate, setResultEstimate] = useState(0);
  const [appliedRate, setAppliedRate] = useState(0);
  const [country, setCountry] = useState("USD");
  const [exchangeMode, setExchangeMode] = useState("BUY");

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmountToExchange(val);

    if (val === "") return;
    const num = Number(val);
    if (!Number.isNaN(num)) {
      fetchExchangeEstimate(country, num);
    }
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);

    if (selectedCountry === "") return;
    fetchExchangeEstimate(selectedCountry, amountToExchange);
  };

  const fetchExchangeEstimate = (
    toCountry = country,
    amount = amountToExchange
  ) => {
    const token = localStorage.getItem("token");
    axios
      .get(`${base}/orders/quote`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          fromCurrency: "KRW",
          toCurrency: toCountry,
          forexAmount: amount,
        },
      })
      .then((response) => {
        console.log("Exchange estimate:", response.data);
        setResultEstimate(response.data.data.krwAmount);
        setAppliedRate(response.data.data.appliedRate);
      })
      .catch((error) => {
        console.error("Failed to fetch exchange estimate:", error);
      });
  };

  const orderExchange = (retry = false) => {
    // 환전 주문 처리 로직 (생략)
    const token = localStorage.getItem("token");
    const body = {
      exchangeRateId:
        country === "USD"
          ? exchangeRateUSD.exchangeRateId
          : exchangeRateJPY.exchangeRateId,
      fromCurrency: exchangeMode === "BUY" ? "KRW" : country,
      toCurrency: exchangeMode === "BUY" ? country : "KRW",
      forexAmount: amountToExchange,
    };

    axios
      .post(`${base}/orders`, body, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Exchange order placed:", response.data);
        // 새로 주문이 체결되면 지갑 정보를 갱신
        try {
          fetchWallets();
          fetchExchangeHistory();
        } catch (err) {
          console.error("Failed to refresh wallets after order:", err);
        }
      })
      .catch((error) => {
        console.error("Failed to place exchange order:", error);
        const code = error?.response?.data?.code;
        if (code === "EXCHANGE_RATE_CURRENCY_MISMATCH" && !retry) {
          // refresh rates, then retry once
          fetchExchangeRate()
            .then(() => {
              orderExchange(true);
            })
            .catch((err) => {
              console.error(
                "Failed to refresh exchange rates before retry:",
                err
              );
            });
        }
      });
  };

  useEffect(() => {
    if (amountToExchange !== 0) fetchExchangeEstimate();
  }, []);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchExchangeHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  console.log(pageMode);

  return (
    <>
      <div className="home-main-container">
        <nav className="home-navigator">
          <div className="home-app-title">Exchange app</div>

          <div className="home-navigator-button-container">
            <button
              className={`home-navigator-button ${
                pageMode === "EXCHANGE" ? "active" : ""
              }`}
              onClick={() => setPageMode("EXCHANGE")}
            >
              환전하기
            </button>
            <button
              className={`home-navigator-button ${
                pageMode === "HISTORY" ? "active" : ""
              }`}
              onClick={() => setPageMode("HISTORY")}
            >
              환전내역
            </button>
            {/* 로그아웃 버튼 */}
            <button className="logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </nav>

        {/* 환율 정보 부분 */}
        <div
          className={`exchange-container ${
            pageMode !== "EXCHANGE" ? "hidden" : ""
          }`}
        >
          <h2 className="exchange-title">환율 정보</h2>
          <div className="exchange-label">
            실시간 환율을 확인하고 간편하게 환전하세요.
          </div>

          <div className="exchange-content">
            <div className="rate-wallet-container">
              <div className="exchange-info">
                <div className="exchange-information-container">
                  <div className="exchange-information">
                    <label className="exchange-currency">USD</label>
                    <label className="exchange-currency-korean">
                      미국 달러
                    </label>
                  </div>
                  <div className="exchange-rate">
                    {exchangeRateUSD
                      ? `${exchangeRateUSD.rate}KRW`
                      : "Loading..."}
                  </div>
                  <div
                    className={`exchange-percentage ${
                      exchangeRateUSD?.changePercentage &&
                      exchangeRateUSD.changePercentage > 0
                        ? "plus"
                        : "minus"
                    }`}
                  >
                    {exchangeRateUSD
                      ? `${exchangeRateUSD.changePercentage}%`
                      : "Loading..."}
                  </div>
                </div>

                <div className="exchange-information-container">
                  <div className="exchange-information">
                    <label className="exchange-currency">JPY</label>
                    <label className="exchange-currency-korean">
                      일본 엔화
                    </label>
                  </div>
                  <div className="exchange-rate">
                    {exchangeRateJPY
                      ? `${exchangeRateJPY.rate}KRW`
                      : "Loading..."}
                  </div>
                  <div
                    className={`exchange-percentage ${
                      exchangeRateJPY?.changePercentage &&
                      exchangeRateJPY.changePercentage > 0
                        ? "plus"
                        : "minus"
                    }`}
                  >
                    {exchangeRateJPY
                      ? `${exchangeRateJPY.changePercentage}%`
                      : "Loading..."}
                  </div>
                </div>
              </div>
              {/* 사용자 지갑 조회 부분 */}
              <div className="wallet-container">
                <label className="wallet-label">내 지갑</label>
                <div className="wallet-content-container">
                  <div className="wallet-content">
                    <label className="wallet-currency">KRW</label>
                    <div className="wallet-currency-amount">
                      {KRWWallet
                        ? `\u20A9 ${formatCurrency(KRWWallet.balance)}`
                        : "Loading..."}
                    </div>
                  </div>
                  <div className="wallet-content">
                    <label className="wallet-currency">USD</label>
                    <div className="wallet-currency-amount">
                      {USDWallet
                        ? `$ ${formatCurrency(USDWallet.balance)}`
                        : "Loading..."}
                    </div>
                  </div>
                  <div className="wallet-content">
                    <label className="wallet-currency">JPY</label>
                    <div className="wallet-currency-amount">
                      {JPYWallet
                        ? `\u00A5 ${formatCurrency(JPYWallet.balance)}`
                        : "Loading..."}
                    </div>
                  </div>
                </div>
                <div className="wallet-total-container">
                  <label className="wallet-total-currency">총 보유 자산</label>
                  <div className="wallet-total-amount">
                    {totalBalanceKRW
                      ? `\u20A9 ${formatCurrency(totalBalanceKRW)}`
                      : "Loading..."}
                  </div>
                </div>
              </div>
            </div>

            {/* 환전 관련 부분*/}
            <div className="exchange-action-container">
              <select
                value={country}
                onChange={handleCountryChange}
                className="select-country-container"
              >
                <option value="USD" className="exchange-country">
                  USD
                </option>
                <option value="JPY" className="exchange-country">
                  JPY
                </option>
              </select>
              <div className="select-exchange-mode">
                <div
                  className={`exchange-mode-button ${
                    exchangeMode === "BUY"
                      ? "selected mode-buy"
                      : "mode-buy-label"
                  }`}
                  onClick={() => setExchangeMode("BUY")}
                >
                  살래요
                </div>
                <div
                  className={`exchange-mode-button ${
                    exchangeMode === "SELL"
                      ? "selected mode-sell"
                      : "mode-sell-label"
                  }`}
                  onClick={() => setExchangeMode("SELL")}
                >
                  팔래요
                </div>
              </div>
              <label className="exchange-label">
                {exchangeMode === "BUY" ? "매수 금액" : "매도 금액"}
              </label>
              <div className="exchange-amount-input-container">
                <input
                  type="number"
                  placeholder="환전할 금액"
                  value={amountToExchange}
                  onChange={handleAmountChange}
                  className="exchange-amount-input"
                />
                <span className="exchange-amount-label">
                  {country === "USD" ? "달러" : "엔화"}
                </span>
                <span className="exchange-amount-label">
                  {exchangeMode === "BUY" ? "사기" : "팔기"}
                </span>
              </div>
              <label className="exchange-label">필요 원화</label>
              <div className="estimate-container">
                <div />
                <div>
                  {amountToExchange && resultEstimate && (
                    <span className="estimate-text">{resultEstimate} </span>
                  )}
                  <span
                    className={`estimate-note ${
                      exchangeMode === "BUY" ? "buy" : "sell"
                    }`}
                  >
                    {exchangeMode === "BUY"
                      ? "원 필요해요"
                      : "원 받을 수 있어요"}
                  </span>
                </div>
              </div>
              <div className="applied-rate-container">
                <label className="applied-rate-label">적용 환율</label>
                <div className="applied-rate-content">
                  <span className="applied-rate">
                    {country === "USD" ? "1 USD = " : "1 JPY = "}
                  </span>
                  <div className="applied-rate">
                    {appliedRate ? `${appliedRate}원` : "Loading..."}
                  </div>
                </div>
              </div>
              <button
                onClick={orderExchange}
                className="exchange-action-button"
              >
                환전하기
              </button>
            </div>
          </div>

          <div></div>
        </div>

        {/* 환전 내역 부분 */}
        <div
          className={`history-container ${
            pageMode !== "HISTORY" ? "hidden" : ""
          }`}
        >
          <h2 className="history-title">환전 내역</h2>
          <div className="history-label">환전 내역을 확인하실 수 있어요.</div>
          {exchangeHistory.length === 0 ? (
            <div>No exchange history available.</div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>거래 ID</th>
                    <th>거래 일시</th>
                    <th style={{ textAlign: "right" }}>매수 금액</th>
                    <th style={{ textAlign: "right" }}>체결 환율</th>
                    <th style={{ textAlign: "right" }}>매도 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {exchangeHistory.map((h) => (
                    <tr key={h.orderId}>
                      <td>{h.orderId ?? "-"}</td>
                      <td>{h.orderedAt.replace(/T/, " ")}</td>
                      <td style={{ textAlign: "right" }}>
                        {formatCurrency(h.fromAmount ?? "-")}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {h.appliedRate ?? h.exchangeRate ?? "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {formatCurrency(h.toAmount ?? "-")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
