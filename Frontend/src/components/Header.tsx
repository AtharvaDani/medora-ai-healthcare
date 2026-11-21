import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import '../styles/header.scss';

export interface NavItem {
  name: string;
  route: string;
}

export default function Header({ navItems }: { navItems: NavItem[] }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const navigateTo = (route: string) => {
    setOpen(false);
    navigate(route.startsWith('/') ? route : '/' + route);
  };

  const logout = () => {
    userService.removeToken();
    ['userQuery', 'aiResponse', 'loadingState', 'sessionActive'].forEach((k) => localStorage.removeItem(k));
    navigate('/login');
  };

  return (
    <div className="sc-header">
      <header>
        <nav className="navbar navbar-expand-lg medora-nav">
          <div className="container-fluid">
            <a className="navbar-brand medora-brand" href="#" onClick={(e) => e.preventDefault()}>
              <img src="/logo.svg" width={38} height={38} alt="Medora AI logo" className="applogo" />
              <span>Medora <b>AI</b></span>
            </a>

            <button
              className="navbar-toggler"
              type="button"
              aria-controls="navbarSupportedContent"
              aria-expanded={open}
              aria-label="Toggle navigation"
              onClick={() => setOpen(!open)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className={`collapse navbar-collapse${open ? ' show' : ''}`} id="navbarSupportedContent">
              <ul className="nav navbar-nav ms-auto align-items-lg-center">
                {navItems.map((item) => {
                  const target = item.route.startsWith('/') ? item.route : '/' + item.route;
                  return (
                    <li className="nav-item" key={item.name}>
                      <button
                        className={`nav-link${pathname.toLowerCase().includes(target.toLowerCase()) ? ' active-nav' : ''}`}
                        onClick={() => navigateTo(item.route)}
                      >
                        {item.name === 'Ask AI' && <i className="bi bi-stars me-1"></i>}
                        {item.name}
                      </button>
                    </li>
                  );
                })}
                <li className="nav-item">
                  <button className="nav-link logout" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
