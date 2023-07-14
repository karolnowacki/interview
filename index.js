require('express-group-routes');
const express = require('express');
const app = express();

var expressWs = require('express-ws')(app);
const adminWss = expressWs.getWss('/admin/live');

let cors = require('cors');
app.use(cors({ origin: '*' }));

app.use(express.static('frontend/build'));

const { v4: uuidv4 } = require('uuid');

const state = require('./lib/state.js')('./state.json');
state.setOnce('admin_key', uuidv4());
state.setOnce('user_key', uuidv4());
state.setOnce('state', "welcome");

const questions = require('./lib/questions.js')('questions');

state.setOnce('answers', new Array(questions.last()+1).fill(null));

const path = require('path');
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
});

function checkKey(key) {
    if (key == state.get('admin_key'))
        return "admin";
    if (key == state.get('user_key'))
        return "user";
    return null;
}

async function evaluate() {
    questions.evaluate(state.get('answers')).then((evaluation) => state.set('evaluate', evaluation));
}

state.onChange((state) => {
    adminWss.clients.forEach(function (client) {
        client.send(JSON.stringify({
            'state': state.state,
            'questions': questions.questions
        }));
    });
});

app.group('/api', (router) => {

    router.use(express.json());

    router.post('/checkKey', (req, res) => {
        res.send(checkKey(req.body.key));
    });

    router.group('/admin', (router) => {
        router.use((req, res, next) => {
            let token = "";
            if (req.headers.authorization) {
                token = req.headers.authorization;
            }
            if (req.query.token)
                token = req.query.token;
            if (checkKey(token) == 'admin') {
                return next()
            }
            return res.status(401).json({ 'message': "Unauthorized" });
        })

        router.get('/', (req, res) => {
            return res.send({
                'state': state.state,
                'questions': questions.questions
            });
        });

        router.ws('/live', (ws, req) =>  {
            console.log('admin connected');
            ws.send(JSON.stringify({
                'state': state.state,
                'questions': questions.questions
            }));
        });

    });

    router.group('/interview', (router) => {
        router.use((req, res, next) => {
            if (req.headers.authorization) {
                const token = req.headers.authorization;
                if (checkKey(token) == 'user') {
                    return next()
                }
            }
            return res.status(401).json({ 'message': "Unauthorized" });
        })

        router.get('/', (req, res) => {

            if (state.get('state') == 'welcome')
                return res.send({ state: 'welcome'});

            if (state.get('state') == 'interview')
                return res.send({ 
                    state: 'interview',
                    question: questions.get(state.get('question')).getQuestion(),
                    currentQuestion: state.get('question'),
                    lastQuestion: questions.last(),
                    answer: state.getAnswer(state.get('question'))
                });
            if (state.get('state') == 'summary')
                return res.send({ 
                    state: 'summary',
                    lastQuestion: questions.last(),
                    answers: state.get('answers').map((answer) => answer != null)
                });

            if (state.get('state') == 'done') {
                return res.send({ 
                    state: 'done',
                    startTimestamp: state.get('startTimestamp'),
                    endTimestamp: state.get('endTimestamp'),
                    evaluate: state.get('evaluate')
                });
            }

            return res.status(503).json({ 'message': "Unknown state"});

        });

        router.post('/start', (req, res) => {
            if (state.get('state') == 'welcome') {
                state.set('state', 'interview');
                state.set('question', questions.first());
                state.set('startTimestamp', Date.now());
            }
            res.send({});
        });


        router.post('/answer', (req, res) => {
            
            if (state.get('state') !== 'interview')
                return res.send({
                    status: "error",
                    message: "Not in interview"
                });

            if (req.body.question < questions.first() || req.body.question > questions.last())
                return res.send({
                    status: "error",
                    message: "Invalid question"
                });

            state.setAnswer(req.body.question, req.body.answer);

            return res.send({
                status: "ok",
                answer: state.getAnswer(req.body.question)
            });
        });

        router.post('/next', (req, res) => {
            if (state.get('state') !== 'interview') {
                return res.send({
                    status: "error",
                    message: "Not in interview"
                });
            }
            if (state.get('question') < questions.last())
                state.set('question', state.get('question')+1);
            else 
                state.set('state', 'summary');
            return res.send({
                state: state.get('state'),
                question: state.get('question')
            });
        });

        router.post('/prev', (req, res) => {
            if (state.get('state') !== 'interview' && state.get('state') !== 'summary') {
                return res.send({
                    status: "error",
                    message: "Not in interview"
                });
            }
            if (state.get('state') === 'interview') {
                if (state.get('question') > questions.first())
                    state.set('question', state.get('question')-1);
            } else {
                state.set('state', 'interview');
                state.set('question', questions.last());
            }

            return res.send({
                state: state.get('state'),
                question: state.get('question')
            });
        });

        router.post('/runTests', async (req, res) => {
            let question = questions.get(req.body.question);
            if (question.config.type == 'java') {
                const Java = require('./compilers/java.js');
                let compiler = new Java(question.config.publicTest, question.config.fullTest);
                let out = await compiler.runPublic(req.body.answer);
                return res.send({
                    'output': out
                });
            }
            return res.status(503).json({ 'message': "No compiler for this question"});
        });

        router.post('/finish', (req, res) => {
            if (state.get('state') == 'summary') {
                state.set('state', 'done');
                state.set('endTimestamp', Date.now());
                evaluate();
            }
            res.send({});
        });

    });

});

const PORT = process.env.PORT || 5000;
console.log('server started on port:', PORT);
console.log('Admin key:', state.get('admin_key'));
console.log('User key:', state.get('user_key'));
app.listen(PORT);