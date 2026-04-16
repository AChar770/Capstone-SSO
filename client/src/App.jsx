import { useEffect, useState } from "react";
import "./App.css";

/*
  RECOMMENDED NEXT REFACTOR (refer to class examples!)

  WHY (Code Style + Documentation): App.jsx currently handles UI rendering, auth state,
  side effects, and API calls in one file. It works, but splitting responsibilities
  will make the code easier to read, test, and maintain as features grow.

  1) Add AuthContext + useAuth
     - Create an AuthProvider to hold shared auth state (user, token, auth errors,
       success messages, loading flags, and auth actions).
     - Expose a useAuth hook so components can access login/register/logout behavior
       without prop drilling.
     - Suggested files:
       - src/context/AuthContext.jsx
       - src/hooks/useAuth.js

  2) Move API logic out of App.jsx
     - Keep request/response helpers in a dedicated auth API module.
     - This keeps components focused on rendering and user interaction.
     - Suggested file:
       - src/api/authApi.js
     - Candidate functions to move:
       - parseResponseBody
       - postAuthRequest
       - getCurrentUser
       - loginUser
       - registerUser

  3) Split into smaller presentational components
     - Extract form UI and form-local state into separate components for clarity.
     - Suggested files:
       - src/components/RegisterForm.jsx
       - src/components/LoginForm.jsx
       - Optional: src/components/AuthMessage.jsx and src/components/SessionCard.jsx

  4) Keep App.jsx as composition/root layout
     - App should mostly compose sections and consume useAuth.
     - This improves single responsibility and aligns with modern React patterns used
       in class.

  Note: This is intentionally marked as recommendation (not required for correctness)
  so current behavior stays stable while refactor work is done incrementally.
*/

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

async function parseResponseBody(response) {
  // WHY (Functionality): Some server failures return non-JSON bodies, so a safe parser prevents the UI from crashing during auth error handling.
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { error: text } : {};
}

async function postAuthRequest(path, payload, fallbackMessage) {
  // WHY (Code Style): Reusing one helper for register/login keeps auth request logic consistent and easier for beginners to maintain.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const error = new Error(data.error || fallbackMessage);
    error.status = response.status;
    throw error;
  }

  return data;
}

function App() {
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchCurrentUser() {
      if (!token) {
        if (isMounted) {
          setUser(null);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await parseResponseBody(response);

        if (!response.ok) {
          const requestError = new Error(data.error || "Could not load user");
          requestError.status = response.status;
          throw requestError;
        }

        if (isMounted) {
          setUser(data);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        // WHY (Functionality): Only clear local auth state when the token is truly invalid (401), so temporary API outages do not force a logout.
        if (error.status === 401) {
          setUser(null);
          setToken("");
          localStorage.removeItem(TOKEN_KEY);
        }

        setError(error.message || "Could not load user");
      }
    }

    fetchCurrentUser();

    return () => {
      // WHY (Functionality): This marks the component as no longer active, so when an auth request finishes later, we skip state updates and avoid React warning/errors.
      isMounted = false;
    };
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
    setIsRegistering(true);

    try {
      // WHY (Functionality): Trimming email before submit reduces avoidable register failures caused by accidental spaces.
      const data = await postAuthRequest(
        "/api/auth/register",
        {
          ...registerForm,
          email: registerForm.email.trim(),
        },
        "Could not register user",
      );

      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      setRegisterForm(emptyRegisterForm);
      setMessage("Registration successful.");
    } catch (error) {
      setError(error.message || "Could not register user");
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoggingIn(true);

    try {
      // WHY (Functionality): Trimming email before submit keeps login resilient for common copy/paste or typing mistakes.
      const data = await postAuthRequest(
        "/api/auth/login",
        {
          ...loginForm,
          email: loginForm.email.trim(),
        },
        "Could not log in user",
      );

      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      setLoginForm(emptyLoginForm);
      setMessage("Login successful.");
    } catch (error) {
      setError(error.message || "Could not log in user");
    } finally {
      setIsLoggingIn(false);
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

      {/* WHY (Documentation): aria-live explains intent and helps users with assistive tech hear auth success/error updates as they happen. */}
      {message ? (
        <p className="message success" aria-live="polite">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="message error" aria-live="assertive">
          {error}
        </p>
      ) : null}

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

            <button type="submit" disabled={isRegistering}>
              {isRegistering ? "Creating account..." : "Create account"}
            </button>
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

            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Log in"}
            </button>
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
