import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { config } from '../../config';

import Welcome from '../Welcome/Welcome';
import Choice from '../Choice/Choice';
import MultipleChoice from '../MultipleChoice/MultipleChoice';
import Java from '../Java/Java';
import Summary from '../Summary/Summary';
import Done from '../Done/Done';

export default function Interview({ token }) {

    axios.defaults.baseURL = `${config.url.API_URL}/interview`;
    axios.defaults.headers.common['Authorization'] = token;
    axios.defaults.headers.post['Content-Type'] = 'application/json';

    const [interview, setInterview] = useState();

    function getInterview() {
        axios.get('').then(res => {
            setInterview(res.data)
        });
    }

    useEffect(() => {
        getInterview()
    }, [])

    if (interview) { 
        if (interview.state === 'welcome') 
            return <Welcome axios={axios} getInterview={getInterview} />
        if (interview.state === 'interview') {
            if (interview.question.type === 'choice')
                return <Choice axios={axios} getInterview={getInterview} interview={interview} />
            if (interview.question.type === 'multiple_choice')
                return <MultipleChoice axios={axios} getInterview={getInterview} interview={interview} />
            if (interview.question.type === 'java')
                return <Java axios={axios} getInterview={getInterview} interview={interview} />
            
            return <div>Unsupported question type</div>
        }
        if (interview.state === 'summary') 
            return <Summary axios={axios} getInterview={getInterview} interview={interview} />
        if (interview.state === 'done')
            return <Done axios={axios} getInterview={getInterview} interview={interview} />
    }

    return (<p>Interview</p>)
}

Interview.propTypes = {
    token: PropTypes.string.isRequired
};