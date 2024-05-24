import Course from "./Course";
import Assignment from "./Assignment";
import {useAuth} from "../AuthContext";
import {useState, useEffect} from "react";
import SignIn from "../signin/SignIn";
import "./MyCourses.css";

function MyCourses() {
    const authContext = useAuth();
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [addingCourse, setAddingCourse] = useState(false);
    const [addingAssignment, setAddingAssignment] = useState(false);
    const [refreshNum, changeRefreshNum] = useState(0);

    const refresh = () => {
        changeRefreshNum(refreshNum + 1);
    }

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
    }, [authContext, authContext.authToken, addingCourse, refreshNum]);

    useEffect(() => {
        fetch("http://localhost:5000/myassignments", {
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
                let assignmentsList = [];

                for (const key in data) {
                    for (const assignmentKey in data[key]) {
                        assignmentsList.push(data[key][assignmentKey]);
                    }
                }

                setAssignments(assignmentsList);
            })
            .catch(error => {
                console.error("An error occurred fetching courses:", error);
            });
    }, [authContext, authContext.authToken, addingAssignment, refreshNum]);

    if (!authContext.authToken) {
        return (
            <SignIn />
        );
    }

    return (
        <div className="my-courses">
            <h1 className="section-title">
                My Courses
                <button className="add-remove" onClick={() => setAddingCourse(true)}>+</button>
            </h1>
            <div className="course-container">
                {courses.map((course, index) => (
                    <Course key={index} displayObject={course} editMode={false} refreshFunction={refresh}/>
                ))}
                {addingCourse ? (
                    <Course newCourse={true} editMode={true} stateFunction={setAddingCourse} />
                ) : (
                    <></>
                )}
            </div>
            <h1 className="section-title todo-title">
                To-Do
                <button className="add-remove" onClick={() => setAddingAssignment(true)}>+</button>
                <button className="add-remove">-</button>
            </h1>
            <div className="assignment-container">
                {assignments.map((assignment, index) => (
                    <Assignment key={index} displayObject={assignment} courses={courses} editMode={false} refreshFunction={refresh}/>
                ))}
                {addingAssignment ? (
                    <Assignment editMode={true} courses={courses} stateFunction={setAddingAssignment} />
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}

export default MyCourses;