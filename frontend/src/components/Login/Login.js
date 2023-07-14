import React, { useState } from 'react';
import PropTypes from 'prop-types';

import './Login.css'

export default function Login({ setToken }) {

    const [key, setKey] = useState();

    let handleSubmit = (event) => {
        event.preventDefault();  
        setToken(key);
    };

    return (
        <div className="Login">
            <form onSubmit={handleSubmit}>
                Key: 
                <input
                    type="text"
                    id="key"
                    name="key"
                    value={key}
                    placeholder="Key"
                    onChange={(event) => setKey(event.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
};