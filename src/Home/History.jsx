import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { formatCurrency } from "../Util/utils";
import "./History.css";

function HistoryRow({ h }) {
  return (
    <tr>
      <td>{h.orderId ?? "-"}</td>
      <td>{h.orderedAt ? h.orderedAt.replace(/T/, " ") : "-"}</td>
      <td style={{ textAlign: "right" }}>
        {h.fromAmount ? formatCurrency(h.fromAmount) : "-"}
      </td>
      <td style={{ textAlign: "right" }}>
        {h.appliedRate ?? h.exchangeRate ?? "-"}
      </td>
      <td style={{ textAlign: "right" }}>
        {h.toAmount ? formatCurrency(h.toAmount) : "-"}
      </td>
    </tr>
  );
}

function History(props) {
  const navigate = useNavigate();

  const { fetchExchangeHistory, exchangeHistory } = props;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchExchangeHistory();
  }, [navigate]);

  return (
    <div>
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
                <HistoryRow key={h.orderId} h={h} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;
