import { Outlet, Link } from "react-router-dom";
import "./Layout.css";

function Layout() {
    return (
        <div className="Layout-container">
            <div className="Layout">
                <div className="nav-bar">
                    <img className="logo" src="./clockwork_text.svg"></img>
                    <div className="links">
                        <Link className="nav-link" to="/">Home</Link>
                        <Link className="nav-link" to="/users">Users</Link>
                        <Link className="nav-link" to="/signup">Sign Up</Link>
                    </div>
                </div>
            </div>

            <Outlet />
        </div>
    );
}

export default Layout;