import React, { useState, useEffect } from 'react';

function Test() {
  const [testMessage, setTestMessage] = useState("Loading test message...");

  function getTestMessage() {
    fetch("http://localhost:5000/api/test")
      .then(res => {
        if (!res.ok) {
          throw new Error("HTTP response not OK");
        }

        return res.text();
      })
      .then(message => {
        setTestMessage(message);
      })
      .catch(error => {
        setTestMessage("Error fetching test message");
      });
  }

  useEffect(() => {
    getTestMessage();
  }, []);

  return (
    <div className="Test">
      <h1>{testMessage}</h1>
    </div>
  );
}

export default Test;
