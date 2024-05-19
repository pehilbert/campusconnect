import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import "./SignUp.css";

function SignUp() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCopy, setPasswordCopy] = useState("");
    const [resultMessage, setResultMessage] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (password !== passwordCopy) {
            return setResultMessage("Passwords must match!");
        }

        fetch("http://localhost:5000/createuser", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"  
            },
            body : JSON.stringify({
                username : username,
                password : password,
                email : email
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
            setResultMessage(data.message);
        })
        .catch(error => {
            setResultMessage(error.message);
        });
    }

    return (
        <div className="SignUp">
            <h1>Create a free account</h1>
            <h2>Start planning today, organize your student life</h2>
            <p className="result-message">{resultMessage}</p>
            <form className="signup-form" onSubmit={handleSubmit}>
                <label className="signup-label">
                    Enter your email
                    <br/>
                    <input 
                        className="signup-input"
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <br/>
                <label className="signup-label">
                    Create username
                    <br/>
                    <input 
                        className="signup-input"
                        type="text"
                        placeholder="Username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
                <br />
                <label className="signup-label">
                    Create password
                    <br/>
                    <input 
                        className="signup-input"
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <br/>
                <label className="signup-label">
                    Confirm password
                    <br/>
                    <input 
                        className="signup-input"
                        type="password"
                        placeholder="Confirm password"
                        required
                        value={passwordCopy}
                        onChange={(e) => setPasswordCopy(e.target.value)}
                    />
                </label>
                <br/>
                <button className="signup-button" type="submit">Continue</button>
            </form>
            <p className="signin-link">Have an account? <Link className="signin-link" to="/signin">Sign In</Link></p>
        </div>
    );
}

export default SignUp;