import React, { createContext, useContext, useEffect, useState } from "react";

export const TagContext = createContext();

export function TagProvider({ children }) {
  const [error, setError] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   if (error) console.error(error);
  // }, [error]);

  async function getTags() {
    try {
      const response = await fetch(`/api/tags/all`, {
        method: "GET",
        credentials: "same-origin",
      });

      const { error, tags } = await response.json();

      if (!response.ok) {
        throw error;
      }

      return tags;
    } catch (error) {
      setError(error);
    }

    return null;
  }

  async function saveTag(tag) {
    try {
      if ("id" in tag) {
      } else {
        const response = await fetch(`/api/tags`, {
          method: "POST",
          credentials: "same-origin",
          body: JSON.stringify(tag),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const { error, ...data } = await response.json();

        if (!response.ok) {
          throw error;
        }

        return data.tag;
      }
    } catch (error) {
      setError(error);
    }

    return null;
  }

  return (
    <TagContext.Provider
      value={{
        getTags,
        saveTag,
        isLoading,
        error,
        setError,
      }}
    >
      {children}
    </TagContext.Provider>
  );
}

/**
 * @typedef TagContextValue
 * @property {() => Promise<Array | undefined>} getTags
 * @property {(tag: any) => Promise<void>} saveTag
 */

/**
 *  @returns {TagContextValue}
 */
export function useTags() {
  return useContext(TagContext);
}
