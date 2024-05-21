import Course from "./Course";
import Assignment from "./Assignment";
import "./MyCourses.css";

function MyCourses() {
    return (
        <div className="my-courses">
            <h1 className="section-title">
                My Courses
                <button className="add-remove">+</button>
                <button className="add-remove">-</button>
            </h1>
            <div className="course-container">
                <Course editMode={true} />
            </div>
            <h1 className="section-title todo-title">
                To-Do
                <button className="add-remove">+</button>
                <button className="add-remove">-</button>
            </h1>
            <div className="assignment-container">
                <Assignment editMode={false}/>
                <Assignment editMode={true}/>
            </div>
        </div>
    );
}

export default MyCourses;