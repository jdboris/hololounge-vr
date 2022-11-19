import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [errors, setErrors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (errors && errors.length) console.error(errors);
  }, [errors]);

  async function login(username, password) {
    if (isLoading) return;

    try {
      setIsLoading(true);
    } catch (error) {
      setErrors([error]);
    } finally {
      setIsLoading(false);
    }
  }

  async function authenticate(jwt, strategy) {
    if (isLoading) return;

    try {
      setIsLoading(true);

      localStorage.setItem("authToken", jwt);
      const response = await fetch(`/api/auth`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ strategy }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data.error;
      }

      setCurrentUser(data.user);
      return true;
    } catch (error) {
      setErrors([error]);
    } finally {
      setIsLoading(false);
    }

    return false;
  }

  async function logout() {
    if (isLoading) return;

    try {
      setIsLoading(true);
    } catch (error) {
      setErrors([error]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        authenticate,
        logout,
        isLoading,
        errors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * @typedef AuthContextValue
 * @property {Object | null} currentUser
 * @property {(username: any, password: any) => Promise<void>} login
 * @property {(jwt: any, strategy: string) => Promise<boolean | undefined>} authenticate
 * Send the given `jwt` to the backend for authetication. Saves the token in local storage and sets the `currentUser` state.
 * @property {() => Promise<void>} logout
 * @property {boolean} isLoading
 * @property {never[]} errors
 */

/**
 *  @returns {AuthContextValue}
 */
export function useAuth() {
  return useContext(AuthContext);
}
