import Day from "./Day";
import Calendar from "./Calendar";
import SignIn from "../signin/SignIn";
import {useAuth} from "../AuthContext";
import {useState, useEffect} from "react";
import "./Calendar.css";

function CalendarPage() {
    const authContext = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [courses, setCourses] = useState([]);
    const [calendars, setCalendars] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarsVisible, setCalendarsVisible] = useState(false);

    // Sets the current date/time
    useEffect(() => {
        setCurrentDate(new Date());
    }, [])

    useEffect(() => {
        if (authContext.id) {
            fetch("http://localhost:5000/users/" + authContext.id)
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        throw new Error(data.message);
                    }

                    return data;
                })
            })
            .then(data => {
                setUserInfo(data);
            })
            .catch(error => {
                console.error("An error occurred getting user info:", error);
            })
        }
    }, [authContext, authContext.id]);

    useEffect(() => {
        if (authContext.authToken) {
            fetch("http://localhost:5000/mycalendars", {
                method : "GET",
                headers : {
                    "authorization" : "Bearer " + authContext.authToken
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response);
                }

                return response.json();
            })
            .then(data => {
                setCalendars(data);
            })
            .catch(error => {
                console.error("An error occurred fetching courses:", error);
            });
        }
    }, [authContext, authContext.authToken]);

    useEffect(() => {
        if (authContext.authToken) {
            fetch("http://localhost:5000/mycourses", {
                method : "GET",
                headers : {
                    "authorization" : "Bearer " + authContext.authToken
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response);
                }

                return response.json();
            })
            .then(data => {
                setCourses(data);
            })
            .catch(error => {
                console.error("An error occurred fetching courses:", error);
            });
        }
    }, [authContext, authContext.authToken]);

    function getDateString(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    if (!authContext.authToken) {
        return <SignIn />
    }

    const testCalendar = {
        name : "Classes",
        color : "#ff0000",
        description : "This is for my classes!"
    }

    return (
        <div className="calendar-page">
            <div className="welcome">
                <h1 className="welcome-message">Hello, {userInfo?.firstName}</h1>
                <h1 className="welcome-message">
                    Today is {getDateString(currentDate)}
                </h1>
                <button className="view-calendars-button" onClick={() => setCalendarsVisible(!calendarsVisible)}>
                    {calendarsVisible ? "Close" : "View Calendars"}
                </button>
                {calendarsVisible ? (
                    <div className="calendars-container">
                        <Calendar editMode={false} displayObject={testCalendar} />
                        <Calendar editMode={false} displayObject={testCalendar} />
                        {calendars.map((index, element) => (
                            <Calendar key={index} editMode={false} displayObject={element} />
                        ))}
                    </div>
                ) : (<></>)}
            </div>
            <Day date={currentDate} courses={courses} />
        </div>
    )
}

export default CalendarPage;