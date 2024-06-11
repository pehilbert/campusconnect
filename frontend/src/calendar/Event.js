import {useState} from "react";
import "./Calendar.css";

function Event(props) {
    const [displayObject, setDisplayObject] = useState(props.displayObject || {});
    const [values, setValues] = useState(props.displayObject || {});
    const [editMode, setEditMode] = useState(props.editMode || false);
    const courseOptions = props.courses || [];

    function convertTo12Hr(time24) {
        if (time24) {
            // Split the input time string into hours and minutes
            let [hours, minutes] = time24.split(':');
            
            // Convert hours from string to number
            hours = parseInt(hours);
        
            // Determine AM or PM suffix
            const suffix = hours >= 12 ? 'PM' : 'AM';
        
            // Convert hours to 12-hour format
            hours = hours % 12 || 12; // Convert '0' to '12' for midnight, and '13-23' to '1-11'
        
            // Return the formatted time string
            return `${hours}:${minutes} ${suffix}`;
        }

        return "";
    }

    function getCourseCode(courseId) {
        for (let i = 0; i < courseOptions.length; i++) {
            if (courseOptions[i]._id === courseId) {
                return courseOptions[i].courseCode || "";
            }
        }

        return "";
    }

    const handleChange = (key, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [key]: value
        }));

        console.log(values);
    };

    const handleBack = (event) => {
        setValues(displayObject);
        setEditMode(false);
    }

    const handleSave = (event) => {
        event.preventDefault();
        setDisplayObject(values);
        setEditMode(false);
    }

    if (editMode === true) {
        return (
            <div className="event">
                <form className="event-edit-form" onSubmit={handleSave}>
                    <button className="event-back-button" onClick={handleBack}>Back</button>
                    <label className="event-input-label">
                        Start:
                        <input
                            className="event-date-input"
                            type="datetime-local"
                            required
                            value={values.start || ""}
                            onChange={(e) => handleChange("start", e.target.value)}
                        />
                    </label>
                    <br/>
                    <label className="event-input-label">
                        End:
                        <input
                            className="event-date-input"
                            type="datetime-local"
                            required
                            value={values.end || ""}
                            onChange={(e) => handleChange("end", e.target.value)}
                        />
                    </label>
                    <br/>
                    <input
                        className="event-text-input"
                        placeholder="Event Title"
                        type="text"
                        required
                        value={values.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                    <br/>
                    <input
                        className="event-text-input"
                        placeholder="Event Location"
                        type="text"
                        required
                        value={values.location || ""}
                        onChange={(e) => handleChange("location", e.target.value)}
                    />
                    <br/>
                    <input
                        className="event-text-input"
                        placeholder="Event Description"
                        type="text"
                        required
                        value={values.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                    <br/>
                    <label className="event-input-label">
                        Color:
                        <input
                            className="event-color-input"
                            type="color"
                            required
                            value={values.color || "#ffffff"}
                            onChange={(e) => handleChange("color", e.target.value)}
                        />
                    </label>
                    <br/>
                    <select
                        className="event-dropdown-input"
                        value={values.course_id || ""}
                        onChange={(e) => handleChange("course_id", e.target.value)}
                    >
                        <option default value="">Course (Optional)</option>
                        {courseOptions.map((element, index) => (
                            <option key={index} value={element._id}>{element.courseCode}</option>
                        ))}
                    </select>
                    <br/>
                    <button className="event-save-button" type="submit">Save</button>
                </form>
            </div>
        )
    }

    return (
        displayObject.allDay ? (
            <div className="allday-event" style={{"backgroundColor" : displayObject.color}}>
                <p className="event-header"><b>{displayObject.name}</b></p>
            </div>
        ) : (
            <div className="event" style={{"backgroundColor" : displayObject.color}}>
                <div className="event-left">
                    <p className="event-normal"><b>
                        {convertTo12Hr(displayObject.start.split("T")[1])}<br/>-{convertTo12Hr(displayObject.end.split("T")[1])}
                    </b></p>
                    <p className="event-normal"><b>{getCourseCode(displayObject.course_id)}</b></p>
                </div>
                <div className="event-right">
                    <button className="event-edit-button" onClick={() => setEditMode(true)}>Edit</button>
                    <p className="event-header"><b>{displayObject.name}</b></p>
                    <p className="event-header">{displayObject.location}</p>
                    <p className="event-normal">{displayObject.description}</p>
                </div>
            </div>
        )
    )
}

export default Event;