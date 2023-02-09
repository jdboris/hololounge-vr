import theme from "@jdboris/css-themes/space-station";
import React, { createContext, useContext, useEffect, useState } from "react";
import { HiX } from "react-icons/hi";

export const ModalContext = createContext();

function Modal({ content, setContent }) {
  return !content ? (
    <></>
  ) : (
    <div className={theme.overlay} onClick={() => setContent(null)}>
      <div className={theme.modal}>
        <header>
          <button className={theme.alt} onClick={() => setContent(null)}>
            <HiX />
          </button>
        </header>
        <main>{content}</main>
      </div>
    </div>
  );
}

export function ModalProvider({ children }) {
  const [modalContent, setModalContent] = useState();

  return (
    <ModalContext.Provider
      value={{
        setModalContent,
      }}
    >
      {children}
      <Modal content={modalContent} setContent={setModalContent} />
    </ModalContext.Provider>
  );
}

/**
 * @typedef ModalContextValue
 * @property {(content: string | React.ReactElement) => undefined} setModalContent
 */

/**
 *  @returns {ModalContextValue}
 */
export function useModal() {
  return useContext(ModalContext);
}
