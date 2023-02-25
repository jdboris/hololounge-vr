import theme from "@jdboris/css-themes/space-station";
import { Link } from "react-router-dom";
import { useScrollRouting } from "../contexts/scroll-routing";

function CheckInButton({ root = "" }) {
  const { navigate } = useScrollRouting();
  return (
    <Link
      className={[theme.button, theme.orange].join(" ")}
      to={root + "/check-in"}
      onClick={(e) => e.preventDefault() || navigate(root + "/check-in")}
    >
      Check In Now
    </Link>
  );
}

export default CheckInButton;
