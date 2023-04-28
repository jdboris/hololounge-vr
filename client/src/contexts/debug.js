import React, { createContext, useContext, useState } from "react";

export const DebugContext = createContext();

function DebugDiv({ content, setContent, canClose }) {
  return !content ? (
    <></>
  ) : (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        zIndex: "9999",
        opacity: "0.3",
      }}
      onClick={(e) =>
        canClose && e.target == e.currentTarget && setContent(null)
      }
    >
      {content}
    </div>
  );
}

export function DebugProvider({ children }) {
  const [canClose, setCanClose] = useState(true);
  const [debugContent, setDebugContentRaw] = useState(null);

  function setDebugContent(content, { canClose = true } = {}) {
    setCanClose(canClose);
    setDebugContentRaw(content);
  }

  return (
    <DebugContext.Provider
      value={{
        setDebugContent,
      }}
    >
      {children}
      <DebugDiv
        content={debugContent}
        setContent={setDebugContent}
        canClose={canClose}
      />
    </DebugContext.Provider>
  );
}

/**
 * @typedef DebugContextValue
 * @property {(content: string | React.ReactElement, {canClose = false} = {}) => undefined} setDebugContent
 */

/**
 *  @returns {DebugContextValue}
 */
export function useDebug() {
  return useContext(DebugContext);
}
