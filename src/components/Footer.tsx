import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../dist/css/Footer.css";

function Footer() {
    return (
        <div className="footer">
            <div className="footer__content">
                <p className="footer__text">Made by Rajat Yadav</p>
                <Link to="https://github.com/RajatYadav01" className="footer__link">
                    <i className="bi bi-github"></i>
                </Link>
            </div>
        </div>
    );
}

export default Footer