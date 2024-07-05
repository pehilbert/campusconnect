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
    const [addingCalendar, setAddingCalendar] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState(0);

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
    }, [authContext, authContext.id, refreshCounter, addingCalendar]);

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
    }, [authContext, authContext.authToken, refreshCounter, addingCalendar]);

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
    }, [authContext, authContext.authToken, refreshCounter, addingCalendar]);

    function getDateString(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function refreshCalendars() {
        setRefreshCounter(refreshCounter + 1);
    }

    function handleAddCalendar() {
        setCalendarsVisible(true);
        setAddingCalendar(true);
    }

    if (!authContext.authToken) {
        return <SignIn />
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
                <button className="add-calendar-button" onClick={handleAddCalendar}>+</button>
                {calendarsVisible ? (
                    <div className="calendars-container">
                        {calendars.map((calendar, index) => (
                            <Calendar key={index} editMode={false} displayObject={calendar} refreshFunction={refreshCalendars}/>
                        ))}
                        {addingCalendar ? (
                            <Calendar editMode={true} stateFunction={setAddingCalendar} refreshFunction={refreshCalendars}/>
                        ) : (<></>)}
                    </div>
                ) : (<></>)}
            </div>
            <Day date={currentDate} courses={courses} />
        </div>
    )
}

export default CalendarPage;