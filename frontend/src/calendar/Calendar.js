import Day from "./Day";
import SignIn from "../signin/SignIn";
import {useAuth} from "../AuthContext";
import {useState, useEffect} from "react";
import "./Calendar.css";

function Calendar() {
    const authContext = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

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

    function getDateString(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
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
            </div>
            <Day date={currentDate} />
        </div>
    )
}

export default Calendar;