import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from "../AuthContext";
import "./SignIn.css";

function SignUp() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [resultMessage, setResultMessage] = useState("");
    const authContext = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        fetch("http://localhost:5000/login", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"  
            },
            body : JSON.stringify({
                username : username,
                password : password,
            })
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    let msg = data.message || "Unknown error";
                    const error = new Error(msg);
                    error.data = data;
                    throw error;
                }

                return data;
            });
        })
        .then(data => {
            if (data.token) {
                console.log(data.token);
            }
            
            authContext.login(data.token, data.username);
            setResultMessage(data.message);
            navigate("/");
        })
        .catch(error => {
            setResultMessage(error.message);
        });
    }

    return (
        <div className="SignIn">
            <h1>Sign In</h1>
            <p className="result-message">{resultMessage}</p>
            <form className="signin-form" onSubmit={handleSubmit}>
                <label>
                    Username
                    <br/>
                    <input 
                        type="text"
                        placeholder="Username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Password
                    <br/>
                    <input 
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <button className="signin-button" type="submit">Sign In</button>
            </form>
            <p className="signup-link">Don't have an account? <Link className="signup-link" to="/signup">Sign Up</Link></p>
        </div>
    );
}

export default SignUp;