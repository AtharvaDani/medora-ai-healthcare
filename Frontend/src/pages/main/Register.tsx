import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { showMessage } from '../../services/messageService';
import '../../styles/register.scss';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', emailid: '', role: '' });
  const valid = Object.values(form).every((v) => v.trim() !== '');
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await userService.addUser(form);
      navigate('/login');
    } catch (error: any) {
      console.error('Error registering user', error);
      if (error.response?.status === 400) {
        const body = error.response.data;
        showMessage(typeof body === 'string' ? body : 'Registration failed. Try again.', 3000);
      } else {
        showMessage('Registration failed. Try again.', 3000);
      }
    }
  };

  return (
    <div className="sc-register">
      <div className="registration-page">
        <main className="container" role="main" aria-label="Registration Form">
          <div className="brand-row">
            <img src="/logo.svg" alt="Medora AI logo" width={56} height={56} />
            <span className="brand-name">Medora <b>AI</b></span>
          </div>
          <h1 className="registration-title" style={{ textAlign: 'center' }}>Join Medora AI Healthcare</h1>
          <p className="registration-subtext">Create your free account and take the first step toward smarter care.</p>

          <section className="registration-card" aria-labelledby="registration-title">
            <form onSubmit={onSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="username" className="form-label">User Name</label>
                <input id="username" type="text" placeholder="User Name" className="form-input"
                  autoComplete="username" required aria-required="true" value={form.username} onChange={set('username')} />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input id="password" type="password" placeholder="Password" className="form-input"
                  autoComplete="new-password" required aria-required="true" value={form.password} onChange={set('password')} />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input id="email" type="email" placeholder="Enter email" className="form-input"
                  autoComplete="email" required aria-required="true" value={form.emailid} onChange={set('emailid')} />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Select Your Role</label>
                <select id="role" className="form-select" required value={form.role} onChange={set('role')}>
                  <option value="" disabled>Select your role</option>
                  <option value="User">User</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={!valid}>Register</button>

              <p className="login-prompt">
                Already a member?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="login-link">Login</a>
              </p>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
