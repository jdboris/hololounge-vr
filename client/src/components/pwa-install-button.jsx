import { useState } from "react";
import { useEffect } from "react";
import theme from "@jdboris/css-themes/space-station";

let globalDeferredEvent = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  globalDeferredEvent = e;
});

function PwaInstallButton() {
  const [deferredEvent, setDeferredEvent] = useState(globalDeferredEvent);

  useEffect(() => {
    if (!deferredEvent) {
      const saveEvent = (e) => {
        e.preventDefault();
        setDeferredEvent(e);
      };
      window.addEventListener("beforeinstallprompt", saveEvent);

      return () => window.removeEventListener("beforeinstallprompt", saveEvent);
    }

    if (deferredEvent) {
      setDeferredEvent(deferredEvent);
    }
  }, []);

  if (!deferredEvent) {
    return <></>;
  }

  return (
    <button
      className={theme.installButton}
      onClick={async () => {
        deferredEvent.prompt();

        // Find out whether the user confirmed the installation or not
        const { outcome } = await deferredEvent.userChoice;

        setDeferredEvent(null);

        // Act on the user's choice
        if (outcome === "accepted") {
          console.log("User accepted the install prompt.");
        } else if (outcome === "dismissed") {
          console.log("User dismissed the install prompt");
        }
      }}
    >
      Install The App
    </button>
  );
}

export default PwaInstallButton;
