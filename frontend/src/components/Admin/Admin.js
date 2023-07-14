import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useWebSocket from 'react-use-websocket';
import { config } from '../../config';

import { ChoiceRender } from '../Choice/Choice';
import { MultipleChoiceRender } from '../MultipleChoice/MultipleChoice';
import { JavaRender } from '../Java/Java';
import Evaluate from '../Evaluate/Evaluate';

export default function Admin({ token }) {

    const [data, setData] = useState();

    useWebSocket(config.url.WS_URL, {
        onMessage: (message) => {
            setData(JSON.parse(message.data));
            console.log(JSON.parse(message.data));
        },
        queryParams: {
            'token': token
        }
    });

    let score = false;
    if (data && data.state.evaluate) {
        score = { points: 0, maxPoints: 0 }
        data.state.evaluate.reduce((acc, val) => { acc.points += val.points; acc.maxPoints += val.maxPoints; return acc}, score);
    }

    if (data) {
        return (<div>
        <h2>Admin</h2>

        <div><h3>Config:</h3>
        <ul>
            <li>User Key: {data.state.user_key}</li>
            <li>Admin Key: {data.state.admin_key}</li>
        </ul></div>

        <div><h3>Current state:</h3>
        <ul>
            <li>State: {data.state.state}</li>
            <li>Question: {data.state.question}</li>
            <li>Start Time: {new Date(data.state.startTimestamp).toString()}</li>
            <li>End Time: {new Date(data.state.endTimestamp).toString()}</li>       
        </ul></div>

        {score && <div><h3>Score:</h3>
        <ul>
            <li>Points: {score.points}</li>
            <li>Max Points: {score.maxPoints}</li>
            <li>Score : {100*score.points/score.maxPoints}%</li>     
        </ul></div>}

        {data.questions.map((question, id) => {
            if (question.config.type === 'choice')
                return (<div><h3>Question {id+1}</h3>
                    <ChoiceRender question={question.config.question} alternatives={question.config.alternatives} answer={data.state.answers[id]} />
                    {data.state.evaluate && <Evaluate evaluate={data.state.evaluate[id]} />}
                    </div>)
            if (question.config.type === 'multiple_choice')
                return (<div><h3>Question {id+1}</h3>
                    <MultipleChoiceRender question={question.config.question} alternatives={question.config.alternatives} answer={new Set(data.state.answers[id])} />
                    {data.state.evaluate && <Evaluate evaluate={data.state.evaluate[id]} />}
                    </div>)
            if (question.config.type === 'java')
                return (<div><h3>Question {id+1}</h3>
                    <JavaRender question={question.config.question} source={data.state.answers[id]} />
                    {data.state.evaluate && <Evaluate evaluate={data.state.evaluate[id]} />}
                    </div>)
        
            return <div>Unsupported question type</div>
        })}

    </div>)
    } else return <div>Loading...</div>;

}

Admin.propTypes = {
    token: PropTypes.string.isRequired
};