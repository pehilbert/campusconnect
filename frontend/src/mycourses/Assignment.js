function Assignment(props) {
    return (
        <div className="assignment">
            <div className="assignment-status">
                <img className="assignment-status-image"/>
                <select className="assignment-status-dropdown">
                    <option default value="Assigned">Assigned</option>
                    <option default value="In Progress">In Progress</option>
                    <option default value="Complete">Complete</option>
                </select>
            </div>
            <div className="assignment-content">
                <div className= "assignment-header">
                    <div className="assignment-header-left">
                        <p className="assignment-name">Assignment Name</p>
                        <p className="assignment-priority">Priority</p>
                    </div>
                    <p className="assignment-course">Course Code</p>
                </div>
                <div className="assignment-body">
                    <p className="assignment-normal">Deadline</p>
                    <p className="assignment-normal">Description</p>
                </div>
            </div>
        </div>
    );
}

export default Assignment;