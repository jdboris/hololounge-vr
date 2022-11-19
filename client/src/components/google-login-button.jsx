import { useRef } from "react";
import { useEffect } from "react";

function load(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function GoogleLoginButton({ onSuccess }) {
  const divRef = useRef();

  useEffect(() => {
    (async () => {
      await load("https://accounts.google.com/gsi/client");
      const { google } = window;

      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
        callback: (response) => {
          console.log("response: ", response);
          onSuccess(response.credential);
        },
      });

      google.accounts.id.renderButton(
        divRef.current,
        { theme: "outline", size: "large" } // customization attributes
      );
      // google.accounts.id.prompt(); // also display the One Tap dialog
    })();
  }, []);

  return <div ref={divRef}></div>;
}

export default GoogleLoginButton;
