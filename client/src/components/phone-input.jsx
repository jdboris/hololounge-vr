import { useEffect, useRef } from "react";
import ReactPhoneInput2 from "react-phone-input-2";

export default function PhoneInput({ onChange, ...props }) {
  const componentRef = useRef();

  useEffect(() => {
    if (componentRef && componentRef.current) {
      const textbox = componentRef.current.numberInputRef;

      if (textbox) {
        // NOTE: The default input event handler breaks IME composition
        const oninput = (e) => {
          e.preventDefault();
          e.stopPropagation();

          onChange(e.target.value, null, e, null);
        };
        textbox.addEventListener("input", oninput);

        return () => {
          textbox.removeEventListener("input", oninput);
        };
      }
    }
  }, [componentRef]);

  return (
    <ReactPhoneInput2
      ref={componentRef}
      onChange={onChange}
      {...props}
      // NOTE: autoFormat breaks IME composition
      autoFormat={false}
    />
  );
}
