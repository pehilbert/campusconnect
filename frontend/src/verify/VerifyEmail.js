import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../AuthContext";
import "./VerifyEmail.css";

function VerifyEmail() {
    const navigate = useNavigate();
    const authContext = useAuth();
    const [resultMessage, setResultMessage] = useState("");
    const [code, setCode] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    const sendEmail = (event) => {
        setResultMessage("Verification email sent");
    }

    useEffect(() => {
        /*
        if (!authContext.authToken || !authContext.id) {
            navigate("/signin");
        }
        */

        code.trim();
        setCode(code);
    }, []);

    return (
        <div className="verify-email">
            <h1>Verify Your Email</h1>
            <p className="result-message">{resultMessage}</p>
            <form className="verify-form">
                <p className="input-label">Enter the 6-character code sent to your email</p>
                <input
                    className="code-input"
                    placeholder="e.g. abc123"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    onSubmit={handleSubmit}
                    required
                    minLength="6"
                    maxLength="6"
                />    
                <button
                    className="verify-button"
                    type="submit"
                >
                    Verify
                </button>
                <p className="resend-label">Didn't get an email? <button type="button" className="resend-button" onClick={sendEmail}>Resend email</button></p>
            </form>
        </div>
    );
}

export default VerifyEmail;