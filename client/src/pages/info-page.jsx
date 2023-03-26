import theme from "@jdboris/css-themes/space-station";
import { Link } from "react-router-dom";
import { useScrollRouting } from "../contexts/scroll-routing";

const GRAND_OPENING_SALE = false;

function InfoPage() {
  const { navigate } = useScrollRouting();

  return (
    <div className={theme.infoPage}>
      <main>
        <figure>
          <div
            style={{ backgroundImage: "url('/img/interior-shot.jpg')" }}
          ></div>
        </figure>
        <aside>
          <div>
            <h4>Welcome!</h4>
            Kick back, relax, and have some fun in virtual reality. Alone or
            with friends, enjoy a casual and comfortable experience at your own
            pace.
          </div>
          <div>
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
          </div>
          <div>
            <div className={theme.h4}>Price</div>
            {GRAND_OPENING_SALE ? (
              <span className={theme.price} style={{ marginTop: "0.5em" }}>
                <img src="/img/small-sale-sticker.png" />
                <span className={theme.old}>
                  <small>¥</small>
                  <span>2,000</span>
                </span>
                <small>¥</small>1,000<small>/hr</small>
              </span>
            ) : (
              <span className={theme.price}>
                <small>¥</small>2,000<small>/hr</small>
              </span>
            )}{" "}
            per station
            <small>
              <em>* One headset per station</em>
            </small>
            <small>
              <em>* Multple guests per station is OK!</em>
            </small>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default InfoPage;
