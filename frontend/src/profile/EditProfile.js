import {useState, useEffect} from "react";
import "./EditProfile.css"

function EditProfile() {
    let values = useState({});

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Saved!")
    }

    useEffect = () => {

    }

    return (
        <div className="EditProfile">
            <form className="edit-profile-form" onSubmit={handleSubmit}>
                <h1 className="title">Your profile</h1>
                <label className="profile-label">
                    First Name
                    <br/>
                    <input
                        className="profile-input name"
                        type="text"
                        placeholder="First Name"
                        required
                        value={values.firstName}
                        onChange={(e) => {
                            values.firstName = e.target.value;
                            console.log(values);
                        }}
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
                        value={values.lastName}
                        onChange={(e) => {
                            values.lastName = e.target.value;
                            console.log(values);
                        }}
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
                        value={values.phoneNumber}
                        onChange={(e) => {
                            values.phoneNumber = e.target.value;
                            console.log(values);
                        }}
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
                        value={values.birthday}
                        onChange={(e) => {
                            values.birthday = e.target.value;
                            console.log(values);
                        }}
                    />
                </label>
                <button className="save-button" type="submit">Save</button>
            </form>
        </div>
    )
}

export default EditProfile;