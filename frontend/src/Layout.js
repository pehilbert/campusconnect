import { Outlet, Link } from "react-router-dom";

function Layout() {
    return (
        <div className="Layout">
            <div className="nav-bar">
                <h1 className="title">CampusCorner</h1>
                <div className="links">
                    <Link className="nav-link" to="/">Home</Link>
                </div>
            </div>

            <Outlet />
        </div>
    );
}

export default Layout;