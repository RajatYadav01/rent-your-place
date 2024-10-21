import { Link } from "react-router-dom";
import "../dist/css/PageNotFound.css";

function PageNotFound() {
    return(
        <div className="page-not-found">
            <h1 className="page-not-found__first-heading">404 Error</h1>
            <h2 className="page-not-found__second-heading">Page not found</h2>
            <h2 className="page-not-found__third-heading">Click <Link to=".." className="page-not-found__link">here</Link> to go back</h2>
        </div>
    );
}

export default PageNotFound;