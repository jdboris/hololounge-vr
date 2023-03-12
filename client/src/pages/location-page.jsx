import theme from "@jdboris/css-themes/space-station";
import { FaBuilding } from "react-icons/fa";

function LocationPage() {
  return (
    <div className={theme.locationPage}>
      <header>
        <h1>Location</h1>
      </header>
      <main>
        <address>
          <div>
            <span>Hours (every day)</span>
            <div>
              <time className={theme.green}>10:00-23:00</time>
            </div>
          </div>
          <div>
            <span>Last check-in</span>
            <div>
              <time className={theme.tan}>21:55</time>
            </div>
          </div>
          <div className={theme.row}>
            <FaBuilding />
            <span> 〒111-0033</span> <span>東京都台東区花川戸1-5-2</span>{" "}
            <span>サテライトフジビル10階</span>{" "}
          </div>
        </address>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d404.9471929898952!2d139.79782113830157!3d35.71201220979492!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188f33a7b6c1cf%3A0x3774e978c4fb3543!2sHoloLounge%20VR!5e0!3m2!1sen!2sjp!4v1678423330108!5m2!1sen!2sjp"
          style={{ border: 0, width: "100%", height: "600px" }}
          allowFullscreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </main>
    </div>
  );
}

export default LocationPage;
