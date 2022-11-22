import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   if (error) console.error(error);
  // }, [error]);

  useEffect(() => {
    (async () => {
      setCurrentUser(await getCurrentUser());
    })();
  }, []);

  async function getCurrentUser() {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/auth/current-user`, {
        method: "GET",

        credentials: "same-origin",
      });

      const { error, user } = await response.json();

      if (!response.ok) {
        throw error;
      }

      return user;
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }

    return null;
  }

  async function login({ email, password }) {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const { error, user } = await response.json();

      if (!response.ok) {
        throw error;
      }

      setCurrentUser(user);
      return true;
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }

    return false;
  }

  async function authenticate(jwt, strategy) {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/auth`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ strategy }),
      });

      const { error } = await response.json();

      if (!response.ok) {
        throw error;
      }

      const user = await getCurrentUser();
      console.log("after google: ", user);
      setCurrentUser(user);
      return true;
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }

    return false;
  }

  async function signup({ email, password }) {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const { error, user } = await response.json();

      if (!response.ok) {
        throw error;
      }

      setCurrentUser(user);
      return true;
    } catch (error) {
      setError(error);
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
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        signup,
        login,
        authenticate,
        logout,
        isLoading,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * @typedef AuthContextValue
 * @property {Object | null} currentUser
 * @property {({ email: string, password: string }) => Promise<boolean | undefined>} signup
 * @property {(username: any, password: any) => Promise<void>} login
 * @property {(jwt: any, strategy: string) => Promise<boolean | undefined>} authenticate
 * Send the given `jwt` to the backend for authetication. Saves the token in local storage and sets the `currentUser` state.
 * @property {() => Promise<void>} logout
 * @property {boolean} isLoading
 * @property {never[]} error
 * @property {React.Dispatch<React.SetStateAction<null>>} setError
 */

/**
 *  @returns {AuthContextValue}
 */
export function useAuth() {
  return useContext(AuthContext);
}
