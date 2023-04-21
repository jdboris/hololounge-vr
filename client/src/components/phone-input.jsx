import { useRef, useState } from "react";
import ReactPhoneInput2 from "react-phone-input-2";

export default function PhoneInput({
  onChange,
  name,
  inputMode,
  onTouchStart,
  onTouchEnd,
  value,
  ...props
}) {
  const componentRef = useRef();
  // const [selectionStart, setSelectionStart] = useState(null);
  // const [selectionEnd, setSelectionEnd] = useState(null);
  const [isComposition, setIsComposition] = useState(false);

  // useEffect(() => {
  //   if (selectionStart !== null && selectionEnd !== null) {
  //     const textbox = componentRef.current.numberInputRef;
  //     textbox.setSelectionRange(selectionStart, selectionEnd);
  //     setSelectionStart(null);
  //     setSelectionEnd(null);
  //   }
  // }, [value]);

  return (
    <ReactPhoneInput2
      ref={componentRef}
      {...props}
      // NOTE: autoFormat breaks IME composition
      autoFormat={false}
      value={value}
      countryCodeEditable={false}
      inputProps={{
        name,
        inputMode,
        type: "text",

        onChange: (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (isComposition && e.nativeEvent.inputType == "insertText") {
            setIsComposition(false);
            return;
          }

          // setSelectionStart(e.target.selectionStart);
          // setSelectionEnd(e.target.selectionEnd);

          onChange(e.target.value, null, e, null);
        },

        onCompositionStart: (e) => {
          setIsComposition(true);
        },
        // value: value,
      }}
    />
  );
}
