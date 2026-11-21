import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { showMessage } from '../../services/messageService';
import '../../styles/login.scss';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const valid = form.username.trim() !== '' && form.password.trim() !== '';

  useEffect(() => {
    if (!userService.isLoggedIn()) userService.removeToken();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try {
      const { data: response } = await userService.login(form);
      if (response.token) {
        userService.storeToken(response.token);
        const userInfo = userService.getUserInfoFromToken();
        if (!userInfo) {
          showMessage('Invalid token data', 3000);
          return;
        }
        if (userInfo.role === 'Doctor') {
          localStorage.setItem('DoctorUserId', userInfo.id);
          navigate('/doctor');
        } else if (userInfo.role === 'User') {
          localStorage.setItem('PatientUserId', userInfo.id);
          navigate('/patient');
        } else if (userInfo.role === 'Admin') {
          navigate('/admin');
        } else {
          showMessage('Unknown user role', 3000);
        }
      } else {
        showMessage('No token received', 3000);
      }
    } catch (error: any) {
      console.error('Login failed', error);
      const status = error.response?.status;
      const body = error.response?.data;
      if (status === 403 && body === 'Your account has been blocked. Please contact admin.') {
        showMessage('You have been blocked temporarily due to misconduct.', 4000);
      } else if (status === 401 && body === 'Invalid password') {
        showMessage('Invalid password.', 3000);
      } else {
        showMessage('Invalid login details.', 3000);
      }
    }
  };

  return (
    <div className="sc-login">
      <div className="login-page">
        <main className="container" role="main" aria-label="Login Form">
          <div className="brand-row">
            <img src="/logo.svg" alt="Medora AI logo" width={56} height={56} />
            <span className="brand-name">Medora <b>AI</b></span>
          </div>
          <h1 className="login-title" style={{ textAlign: 'center' }}>Welcome to Medora AI Healthcare</h1>
          <p className="login-subtext">Smarter care, powered by AI. Sign in to continue your health journey.</p>

          <section className="login-card" aria-labelledby="login-title">
            <form onSubmit={onSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="username" className="form-label">User Name</label>
                <input
                  id="username" type="text" placeholder="User Name" className="form-input"
                  autoComplete="username" required aria-required="true"
                  value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password" type="password" placeholder="Password" className="form-input"
                  autoComplete="current-password" required aria-required="true"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={!valid}>Sign In</button>

              <p className="signup-prompt">
                Not a member?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/Register'); }} className="signup-link">Sign Up</a>
              </p>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
