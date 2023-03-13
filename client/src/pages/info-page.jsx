import theme from "@jdboris/css-themes/space-station";
import { Link } from "react-router-dom";
import { useScrollRouting } from "../contexts/scroll-routing";

function InfoPage() {
  const { navigate } = useScrollRouting();

  return (
    <div className={theme.infoPage}>
      <main>
        <div>
          <img src="/img/interior-shot.jpg" />
        </div>
        <aside>
          <h4>Welcome to HoloLounge!</h4>
          <div>
            <span>
              Here you can kick back, relax, experience virtual reality alone or
              with friends.
            </span>
          </div>
          <div className={theme.h4}>How?</div>
          <ol>
            <li>
              <Link
                to="/booking"
                onClick={(e) => e.preventDefault() || navigate("/booking")}
              >
                Book a VR station
              </Link>{" "}
              online or in-store
            </li>
            <li>Check in when it's time to start</li>
            <li>Put on your VR headset and enjoy!</li>
          </ol>
          <span>
            Visit the <Link to="/help">HELP</Link> page for more info.
          </span>
          <div className={theme.h4}>Price</div>
          ¥2,000/hour per station*
          <small>
            <em>* One headset per station</em>
          </small>
          <small>
            <em>* Multple patrons per station is OK!</em>
          </small>
        </aside>
      </main>
    </div>
  );
}

export default InfoPage;
