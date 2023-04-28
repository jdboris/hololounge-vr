import theme from "@jdboris/css-themes/space-station";
import { useLocalization } from "../contexts/localization";
import { FaLanguage } from "react-icons/fa";
import { useScrollRouting } from "../contexts/scroll-routing";

export default function LanguagePage() {
  const { setLanguage } = useLocalization();
  const { navigate } = useScrollRouting();
  return (
    <div className={theme.languagePage}>
      <button
        className={theme.japanese}
        onClick={() => {
          setLanguage("ja-JP");
          navigate("/pos/landing");
        }}
      >
        日本語
      </button>
      <button
        className={theme.english}
        onClick={() => {
          setLanguage("en-US");
          navigate("/pos/landing");
        }}
      >
        English
      </button>
    </div>
  );
}
