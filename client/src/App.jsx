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

const emptyEventForm = {
  title: "",
  description: "",
  eventDate: "",
  budget: "",
};

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { error: text } : {};
}

async function postAuthRequest(path, payload, fallbackMessage) {
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
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!token) {
        setUser(null);
        setEvents([]);
        return;
      }

      try {
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = await parseResponseBody(userResponse);

        if (!userResponse.ok) {
          throw new Error(userData.error || "Could not load user");
        }

        setUser(userData);

        const eventsResponse = await fetch(`${API_BASE_URL}/api/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const eventsData = await parseResponseBody(eventsResponse);

        if (!eventsResponse.ok) {
          throw new Error(eventsData.error || "Could not load events");
        }

        setEvents(eventsData);
      } catch (requestError) {
        setError(requestError.message || "Could not load data");
      }
    }

    loadSession();
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

  function handleEventChange(event) {
    setEventForm({
      ...eventForm,
      [event.target.name]: event.target.value,
    });
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsRegistering(true);

    try {
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
    } catch (requestError) {
      setError(requestError.message || "Could not register user");
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
    } catch (requestError) {
      setError(requestError.message || "Could not log in user");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleCreateEvent(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsCreatingEvent(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...eventForm,
          budget: Number(eventForm.budget),
        }),
      });

      const data = await parseResponseBody(response);

      if (!response.ok) {
        throw new Error(data.error || "Could not create event");
      }

      setEvents([data, ...events]);
      setEventForm(emptyEventForm);
      setMessage("Event created successfully.");
    } catch (requestError) {
      setError(requestError.message || "Could not create event");
    } finally {
      setIsCreatingEvent(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setEvents([]);
    setMessage("Logged out.");
    setError("");
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Secret Santa Organizer</p>
      </section>

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

      {!user ? (
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
      ) : (
        <>
          <section className="auth-card session-card">
            <h2>Session</h2>
            <p>
              Welcome,{" "}
              <strong>
                {user.first_name} {user.last_name}
              </strong>
              .
            </p>
            <p>Email: {user.email}</p>
            <button onClick={handleLogout} type="button">
              Log out
            </button>
          </section>

          <section className="auth-layout">
            <article className="auth-card">
              <h2>Create Event</h2>
              <form className="auth-form" onSubmit={handleCreateEvent}>
                <label>
                  Title
                  <input
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventChange}
                    type="text"
                    required
                  />
                </label>

                <label>
                  Description
                  <input
                    name="description"
                    value={eventForm.description}
                    onChange={handleEventChange}
                    type="text"
                    required
                  />
                </label>

                <label>
                  Event Date
                  <input
                    name="eventDate"
                    value={eventForm.eventDate}
                    onChange={handleEventChange}
                    type="date"
                    required
                  />
                </label>

                <label>
                  Budget
                  <input
                    name="budget"
                    value={eventForm.budget}
                    onChange={handleEventChange}
                    type="number"
                    min="0"
                    required
                  />
                </label>

                <button type="submit" disabled={isCreatingEvent}>
                  {isCreatingEvent ? "Saving event..." : "Create event"}
                </button>
              </form>
            </article>

            <article className="auth-card">
              <h2>Dashboard</h2>
              {events.length === 0 ? (
                <p>No events yet. Create your first event.</p>
              ) : (
                <div className="event-list">
                  {events.map((currentEvent) => (
                    <div className="event-card" key={currentEvent.id}>
                      <h3>{currentEvent.title}</h3>
                      <p>{currentEvent.description}</p>
                      <p>Date: {currentEvent.event_date?.slice(0, 10)}</p>
                      <p>Budget: ${currentEvent.budget}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
}

export default App;
