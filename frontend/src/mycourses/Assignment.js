import {useState} from "react";
import {useAuth} from "../AuthContext";

function Assignment(props) {
    const authContext = useAuth();
    const [editMode, setEditMode] = useState(props.editMode || false);
    const [values, setValues] = useState(props.displayObject || {status : "Assigned"});
    const [displayObject, setDisplayObject] = useState(props.displayObject || {});
    const courseOptions = props.courses || [];

    const handleSave = (event) => {
        if (event) {
            event.preventDefault();
        }

        if (displayObject._id) {
            fetch("http://localhost:5000/updateassignment/" + displayObject._id, {
                method : "POST",
                headers : {
                    "Authorization" : "Bearer " + authContext.authToken,
                    "Content-Type" : "application/json"
                },
                // manually put values here so we don't include the id
                body : JSON.stringify({
                    newValues : {
                        course_id : values.course_id,
                        name : values.name,
                        priority : values.priority,
                        deadline : new Date(values.deadline),
                        description : values.description,
                        status : displayObject.status || "Assigned"
                    }
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.message);
                }

                return response.json();
            })
            .then(data => console.log(data.message))
            .catch(error => {
                console.error("An error occurred editing a course:", error);
            })
        } else {
            fetch("http://localhost:5000/addassignment", {
                method : "POST",
                headers : {
                    "Authorization" : "Bearer " + authContext.authToken,
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify(values)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response);
                }

                return response.json();
            })
            .then(data => console.log("Assignment added:", data.assignmentId))
            .catch(error => {
                console.error("An error occurred adding a course:", error);
            });
        }

        console.log("Saved");
        setDisplayObject(values);
        setEditMode(false);

        if (props.stateFunction) {
            console.log("State function");
            props.stateFunction(false);
        }

        if (props.refreshFunction) {
            console.log("Refresh function");
            props.refreshFunction();
        }
    }

    const updateStatus = (event) => {
        handleChange("status", event.target.value);

        if (displayObject._id) {
            fetch("http://localhost:5000/updateassignment/" + displayObject._id, {
                method : "POST",
                headers : {
                    "Authorization" : "Bearer " + authContext.authToken,
                    "Content-Type" : "application/json"
                },
                // manually put values here so we don't include the id
                body : JSON.stringify({
                    newValues : {
                        status : event.target.value
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
                    console.log("State function");
                    props.stateFunction(false);
                }
    
                if (props.refreshFunction) {
                    console.log("Refresh function");
                    props.refreshFunction();
                }

                setEditMode(false);
                setDisplayObject(values);
            })
            .catch(error => {
                console.error("An error occurred editing a course:", error);
            })
        } 
    }

    const handleChange = (key, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [key]: value
        }));

        console.log(values);
    };

    return editMode ? (
        <div className="assignment">
            <button className="assignment-edit-button" onClick={() => setEditMode(!editMode)}>
                Back
            </button>
            <form onSubmit={handleSave}>
                <input
                    className="assignment-text-input"
                    type="text"
                    required
                    placeholder="Assignment Name"
                    value={values.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                />
                <select 
                    className="assignment-dropdown-input"
                    required
                    value={values.priority || ""}
                    onChange={(e) => handleChange("priority", e.target.value)}
                >
                    <option default value="">Priority</option>
                    <option value="ASAP">ASAP</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <select
                    className="assignment-dropdown-input"
                    required
                    value={values.course_id || ""}
                    onChange={(e) => handleChange("course_id", e.target.value)}
                >
                    <option default value="">Course</option>
                    {courseOptions.map((element, index) => (
                        <option key={index} value={element._id}>{element.courseCode}</option>
                    ))}
                </select>
                <br />
                <label className="assignment-input-label">
                    Deadline:
                    <input
                        className="assignment-text-input"
                        type="datetime-local"
                        required
                        value={values.deadline || ""}
                        onChange={(e) => handleChange("deadline", e.target.value)}
                    />
                </label>
                <br />
                <input
                    className="assignment-long-text-input"
                    type="text"
                    required
                    placeholder="Description"
                    value={values.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                />
                <br />
                <button className="assignment-save-button" type="submit">Save</button>
            </form>
        </div>
    ) : (
        <div className="assignment">
            <div className="assignment-status">
                <img className="assignment-status-image" alt="Assignment Status" src="/assigned.png"/>
                <select 
                    className="assignment-status-dropdown"
                    value={displayObject.status || ""}
                    onChange={(e) => {
                        handleChange("status", e.target.value);
                        handleSave();
                    }}
                >
                    <option default value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                </select>
                <button className="assignment-edit-button" onClick={() => setEditMode(!editMode)}>
                    Edit
                </button>
            </div>
            <div className="assignment-content">
                <div className= "assignment-header">
                    <div className="assignment-header-left">
                        <p className="assignment-name">{displayObject.name}</p>
                        <p className="assignment-priority">{displayObject.priority}</p>
                    </div>
                    <p className="assignment-course">Course Code</p>
                </div>
                <div className="assignment-body">
                    <p className="assignment-normal">
                        {new Date(displayObject.deadline).toDateString()}, {new Date(displayObject.deadline).toTimeString()}
                    </p>
                    <p className="assignment-normal">{displayObject.description}</p>
                </div>
            </div>
        </div>
    );
}

export default Assignment;