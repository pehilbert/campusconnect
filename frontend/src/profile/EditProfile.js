import {useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {useAuth} from "../AuthContext";
import SignIn from "../signin/SignIn";
import "./EditProfile.css";
import { ENDPOINT_HOST } from "../vars";

function EditProfile() {
    const [values, setValues] = useState({});
    const [resultMessage, setResultMessage] = useState("");
    const authContext = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        
        fetch(ENDPOINT_HOST + "/api/users/updateme", {
            method : "POST",
            headers : {
                "authorization" : "Bearer " + authContext.authToken,
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                newValues : values
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
            })
        })
        .then(data => {
            setResultMessage(data.message);
            navigate("/edit-profile");
        })
        .catch(error => {
            setResultMessage(error.message);
        })
    }

    useEffect(() => {
        console.log("useEffect running");
        console.log(JSON.stringify(authContext));

        if (!authContext.authToken || !authContext.id) {
            navigate("/signin");
        } else {
            fetch(ENDPOINT_HOST + "/api/users/myinfo", {
                method : "GET",
                headers : {
                    "authorization" : "Bearer " + authContext.authToken
                }
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
                })
            })
            .then(data => {
                setValues({
                    firstName : data.userInfo.firstName,
                    lastName : data.userInfo.lastName,
                    school : data.userInfo.school,
                    phoneNumber : data.userInfo.phoneNumber,
                    birthday : data.userInfo.birthday
                })
            })
            .catch(error => {
                console.error("An error occured:", error);
            });
        }
    }, [authContext, authContext.authToken, authContext.username, navigate]);
    
    const handleChange = (key, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [key]: value
        }));
    };

    if (!authContext.authToken) {
        return (
            <SignIn />
        );
    }

    return (
        <div className="EditProfile">
            <form className="edit-profile-form" onSubmit={handleSubmit}>
                <h1 className="title">Your profile</h1>
                <p className="profile-result-message">{resultMessage}</p>
                <label className="profile-label">
                    First Name
                    <br/>
                    <input
                        className="profile-input name"
                        type="text"
                        placeholder="First Name"
                        required
                        value={values.firstName || ""}
                        onChange={(e) => handleChange("firstName", e.target.value.trim())}
                    />
                </label>
                <br/>
                <label className="profile-label">
                    Last Name
                    <br/>
                    <input
                        className="profile-input name"
                        type="text"
                        placeholder="Last Name"
                        required
                        value={values.lastName || ""}
                        onChange={(e) => handleChange("lastName", e.target.value.trim())}
                    />
                </label>
                <br/>
                <label className="profile-label">
                    School
                    <br/>
                    <input
                        className="profile-input"
                        type="text"
                        placeholder="School"
                        required
                        value={values.school || ""}
                        onChange={(e) => handleChange("school", e.target.value.trimStart())}
                    />
                </label>
                <br/>
                <label className="profile-label">
                    Phone Number
                    <br/>
                    <input
                        className="profile-input"
                        type="tel"
                        placeholder="123-456-7890"
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                        required
                        value={values.phoneNumber || ""}
                        onChange={(e) => handleChange("phoneNumber", e.target.value.trim())}
                    />
                </label>
                <br/>
                <label className="profile-label">
                    Birthday
                    <br/>
                    <input
                        className="profile-input"
                        type="date"
                        placeholder="Birthday"
                        required
                        value={values.birthday || ""}
                        onChange={(e) => handleChange("birthday", e.target.value)}
                    />
                </label>
                <button className="save-button" type="submit">Save</button>
            </form>
        </div>
    )
}

export default EditProfile;