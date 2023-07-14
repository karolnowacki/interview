const { time } = require('console');
const fs = require('fs')

class State {

    constructor(file) {
        this.file = file;
        this.onChangeHandlers = [];
        if (fs.existsSync(file))
            this.load();
        else
            this.state = {};
    }

    load() {
        this.state = JSON.parse(fs.readFileSync(this.file));
    }

    save() {
        fs.writeFileSync(this.file, JSON.stringify(this.state));
        this.onChangeHandlers.forEach(handler => handler(this));
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        this.state[key] = value;
        this.save();
    }

    setOnce(key, value) {
        if (!(key in this.state))
            this.set(key, value);
    }

    setAnswer(id, answer) {
        if (!('answers' in this.state))
            this.state.answers = [];
        this.state.answers[id] = answer;
        this.save();
        return answer;
    }

    getAnswer(id) {
        if ('answers' in this.state && id in this.state.answers)
            return this.state.answers[id];
        return null;
    }

    onChange(handler) {
        this.onChangeHandlers.push(handler)
    }
}

module.exports = (file) => { return new State(file) }
