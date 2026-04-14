import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TOKEN_KEY = "secret-santa-token";

const emptyRegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const emptyLoginForm = {
  email: "",
  password: "",
};

function App() {
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCurrentUser() {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load user");
        }

        setUser(data);
      } catch (error) {
        console.log(error);
        setError(error.message);
        setUser(null);
        setToken("");
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    fetchCurrentUser();
  }, [token]);

  function handleRegisterChange(event) {
    setRegisterForm({
      ...registerForm,
      [event.target.name]: event.target.value,
    });
  }

  function handleLoginChange(event) {
    setLoginForm({
      ...loginForm,
      [event.target.name]: event.target.value,
    });
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not register user");
      }

      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      setRegisterForm(emptyRegisterForm);
      setMessage("Registration successful.");
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not log in user");
      }

      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      setLoginForm(emptyLoginForm);
      setMessage("Login successful.");
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  }

  function handleLogout() {
    setToken("");
    setUser(null);
    setMessage("Logged out.");
    setError("");
    localStorage.removeItem(TOKEN_KEY);
  }

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Secret Santa Organizer</p>
      </section>

      {message ? <p className="message success">{message}</p> : null}
      {error ? <p className="message error">{error}</p> : null}

      <section className="auth-layout">
        <article className="auth-card">
          <h2>Register</h2>
          <form className="auth-form" onSubmit={handleRegister}>
            <label>
              First Name
              <input
                name="firstName"
                value={registerForm.firstName}
                onChange={handleRegisterChange}
                type="text"
                required
              />
            </label>

            <label>
              Last Name
              <input
                name="lastName"
                value={registerForm.lastName}
                onChange={handleRegisterChange}
                type="text"
                required
              />
            </label>

            <label>
              Email Address
              <input
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                type="email"
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                type="password"
                required
              />
            </label>

            <button type="submit">Create account</button>
          </form>
        </article>

        <article className="auth-card">
          <h2>Login</h2>
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Email Address
              <input
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                type="email"
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                type="password"
                required
              />
            </label>

            <button type="submit">Log in</button>
          </form>
        </article>
      </section>

      <section className="auth-card session-card">
        <h2>Session</h2>
        {user ? (
          <>
            <p>
              Welcome, <strong>{fullName}</strong>.
            </p>
            <p>Email: {user.email}</p>
            <button onClick={handleLogout} type="button">
              Log out
            </button>
          </>
        ) : (
          <p>No user is currently logged in.</p>
        )}
      </section>
    </main>
  );
}

export default App;
