import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <img src="/favicon.svg" alt="SmartShelf" className="brand-icon" />
        </span>
        <span>SmartShelf</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/search">Search</NavLink>
        {token && <NavLink to="/dashboard">Dashboard</NavLink>}
      </nav>

      <div className="nav-actions">
        {token ? (
          <>
            <span className="pill">{user?.fullName}</span>
            <button className="ghost-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link className="primary-button" to="/auth">Join Now</Link>
        )}
      </div>
    </header>
  );
}
