import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/src-noconflict/ext-language_tools";

import './Java.css';

export function JavaRender({ question, onChange, source }) {
    return (
        <>
            <ReactMarkdown>{question}</ReactMarkdown>
            <AceEditor
                placeholder="Source"
                mode="java"
                theme="xcode"
                name="blah2"
                onChange={onChange}
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={false}
                value={source}
                readOnly={typeof onChange === 'undefined'}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: false,
                    showLineNumbers: true,
                    tabSize: 4,
                }}/>
        </>
    );
}

export default function Java({axios, interview, getInterview}) {

    const [message, setMessage] = useState();
    const [answer, setAnswer] = useState(interview.answer == null ? interview.question.source : interview.answer);
    const [tests, setTests] = useState();

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

    function save() {
        setMessage("Saving...");
        axios.post('/answer', { 
            "question": interview.currentQuestion,
            "answer": answer
        }).then((res) => {
            if (res.data.status == "ok") {
                setMessage("Answer saved.");
                setAnswer(res.data.answer);
            } else {
                setMessage(`Error: ${res.data.message}`);
            }
        })
    }

    function runTest() {
        setTests("Runing tests...");
        axios.post('/runTests', {
            "question": interview.currentQuestion,
            "answer": answer
        }).then((res) => {
            setTests(res.data.output);
        });
    }

    return (
        <div>
            <h2>Question {interview.currentQuestion+1} / {interview.lastQuestion+1}</h2>
            <JavaRender question={interview.question.question} source={answer} onChange={setAnswer} />
            {getInterview && <div>
            <div>{message}</div>
            <div><pre>{tests}</pre></div>
            <button onClick={runTest}>Run Test</button>
            <button onClick={save}>Save</button>
            <button onClick={goPrev}>Prev</button>
            <button onClick={goNext}>Next</button>
            </div>}
        </div>
    );
}
