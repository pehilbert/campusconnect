import "./Calendar.css";
import Event from "./Event";

function Day({date}) {
    const isCurrentDate = 
        date.getMonth() === new Date().getMonth() &&
        date.getDate() === new Date().getDate() &&
        date.getFullYear() === new Date().getFullYear();

    const testEvent = {
        name : "Some event",
        description : "This is a super cool event and you will have fun!!!",
        location : "My house",
        start : "14:20",
        end : "17:50",
        color : "#E19191",
        allDay : false
    }

    function convertTo12Hr(time24) {
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
        <div className="day">
            <h1 className="day-header">{date.getMonth() + 1}/{date.getDate()}</h1>
            {isCurrentDate ? 
                (<p className="day-normal">{convertTo12Hr(`${date.getHours()}:${date.getMinutes()}`)}</p>) : 
                (<></>)
            }
            <Event props={testEvent}/>
        </div>
    )
}

export default Day;