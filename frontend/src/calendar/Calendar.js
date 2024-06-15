import "./Calendar.css";
import {useState} from "react";

function Calendar(props) {
    const [editMode, setEditMode] = useState(props.editMode || false);
    const [values, setValues] = useState(props.displayObject || {});
    const [displayObject, setDisplayObject] = useState(props.displayObject || {});

    if (editMode === true) {
        return (
            <div className="calendar">
                <h1>Editing the calendar</h1>
            </div>
        );
    }

    return (
        <div className="calendar">
            <div className="calendar-header">
                <p className="calendar-name">{displayObject.name}</p>
                <p className="calendar-color" style={{backgroundColor : displayObject.color}}></p>
            </div>
            <p className="calendar-description">{displayObject.description}</p>
        </div>
    );
}

export default Calendar;