import React, { useState, useEffect } from 'react';

function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/users")
            .then(result => result.json())
            .then(jsonResult => {
                console.log(jsonResult);
                setUsers(jsonResult);
            })
            .catch(error => {
                console.error("Error getting users:", error);
            });
    }, []);

    return (
        <div className="Users">
            <h1>Users:</h1>
            {users.map(user => (
                <p key={user.username}>{user.username}</p>
            ))}
        </div>
    );
}

export default Users;