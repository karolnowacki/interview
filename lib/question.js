const fs = require('fs');

const Java = require('../compilers/java.js');

class Question {

    constructor(config) {
        this.config = require(config)
    }

    getQuestion() {
        let ret = {
            "type": this.config.type,
            "question": this.config.question,
        }
        if (this.config.type == 'choice' || this.config.type == 'multiple_choice') {
            ret.alternatives = this.config.alternatives
        }
        if (this.config.type == 'java') {
            ret.source = fs.readFileSync(this.config.source, 'utf8');
        }
        return ret;
    }

    evaluate(answer) {
        return new Promise((resolve, reject) => {
            if (this.config.type == 'choice') {
                resolve({ 
                    points : answer == this.config.correct ? 1 : 0,
                    maxPoints: 1,
                    answer: answer,
                    correct: this.config.correct
                });
            }
            if (this.config.type == 'multiple_choice') {
                resolve({ 
                    points : this.compareArrays(answer, this.config.correct) ? 1 : 0,
                    maxPoints: 1,
                    answer: answer,
                    correct: this.config.correct
                });
            }
            if (this.config.type == 'java') {
                let compiler = new Java(this.config.publicTest, this.config.fullTest);
                compiler.runFull(answer).then(() => {
                    let result = compiler.getFullTestResults();
                    let ret = { points: 0, maxPoints: 0, tests: [] }
        
                    if (result) {
                        result.reduce((acc, test) => { 
                            acc.maxPoints++; 
                            if (test.failure === false) {
                                acc.tests.push('OK');
                                acc.points++;
                            } else {
                                acc.tests.push('FAILED: '+test.failure);
                            }
                            return acc;
                        }, ret);
                    } else {
                        ret.maxPoints = compiler.countFullTest();
                        ret.message = "Compilation failed.";
                    } 
                    resolve(ret);
                });
            }
        });
    }

    compareArrays(a, b) {
        a.sort();
        b.sort();
        return a.length === b.length && a.every((element, index) => element == b[index]);
    }

}

module.exports = Question