import React, { useEffect } from 'react';

export default function Evaluate({id, evaluate}) {
    return <li>{typeof id !== 'undefined' && <b>Question {id+1}</b>} Points: {evaluate.points} / {evaluate.maxPoints} <ul>
                {evaluate.answer && <li>Answer: {evaluate.answer.toString()}</li>}
                {evaluate.correct && <li>Correct {evaluate.correct.toString()}</li>}
                {evaluate.tests && evaluate.tests.map((test, testId) => <li>Test {testId+1}: {test}</li>)}
                {evaluate.message && <li>{evaluate.message}</li>}
            </ul></li>;
}