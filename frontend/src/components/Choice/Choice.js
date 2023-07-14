import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import './Choice.css';

export function ChoiceRender({ question, answer, alternatives, onChange }) {
    return (
        <>
            <ReactMarkdown>{question}</ReactMarkdown>
            <div class="answers" onChange={onChange}>
                {alternatives.map(
                    (choice, key) => <label><input type="radio" value={key} name="answer" checked={answer == key} readOnly={typeof onChange === 'undefined'}/> {choice}</label> ) 
                }
            </div>
        </>
    );
}

export default function Choice({axios, interview, getInterview}) {

    const [message, setMessage] = useState();
    const [answer, setAnswer] = useState(interview.answer);

    function goNext() {
        axios.post('/next').then((res) => {
            getInterview()
        })
    }
    function goPrev() {
        axios.post('/prev').then((res) => {
            getInterview()
        })
    }

    function onChange(event) {
        setMessage("Saving...");
        axios.post('/answer', { 
            "question": interview.currentQuestion,
            "answer": event.target.value
        }).then((res) => {
            if (res.data.status == "ok") {
                setMessage("Answer saved.");
                setAnswer(res.data.answer);
            } else {
                setMessage(`Error: ${res.data.message}`);
                setAnswer(parseInt(answer));
            }
        })
    }
    
    return (
        <div>
            <h2>Question {interview.currentQuestion+1} / {interview.lastQuestion+1}</h2>
            <ChoiceRender question={interview.question.question} answer={answer} alternatives={interview.question.alternatives} onChange={typeof getInterview === 'undefined' ? undefined : onChange} />
            {getInterview && <div>
            <div>{message}</div>
            <button onClick={goPrev}>Prev</button>
            <button onClick={goNext}>Next</button>
            </div>}
        </div>
    );
}
