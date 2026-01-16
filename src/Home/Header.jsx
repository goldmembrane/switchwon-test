import "./Header.css";

function Header(props) {
  const { pageMode, setPageMode } = props;
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
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
  );
}

export default Header;
