import theme from "@jdboris/css-themes/space-station";
import { AiOutlineExclamationCircle } from "react-icons/ai";

export default function InputError({ message }) {
  return !message ? (
    <></>
  ) : (
    <div className={theme.error}>
      <AiOutlineExclamationCircle /> {message}
    </div>
  );
}
