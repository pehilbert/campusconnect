function Event({props}) {
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

    return (
        props.allDay ? (
            <div className="allday-event" style={{"background-color" : props.color}}>
                <p className="event-header"><b>{props.name}</b></p>
            </div>
        ) : (
            <div className="event" style={{"background-color" : props.color}}>
                <div className="event-left">
                    <p className="event-normal"><b>
                        {convertTo12Hr(props.start)}<br/>-{convertTo12Hr(props.end)}
                    </b></p>
                    <p className="event-normal"><b>{props.course}</b></p>
                </div>
                <div className="event-right">
                    <p className="event-header"><b>{props.name}</b></p>
                    <p className="event-header">{props.location}</p>
                    <p className="event-normal">{props.description}</p>
                </div>
            </div>
        )
    )
}

export default Event;