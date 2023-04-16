import {
  FaFacebookSquare,
  FaHome,
  FaInstagram,
  FaPhoneAlt,
  FaRegEnvelope,
  FaTwitter,
} from "react-icons/fa";
import { TbMap2 } from "react-icons/tb";

function Footer() {
  return (
    <footer>
      <address>
        <span>
          <FaRegEnvelope />
          <a href="mailto:contact@hololounge.jp">contact@hololounge.jp</a>
        </span>
        <span>
          <FaPhoneAlt /> <a href="tel:815464645646">+81 050-5539-2069</a>
        </span>
        <span>
          <a href="https://goo.gl/maps/DENfphT6i7zmz3Z47" target="_blank">
            <FaHome />
            <span>〒111-0033</span>{" "}
            <span>Tokyo, Taito City, Hanakawado, 1-5-2</span>{" "}
            <span>サテライトフジビル 10F</span>
          </a>
        </span>
      </address>

      <div>
        <nav>
          <ul>
            <li>
              <a href="https://goo.gl/maps/DENfphT6i7zmz3Z47" target="_blank">
                <TbMap2 />
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/hololoungevr" target="_blank">
                <FaInstagram />
              </a>
            </li>
            <li>
              <a href="https://www.twitter.com/HoloLounge" target="_blank">
                <FaTwitter />
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/profile?id=100090034414820"
                target="_blank"
              >
                <FaFacebookSquare />
              </a>
            </li>
          </ul>
        </nav>
        ©{new Date().getFullYear()} 株式会社桜月
      </div>
    </footer>
  );
}

export default Footer;
