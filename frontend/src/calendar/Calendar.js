import "./Calendar.css";
import {useState} from "react";

function Calendar(props) {
    const [editMode, setEditMode] = useState(props.editMode || false);
    const [values, setValues] = useState(props.displayObject || {});
    const [displayObject, setDisplayObject] = useState(props.displayObject || {});

    function handleSave(event) {
        event.preventDefault();
        setDisplayObject(values);
        setEditMode(false);
    }

    function handleBack() {
        setValues(displayObject);
        setEditMode(false);
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
                            value={values.color}
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
            <p className="calendar-description">{displayObject.description}</p>
        </div>
    );
}

export default Calendar;