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
            <div>Hours (every day)</div>
            <time className={theme.green}>1:00-24:00</time>
          </div>
          <div>
            <div>Last check-in</div>
            <time className={theme.tan}>22:55</time>
          </div>
          <div className={theme.row}>
            <FaBuilding />
            <span> 〒111-0033</span> <span>東京都台東区花川戸1-5-2</span>{" "}
            <span>サテライトフジビル10階</span>{" "}
          </div>
        </address>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d202.47334663880358!2d139.7979293720199!3d35.71211056125108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188ec6af0d5daf%3A0xb9b05ef5841365b9!2z44CSMTExLTAwMzMgVG9reW8sIFRhaXRvIENpdHksIEhhbmFrYXdhZG8sIDEtY2jFjW1l4oiSNeKIkjIg44K144OG44Op44Kk44OI44OV44K444OT44Or!5e0!3m2!1sen!2sjp!4v1675420143790!5m2!1sen!2sjp"
          style={{ border: 0, width: "100%", height: "600px" }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </main>
    </div>
  );
}

export default LocationPage;
