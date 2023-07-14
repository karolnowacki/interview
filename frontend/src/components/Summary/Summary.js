import React, { useEffect } from 'react';

import './Summary.css';

export default function Summary({axios, interview, getInterview}) {
    function finish() {
        if (window.confirm("Are you sure you want to finish this interview?")) {
            axios.post('/finish').then((res) => {
                getInterview()
            })
        }
    }
    function goPrev() {
        axios.post('/prev').then((res) => {
            getInterview()
        })
    }


    return (
        <div>
            <h2>Summary</h2>
            <ul class="answers">
                {interview.answers.map(
                    (value, id) => <li>Question {id+1} {value} - {value ? <span class="success">Answer saved</span> : <span class="error">No answer</span>}</li> 
                )}
            </ul>
            <button onClick={goPrev}>Prev</button>
            <button onClick={finish}>Finish</button>
        </div>
    );

}
