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

function AppleLoginButton({ onSuccess }) {
  const divRef = useRef();

  useEffect(() => {
    (async () => {
      await load(
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
      );
      const { AppleID } = window;

      AppleID.auth.init({
        clientId: process.env.REACT_APP_APPLE_OAUTH_CLIENT_ID,
        scope: "[SCOPES]",
        redirectURI: location.origin,
        state: "[STATE]",
        nonce: "[NONCE]",
        usePopup: true,
      });

      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_APPLE_OAUTH_CLIENT_ID,
        callback: (response) => {
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

  return (
    <div
      ref={divRef}
      data-color="black"
      data-border="true"
      data-type="sign in"
    ></div>
  );
}

export default AppleLoginButton;
