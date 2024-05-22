import {useState} from "react";
import {useAuth} from "../AuthContext";

function Course(props) {
    const authContext = useAuth();
    const [editMode, setEditMode] = useState(props.editMode || false);
    const [displayObject, setDisplayObject] = useState(props.displayObject || {});
    const [values, setValues] = useState(props.displayObject || {});
    const [newInstructor, setNewInstructor] = useState("");
    const [newMeeting, setNewMeeting] = useState({
        day : "",
        startTime : "",
        endTime : ""
    });

    const handleSave = (event) => {
        event.preventDefault();
        console.log("Saved");
        setDisplayObject(values);
        setEditMode(false);

        console.log("Display object:", displayObject);

        if (displayObject._id) {
            fetch("http://localhost:5000/editcourse/" + displayObject._id, {
                method : "POST",
                headers : {
                    "Authorization" : "Bearer " + authContext.authToken,
                    "Content-Type" : "application/json"
                },
                // manually put values here so we don't include the id
                body : JSON.stringify({
                    newValues : {
                        courseCode : values.courseCode,
                        courseName : values.courseName,
                        instructors : values.instructors,
                        meetings : values.meetings
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
            fetch("http://localhost:5000/addcourse", {
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
            .then(data => console.log("Course added:", data.courseId))
            .catch(error => {
                console.error("An error occurred adding a course:", error);
            });
        }
        // If this is an "add course" component, set the state to no longer adding a course
        if (props.stateFunction) {
            props.stateFunction(false);
        }
    }

    const handleBack = () => {
        if (displayObject) {
            setValues(displayObject);
            setEditMode(!editMode);
        }

        // If this is an "add course" component, set the state to no longer adding a course
        if (props.stateFunction) {
            props.stateFunction(false);
        }
    }

    const handleDrop = () => {
        setDisplayObject({});
        setEditMode(false);

        fetch("http://localhost:5000/dropcourse/" + displayObject._id, {
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
        .then(data => console.log(data.message))
        .catch(error => {
            console.error("An error occurred dropping a course:", error);
        })

        // If this is an "add course" component, set the state to no longer adding a course
        if (props.stateFunction) {
            props.stateFunction(false);
        }
    }

    const handleChange = (key, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [key]: value
        }));

        console.log(values);
    };

    const handleMeetingChange = (key, value) => {
        setNewMeeting(prevValues => ({
            ...prevValues,
            [key]: value
        }));

        console.log(newMeeting);
    };

    const addInstructor = (instructorName) => {
        if (instructorName !== "") {
            if (!values.instructors) {
                handleChange("instructors", [instructorName]);
                setNewInstructor("");
            } else if (!(values.instructors.find((e) => e === instructorName))) {
                values.instructors.push(instructorName);
                handleChange("instructors", values.instructors);
            }
        }
    }

    const removeInstructor = (instructorName) => {
        if (values.instructors) {
            let index = values.instructors.indexOf(instructorName);

            if (index > -1) {
                values.instructors.splice(index, 1);
                handleChange("instructors", values.instructors);
            }
        }
    }

    const addMeeting = (meeting) => {
        // check for empty values
        if (meeting.day !== "" && meeting.startTime !== "" && meeting.endTime !=="") {
            // make sure start is before end
            if (meeting.startTime < meeting.endTime) {
                if (!values.meetings) {
                    handleChange("meetings", [meeting]);
                    setNewMeeting({
                        day : "",
                        startTime : "",
                        endTime : ""
                    });
                } else if (!(values.meetings.find((e) =>
                    e.day === meeting.day &&
                    e.startTime === meeting.startTime &&
                    e.endTime === meeting.endTime
                ))) {
                    values.meetings.push(meeting);
                    setNewMeeting({
                        day : "",
                        startTime : "",
                        endTime : ""
                    });
                }
            }
        }
    }

    const removeMeeting = (meeting) => {
        if (values.meetings) {
            let index = values.meetings.findIndex((e) => (
                e.day === meeting.day &&
                e.startTime === meeting.startTime &&
                e.endTime === meeting.endTime
            ));

            if (index > -1) {
                values.meetings.splice(index, 1);
                handleChange("meetings", values.meetings);
            }
        }
    }

    function covertTo12Hr(time24) {
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

    return (
        <div className="course">
            {editMode ? (
                // Edit mode render
                <>
                    <button className="back-button" onClick={handleBack}>Back</button>
                    <form onSubmit={handleSave}>
                        <input
                            className="course-input"
                            type="text"
                            value={values.courseCode || ""}
                            placeholder="Course Code"
                            onChange={(e) => handleChange("courseCode", e.target.value)}
                            required
                        />
                        <input
                            className="course-input"
                            type="text"
                            value={values.courseName || ""}
                            placeholder="Course Title"
                            onChange={(e) => handleChange("courseName", e.target.value)}
                            required
                        />
                        <p className="course-normal">Instructor(s):</p>
                        <div className="instructors-form">
                            {values.instructors?.map(name => (
                                <p key={name} className="course-normal">
                                    {name}
                                    <button type="button" className="course-remove-button" onClick={() => removeInstructor(name)}>-</button>
                                </p>
                            ))}
                            <input
                                className="course-input"
                                type="text"
                                value={newInstructor}
                                placeholder="Instructor name"
                                onChange={(e) => setNewInstructor(e.target.value)}
                            />
                            <button type="button" className="course-add-button" onClick={() => {addInstructor(newInstructor)}}>+</button>
                        </div>
                        <p className="course-normal">Meeting(s):</p>
                        <div className="meetings-form">
                            {values.meetings?.map((meeting, index) => (
                                <p key={index} className="course-normal">
                                    {meeting.day}, {covertTo12Hr(meeting.startTime)}-{covertTo12Hr(meeting.endTime)}
                                    <button className="course-remove-button" onClick={() => removeMeeting(meeting)}>-</button>
                                </p>
                            ))}
                            <select 
                                className="course-input"
                                value={newMeeting.day}
                                onChange={(e) => handleMeetingChange("day", e.target.value)}
                            >
                                <option default value="">Select Day</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                            </select>
                            <label className="course-input-label">
                                Start:
                                <input
                                    className="course-input"
                                    type="time"
                                    value={newMeeting.startTime}
                                    placeholder="Start Time"
                                    onChange={(e) => handleMeetingChange("startTime", e.target.value)}
                                />
                            </label>
                            <label className="course-input-label">
                                End:
                                <input
                                    className="course-input"
                                    type="time"
                                    value={newMeeting.endTime}
                                    placeholder="End Time"
                                    onChange={(e) => handleMeetingChange("endTime", e.target.value)}
                                />
                            </label>
                            <button type="button" className="course-add-button" onClick={() => {addMeeting(newMeeting)}}>+</button>
                        </div>
                        <button type="submit" className="course-save-button">Save</button>
                    </form>
                    <button className="drop-button" onClick={handleDrop}>Drop</button>
                </>
            ) : (
                // Non edit mode render
                <>
                    <button 
                        className="edit-button"
                        onClick={() => setEditMode(!editMode)}
                    >
                        Edit
                    </button>
                    <p className="course-heading">{displayObject.courseCode || ""}</p>
                    <p className="course-normal">{displayObject.courseName || ""}</p>
                    <p className="course-normal">{displayObject.instructors?.join(", ")}</p>
                    {displayObject.meetings?.map((meeting, index) => (
                        <p key={index} className="course-normal">
                            {meeting.day}, {covertTo12Hr(meeting.startTime)}-{covertTo12Hr(meeting.endTime)}
                        </p>
                    ))}
                    <p className="course-heading">Upcoming:</p>
                    <p className="course-normal">Assignment 1</p>
                    <p className="course-normal">Assignment 2</p>
                </>
            )}
        </div>
    );
}

export default Course;