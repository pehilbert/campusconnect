import {useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {useAuth} from "../AuthContext";
import "./EditProfile.css"

function EditProfile() {
    const [values, setValues] = useState({});
    const [resultMessage, setResultMessage] = useState("");
    const authContext = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        
        fetch("http://localhost:5000/updateuser", {
            method : "POST",
            headers : {
                "authorization" : "Bearer " + authContext.authToken,
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                username : authContext.username,
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
            setResultMessage("An error occurred when submitting:", error);
        })
    }

    useEffect(() => {
        console.log("useEffect running");
        console.log(JSON.stringify(authContext));

        if (!authContext.authToken || !authContext.username) {
            navigate("/signin");
        } else {
            const url = "http://localhost:5000/users/" + authContext.username;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP status ${response.status}`);
                    }
                    
                    return response.json();
                })
                .then(data => {
                    setValues({
                        firstName : data.firstName,
                        lastName : data.lastName,
                        school : data.school,
                        phoneNumber : data.phoneNumber,
                        birthday : data.birthday
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
                        onChange={(e) => handleChange("firstName", e.target.value)}
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
                        onChange={(e) => handleChange("lastName", e.target.value)}
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
                        onChange={(e) => handleChange("school", e.target.value)}
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
                        onChange={(e) => handleChange("phoneNumber", e.target.value)}
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