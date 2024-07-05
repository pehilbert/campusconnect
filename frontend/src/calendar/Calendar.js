import "./Calendar.css";
import {useState} from "react";
import {useAuth} from "../AuthContext";

function Calendar(props) {
    const [editMode, setEditMode] = useState(props.editMode || false);
    const [values, setValues] = useState(props.displayObject || {});
    const [displayObject, setDisplayObject] = useState(props.displayObject || {});
    const authContext = useAuth();

    function handleSave(event) {
        event.preventDefault();
        setDisplayObject(values);
        setEditMode(false);

        if (displayObject._id) {
            fetch("http://localhost:5000/editcalendar/" + displayObject._id, {
                method : "POST",
                headers : {
                    "Authorization" : "Bearer " + authContext.authToken,
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    newValues : {
                        name : values.name,
                        description : values.description,
                        color : values.color
                    }
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.message);
                }

                return response.json();
            })
            .then(data => {
                console.log(data.message);

                if (props.stateFunction) {
                    props.stateFunction(false);
                }
    
                if (props.refreshFunction) {
                    props.refreshFunction();
                }
            })
            .catch(error => {
                console.error("An error occurred editing a calendar:", error);
            });
        } else {
            fetch("http://localhost:5000/createcalendar", {
                method : "POST",
                headers : {
                    "Authorization" : "Bearer " + authContext.authToken,
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    name : values.name,
                    description : values.description,
                    color : values.color
                })
            })
            .then(data => {
                console.log("Calendar added:", data.calendarId);

                if (props.stateFunction) {
                    props.stateFunction(false);
                }
        
                if (props.refreshFunction) {
                    props.refreshFunction();
                }
            })
            .catch(error => {
                console.error("An error occurred adding a calendar:", error);
            });
        }
    }

    function handleBack() {
        setValues(displayObject);
        setEditMode(false);

        if (props.stateFunction) {
            props.stateFunction(false);
        }

        if (props.refreshFunction) {
            props.refreshFunction();
        }
    }

    function handleDelete() {
        if (displayObject._id) {
            fetch("http://localhost:5000/deletecalendar/" + displayObject._id, {
                method : "POST",
                headers : {
                    "Authorization" : "Bearer " + authContext.authToken,
                    "Content-Type" : "application/json"
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.message);
                }

                return response.json();
            })
            .then(data => {
                console.log(data.message);

                if (props.stateFunction) {
                    props.stateFunction(false);
                }
    
                if (props.refreshFunction) {
                    props.refreshFunction();
                }
            })
            .catch(error => {
                console.error("An error occurred deleting a calendar:", error);
            });
        }
    }

    const handleChange = (key, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [key]: value
        }));

        console.log(values);
    }

    if (editMode === true) {
        return (
            <div className="calendar">
                <button className="calendar-edit-button" onClick={handleBack}>Back</button>
                <form onSubmit={handleSave}>
                    <div className="calendar-header">
                        <input
                            className="calendar-name-input"
                            required
                            placeholder="Calendar Name"
                            value={values.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                        <input
                            className="calendar-color-input"
                            type="color"
                            required
                            placeholder="#ffffff"
                            value={values.color || "#ffffff"}
                            onChange={(e) => handleChange("color", e.target.value)}
                        />
                    </div>
                    <input
                        className="calendar-description-input"
                        required
                        placeholder="Description"
                        value={values.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                    <br />
                    <button className="calendar-save-button" type="submit">Save</button>
                </form>
            </div>
        );
    }

    return (
        <div className="calendar">
            <button className="calendar-edit-button" onClick={() => setEditMode(true)}>Edit</button>
            <div className="calendar-header">
                <p className="calendar-name">{displayObject.name}</p>
                <p className="calendar-color" style={{backgroundColor : displayObject.color}}></p>
            </div>
            <button className="calendar-delete-button" onClick={handleDelete}>Delete</button>
            <p className="calendar-description">{displayObject.description}</p>
        </div>
    );
}

export default Calendar;