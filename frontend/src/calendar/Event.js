import {useState} from "react";
import {useAuth} from "../AuthContext";

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

    const handleChange = (key, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [key]: value
        }));

        console.log(values);
    };

    const handleSave = (event) => {
        event.preventDefault();
        setDisplayObject(values);
        setEditMode(false);
    }

    if (editMode === true) {
        return (
            <div className="event">
                <form onSubmit={handleSave}>
                    <label className="event-input-label">
                        Start:
                        <input
                            className="event-time-input"
                            type="datetime-local"
                            required
                            value={values.start || ""}
                            onChange={(e) => handleChange("start", e.target.value)}
                        />
                    </label>
                    <label className="event-input-label">
                        End:
                        <input
                            className="event-time-input"
                            type="datetime-local"
                            required
                            value={values.end || ""}
                            onChange={(e) => handleChange("end", e.target.value)}
                        />
                    </label>
                    <input
                        className="event-text-input"
                        placeholder="Event Title"
                        type="text"
                        required
                        value={values.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                    <input
                        className="event-text-input"
                        placeholder="Event Location"
                        type="text"
                        required
                        value={values.location || ""}
                        onChange={(e) => handleChange("location", e.target.value)}
                    />
                    <input
                        className="event-text-input"
                        placeholder="Event Description"
                        type="text"
                        required
                        value={values.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                    <select
                        className="event-dropdown-input"
                        required
                        value={values.course_id || ""}
                        onChange={(e) => handleChange("course_id", e.target.value)}
                    >
                        <option default value="">Course</option>
                        {courseOptions.map((element, index) => (
                            <option key={index} value={element._id}>{element.courseCode}</option>
                        ))}
                    </select>
                    <button type="submit">Save</button>
                </form>
            </div>
        )
    }

    return (
        displayObject.allDay ? (
            <div className="allday-event" style={{"background-color" : displayObject.color}}>
                <p className="event-header"><b>{displayObject.name}</b></p>
            </div>
        ) : (
            <div className="event" style={{"background-color" : displayObject.color}}>
                <div className="event-left">
                    <p className="event-normal"><b>
                        {convertTo12Hr(displayObject.start.split("T")[1])}<br/>-{convertTo12Hr(displayObject.end.split("T")[1])}
                    </b></p>
                    <p className="event-normal"><b>{displayObject.course}</b></p>
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