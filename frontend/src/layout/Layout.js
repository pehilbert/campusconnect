import { Outlet, Link, useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import {useAuth} from "../AuthContext";
import "./Layout.css";

function Layout() {
    const authContext = useAuth();
    const [authToken, setAuthToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setAuthToken(authContext.authToken);
    }, [authContext.authToken]);

    return (
        <div className="Layout-container">
            <div className="Layout">
                <div className="nav-bar">
                    <img className="logo" alt="logo" src="./clockwork_text.svg"></img>
                    <div className="links">
                        <Link className="nav-link" to="/">Home</Link>
                        <Link className="nav-link" to="/my-courses">My Courses</Link>
                        <Link className="nav-link" to="/edit-profile">My Profile</Link>
                        {/* Conditionally render either Sign In or Sign Out button */}
                        {authToken ? (
                            <button className="nav-link emphasized" onClick={() => {
                                authContext.logout();
                                navigate("/");
                            }}>
                            Sign Out
                            </button>
                        ) : (
                            <Link className="nav-link emphasized" to="/signin">Sign In</Link>
                        )}
                    </div>
                </div>
            </div>

            <Outlet />
        </div>
    );
}

export default Layout;