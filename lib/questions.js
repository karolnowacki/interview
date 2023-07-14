const fs = require('fs')
const path = require('path');
const Question = require('./question.js')

class Questions {

    constructor(dir) {

        this.questions = [];

        const files = fs.readdirSync(dir)
            .filter(file => path.extname(file).toLowerCase() === '.json')
            .sort((a, b) => a.localeCompare(b))
        
        for (let file of files) {
            this.questions.push(new Question('../' + dir + '/' + file));
        }
    }

    get(id) {
        return this.questions[id];
    }

    first() { return 0; }
    last() { return this.questions.length - 1; }
    next(current) { if (current < this.last) return current+1; }

    evaluate(answers) {
        return new Promise((resolve, reject) => {
            Promise.all(this.questions.map((question, id) => question.evaluate(answers[id])))
                .then((evaluation) => resolve(evaluation));
        })
    }

}

module.exports = (dir) => { return new Questions(dir); }