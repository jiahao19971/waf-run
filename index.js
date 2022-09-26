const axios = require('axios')
const dotenv = require("dotenv")
var fs = require('fs');

dotenv.config()

const url = process.env.URL

const number_of_run = parseInt(process.env.HOW_LONG_IN_MINUTES)

const number_of_request = parseInt(process.env.NUMBER_OF_REQUEST)

try {
    if (url === "" || url === undefined) {
        throw Error("URL Parameter is missing")
    } 

    if (isNaN(number_of_run)|| isNaN(number_of_request)) {
        throw Error("Env parameter is incorrect")
    }
    
    let running = {}
    
    const GetRequest = async (run) => {
        try {
            const response =  await axios.get(url)
            if (response.status === 200) {
                running = {
                    ...running,
                    [run]: {
                        success: running[run].success += 1,
                        ...running[run],
                    }
                }
            } else {
                if (running[run].unknown.length > 0) {
                    let unknowns = running[run].unknown.map(x => {
                        const keys = Object.keys(x).find(y => JSON.stringify(response.status) === y)
                        if (keys) {
                            return {
                                ...x,
                                [keys]: x[keys] += 1
                            }
                        } else {
                            return {
                                ...x,
                                [response.status]: 1
                            }
                        }
                    })
                    running[run].unknown = unknowns
                } else {
                    running[run].unknown.push({[response.status]: 1})
                }
            }
        } catch(error) {
            if (error.response.status === 403) {
                running = {
                    ...running,
                    [run]: {
                        blockWAF: running[run].blockWAF += 1,
                        ...running[run],
                    }
                }
            } else if (error.response.status === 429) {
                running = {
                    ...running,
                    [run]: {
                        blockEnvoy: running[run].blockEnvoy += 1,
                        ...running[run],
                    }
                }
            } else {
                if (running[run].unknown.length > 0) {
                    let unknowns = running[run].unknown.map(x => {
                        const keys = Object.keys(x).find(y => JSON.stringify(error.response.status) === y)
                        if (keys) {
                            return {
                                ...x,
                                [keys]: x[keys] += 1
                            }
                        } else {
                            return {
                                ...x,
                                [error.response.status]: 1
                            }
                        }
                    })
                    running[run].unknown = unknowns
                } else {
                    running[run].unknown.push({[error.response.status]: 1})
                }
            }
        }
    }
    
    let run = 0
    const endrun = number_of_run
    const completed = number_of_request - 1
    const RunFunctionLoop = () => {
        console.log("")
        console.log("I am running every minute")

        run += 1
        
        running = {
            ...running,
            [run]: {
                success: 0,
                blockWAF: 0,
                blockEnvoy: 0,
                unknown: [],
            }
        }
    
        for(let i = 0; i < number_of_request; i ++) {
            GetRequest(run)
            if (i === completed) {
                console.log("run: " + run)
                console.log("result: " + JSON.stringify(running))
                console.log("\n")
            }
        }
    }
    
    var now = new Date();
    var delay = 60 * 1000; // 1 min in msec
    var start = delay - (now.getSeconds()) * 1000 + now.getMilliseconds();
    
    console.log("Starting at: " + now)
    
    setTimeout(function() {
        const interval = setInterval(() => {
            RunFunctionLoop()
    
            // time is up
            if (run === endrun) {
                clearInterval(interval);
            }
        }, delay);
        RunFunctionLoop();
        
    }, start);
    
    
    const checkCompletion = () => {
        if (run === endrun) {
            var completed = new Date();

            console.log("result: " + JSON.stringify(running))
            fs.writeFile (`${endrun}MinutesRun.json`, JSON.stringify(running), function(err) {
                if (err) throw err;
                console.log('complete');
                }
            );
            console.log("completed at: " + completed)
            console.log("\n")
        } else {
            setTimeout(() => {
                checkCompletion()
            }, 120000)
        }
    }
    
    setTimeout(() => {
        checkCompletion()
    }, 120000)
    
} catch (err) {
    console.log(err)
}


