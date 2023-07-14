import React from 'react';

export default function Welcome({axios, getInterview}) {

    function startInterview() {
        axios.post('/start').then((res) => {
            getInterview()
        })
    }

    return (
        <div>
            <h2>Welcome</h2>
            <button onClick={startInterview}>Start</button>
        </div>
    );
}
