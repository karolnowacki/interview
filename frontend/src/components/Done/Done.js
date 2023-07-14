import React, { useEffect } from 'react';

import './Done.css';
import Evaluate from '../Evaluate/Evaluate';

export default function Done({axios, interview, getInterview}) {

    useEffect(() => {
        if (!interview.evaluate) {
            const timer = setTimeout(() => {
                getInterview()
            }, 3000);
            return () => clearTimeout(timer);
        }
      }, [interview]);

    let score = false;
    if (interview.evaluate) {
        score = { points: 0, maxPoints: 0 }
        interview.evaluate.reduce((acc, val) => { acc.points += val.points; acc.maxPoints += val.maxPoints; return acc}, score);
    }

    return (
        <div>
            <h2>Interview done</h2>
            <ul class="evaluate">
                {interview.evaluate ? interview.evaluate.map(
                    (value, id) => <Evaluate id={id} evaluate={value} />
                ) : <div>Evaluating answers...</div>}
            </ul>
            {score && <b>Total score {score.points} / {score.maxPoints} = {100*score.points/score.maxPoints}%</b>}
        </div>
    );
}
