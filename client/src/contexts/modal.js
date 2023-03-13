import theme from "@jdboris/css-themes/space-station";
import React, { createContext, useContext, useEffect, useState } from "react";
import { HiX } from "react-icons/hi";

export const ModalContext = createContext();

function Modal({ content, setContent, canClose }) {
  return !content ? (
    <></>
  ) : (
    <div
      className={theme.overlay}
      style={{ position: "fixed" }}
      onClick={(e) =>
        canClose && e.target == e.currentTarget && setContent(null)
      }
    >
      <div className={theme.modal}>
        <header>
          {canClose && (
            <button
              className={theme.alt}
              onClick={() => canClose && setContent(null)}
            >
              <HiX />
            </button>
          )}
        </header>
        <main>{content}</main>
      </div>
    </div>
  );
}

export function ModalProvider({ children }) {
  const [canClose, setCanClose] = useState(true);
  const [modalContent, setModalContentRaw] = useState(null);

  function setModalContent(content, { canClose = true } = {}) {
    setCanClose(canClose);
    setModalContentRaw(content);
  }

  return (
    <ModalContext.Provider
      value={{
        setModalContent,
      }}
    >
      {children}
      <Modal
        content={modalContent}
        setContent={setModalContent}
        canClose={canClose}
      />
    </ModalContext.Provider>
  );
}

/**
 * @typedef ModalContextValue
 * @property {(content: string | React.ReactElement, {canClose = false} = {}) => undefined} setModalContent
 */

/**
 *  @returns {ModalContextValue}
 */
export function useModal() {
  return useContext(ModalContext);
}
