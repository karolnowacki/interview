const fs = require('fs');
const { spawn } = require('child_process');
const convert = require('xml-js');

class JavaCompiler {

    constructor(publicTest, fullTest) {
        this.publicTest = publicTest;
        this.fullTest = fullTest
    }

    setup(code) {
        fs.copyFileSync(this.publicTest, 'compilers/java/src/test/java/interview/SolutionTest.java');
        fs.copyFileSync(this.fullTest, 'compilers/java/src/test/java/interview/SolutionFullTest.java');
        fs.writeFileSync("compilers/java/src/main/java/interview/Solution.java", code);
    }

    runPublic(code) {
        return new Promise((resolve, reject) => {
            this.setup(code);

            let output = "";

            const mvn = spawn('mvn', ['--batch-mode', '--quiet', '-Dtest=SolutionTest', 'clean', 'surefire-report:report'], {
                cwd: 'compilers/java',
                env: []
            });

            mvn.stdout.on('data', (data) => {
                output += data;
            });

            mvn.on('close', (code) => {
                resolve(output);
            });
        });
    }

    runFull(code) {
        return new Promise((resolve, reject) => {
            this.setup(code);

            let output = "";

            const mvn = spawn('mvn', ['--batch-mode', '--quiet', '-Dtest=SolutionFullTest', 'clean', 'surefire-report:report'], {
                cwd: 'compilers/java',
                env: []
            });

            mvn.stdout.on('data', (data) => {
                output += data;
            });

            mvn.on('close', (code) => {
                resolve(output);
            });
        });
    }

    getPublicTestResults() {
        return this.getTest('compilers/java/target/surefire-reports/TEST-interview.SolutionTest.xml');
    }

    getFullTestResults() {
        return this.getTest('compilers/java/target/surefire-reports/TEST-interview.SolutionFullTest.xml');    
    }

    getTest(file) {
        if (!fs.existsSync(file)) {
            return null;
        }
        try {
            var xml = fs.readFileSync(file, 'utf8');
            var result = convert.xml2js(xml, {ignoreComment: true});
        } catch (error) {
            console.log(error);
            return null;
        }
        return result.elements.filter(el => el.name == 'testsuite').flatMap(el => el.elements)
            .filter(el => el.name == 'testcase').map(el => ({
                'name' : el.attributes.name,
                'time' : el.attributes.time,
                'failure' : (el.elements && el.elements.filter(el => el.name == 'failure')) 
                    ? el.elements.filter(el => el.name == 'failure').flatMap(el => el.attributes.message).join("\n")
                    : false 
             }));
    }

    countFullTest() {
        //TODO: this is lame
        var test = fs.readFileSync(this.fullTest, 'utf8');
        return (test.match(/@Test/g) || []).length;
    }

}

module.exports = JavaCompiler