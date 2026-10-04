import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(readStoredUser);

  // authResponse is the { token, name, email, role } from the API
  function login(authResponse) {
    localStorage.setItem("token", authResponse.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: authResponse.name,
        email: authResponse.email,
        role: authResponse.role,
      })
    );
    setToken(authResponse.token);
    setUser({
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
    });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const isOwner = user && user.role === "OWNER";

  return (
    <AuthContext.Provider value={{ token, user, isOwner, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
