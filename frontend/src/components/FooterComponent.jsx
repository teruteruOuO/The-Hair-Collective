import logo from "../assets/images/TheHairCollectiveLogo.png";
import instagram from "../assets/images/instagram.png";
import facebook from "../assets/images/facebook.png";
import tiktok from "../assets/images/tiktok.png";

export default function FooterComponent() {
    return (
        <footer className="fade-in-from-right">
            <h1>The Hair Collective</h1>
            <section className="links">
                <img src={logo} alt="THC Logo" />
                <ul>
                    <li>
                        <a href="https://www.google.com/">
                            <img src={instagram} alt="instagram" />
                        </a>
                    </li>
                    <li>
                        <a href="https://www.google.com/">
                            <img src={facebook} alt="facebook" />
                        </a>
                    </li>
                    <li>
                        <a href="https://www.google.com/">
                            <img src={tiktok} alt="tiktok" />
                        </a>
                    </li>
                </ul>
                <p>© 2025 The Hair Collective. All Rights Reserved.</p>
            </section>
        </footer>
    );
}