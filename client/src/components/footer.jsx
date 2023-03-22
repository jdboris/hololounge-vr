import { FaFacebookSquare, FaInstagram, FaTwitter } from "react-icons/fa";
import { TbMap2 } from "react-icons/tb";

function Footer() {
  return (
    <footer>
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
        ©{new Date().getFullYear()} 株式会社桜月
      </nav>
    </footer>
  );
}

export default Footer;
