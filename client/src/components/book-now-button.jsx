import theme from "@jdboris/css-themes/space-station";
import { Link } from "react-router-dom";
import { useScrollRouting } from "../contexts/scroll-routing";

function BookNowButton({ root = "" }) {
  const { navigate } = useScrollRouting();
  return (
    <Link
      className={[theme.button, theme.blue].join(" ")}
      to={root + "/booking"}
      onClick={() => navigate(root + "/booking")}
    >
      Book Now
    </Link>
  );
}

export default BookNowButton;
