import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import './MultipleChoice.css';

export function MultipleChoiceRender({ question, onChange, alternatives, answer }) {
    return (
        <>
            <ReactMarkdown>{question}</ReactMarkdown>
            <div class="answers" onChange={onChange}>
                {alternatives.map(
                    (choice, key) => <label><input type="checkbox" value={key} name="answer" checked={answer.has(key)}/> {choice}</label> ) 
                }
            </div>
        </>
    );
}

export default function MultipleChoice({axios, interview, getInterview}) {

    const [message, setMessage] = useState();
    const [answer, setAnswer] = useState(new Set(interview.answer));

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
        console.log(event.target.checked);
        let updated = new Set(answer);
        updated.delete(null);
        if (event.target.checked) {
            updated.add(parseInt(event.target.value));
        } else {
            updated.delete(parseInt(event.target.value));
        }
        setAnswer(updated);
        
        axios.post('/answer', { 
            "question": interview.currentQuestion,
            "answer": Array.from(updated)
        }).then((res) => {
            if (res.data.status == "ok") {
                setMessage("Answer saved.");
                setAnswer(new Set(res.data.answer));
            } else {
                setMessage(`Error: ${res.data.message}`);
                setAnswer(new Set(answer));
            }
        })
        
    }

    return (
        <div>
            <h2>Question {interview.currentQuestion+1} / {interview.lastQuestion+1}</h2>
            <MultipleChoiceRender 
                question={interview.question.question} 
                onChange={typeof getInterview === 'undefined' ? undefined : onChange} 
                alternatives={interview.question.alternatives} 
                answer={answer} />
            {getInterview && <div>
            <div>{message}</div>
            <button onClick={goPrev}>Prev</button>
            <button onClick={goNext}>Next</button>
            </div>}
        </div>
    );
}
