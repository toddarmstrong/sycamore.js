import knot from 'knot.js'

export default class Sycamore {

    /**
        --- CONSTRUCTOR ---
    **/

    constructor (data, options = {}) {
        this.emitter = knot()

        let speed
        if (options.speed && typeof options.speed === 'number' && options.speed >= 1) {
            speed = options.speed
        } else {
            speed = 5
        }

        let delay
        if (options.delay && typeof options.delay === 'number' && options.delay >= 0) {
            delay = options.delay
        } else {
            delay = 0
        }

        let delayMinMax
        if (options.delayMinMax && Array.isArray(options.delayMinMax) && options.delayMinMax.length === 2 && options.delayMinMax[0] > 0 && options.delayMinMax[1] > 0 && options.delayMinMax[0] < options.delayMinMax[1]) {
            delayMinMax = options.delayMinMax
        } else {
            delayMinMax = false
        }

        let characterDependentWait
        if (options.characterDependentWait !== null && typeof options.characterDependentWait === 'boolean') {
            characterDependentWait = options.characterDependentWait
        } else {
            characterDependentWait = true
        }

        let firstMessage
        if (options.firstMessage && typeof options.firstMessage === 'string') {
            firstMessage = options.firstMessage
        } else {
            firstMessage = false
        }

        let autoNext
        if (options.autoNext !== null && typeof options.autoNext === 'boolean') {
            autoNext = options.autoNext
        } else {
            autoNext = true
        }

        this.options = {
            speed: speed,
            delay: delay,
            delayMinMax: delayMinMax,
            characterDependentWait: characterDependentWait,
            firstMessage: firstMessage,
            autoNext: autoNext
        }

        const averageCharactersPerSecond = 6
        this.charactersPerSecond = (averageCharactersPerSecond * 2) * (this.options.speed / 10)

        this.currentQuestion = false
        this.nextMessage = false
        this.conversationFinished = false
        this.answeredData = []
        this.variables = {}

        if (data instanceof Array) {
            this.data = data
        } else if (data) {
            throw new Error(`Data is not an array.`)
        }

        return this
    }

    /**
        --- API ---
    **/

    init (id) {
        if (id) {
            this._findAndProcessDataObj(id)
        } else if (this.options.firstMessage) {
            this._findAndProcessDataObj(this.options.firstMessage)
        } else {
            this._processDataObj(this.data[0])
        }
    }

    answer (answer) {
        this._answerQuestion(answer)
    }

    next (id) {
        if (this.conversationFinished) {
            throw new Error(`Conversation has finished.`)
        } else {
            if (options.autoNext) {
                throw new Error(`autoNext option is set to true.`)
            } else if (!this.nextMessage) {
                throw new Error(`There is no next message object.`)
            } else {
                if (id && typeof id === 'string') {
                    this._findAndProcessDataObj(id)
                } else {
                    this._findAndProcessDataObj(this.nextMessage)
                }
            }
        }
        
    }

    on (...args) { return this.emitter.on(...args) }
    off (...args) { return this.emitter.off(...args) }

    /**
        --- CORE FUNCTIONS ---
    **/

    _calculateWait (question) {
        if (this.options.characterDependentWait) {
            const characterLength = question.length
            let wait = characterLength / this.charactersPerSecond
            wait = wait * 1000
            wait = Math.round(wait)
            return wait
        } else {
            return 0
        }
    }

    _calculateDelay () {
        if (this.options.delayMinMax) {
            return Math.floor(Math.random() * (this.options.delayMinMax[1] - this.options.delayMinMax[0] + 1) + this.options.delayMinMax[0])
        } else {
            return this.options.delay
        }
    }

    _findDataObjByID (id) {
        return new Promise((resolve, reject) => {
            this.data.forEach((obj) => {
                if (obj.id === id) {
                    resolve(obj)
                }
            })
            reject('No message object found')
        })
    }

    _processDataObj (dataObj) {
        if (dataObj.text && dataObj.question) {
            throw new Error(`Message object can't have both text and question key.`)
        } else if (dataObj.text && typeof dataObj.text === 'string') {
            this._sendMessage(dataObj)
        } else if (dataObj.question && typeof dataObj.question === 'string') {
            this._askQuestion(dataObj)
        } else {
            throw new Error(`Data object doesn't contain text or question key.`)
        }
    }

    _findAndProcessDataObj (id) {
        this._findDataObjByID(id).then((obj) => {
            this._processDataObj(obj)
        }).catch((error) => {
            throw new Error(error)
        })
    }

    _sendMessage (dataObj) {
        const wait = this._calculateWait(dataObj.text)

        this.emitter.emit('typing', wait)

        setTimeout(() => {
            this.emitter.emit('message', this._parseDataObj(dataObj))

            if (dataObj.next && typeof dataObj.next === 'string') {
                if (this.options.autoNext) {
                    const delay = this._calculateDelay()
                    this.emitter.emit('delay', delay)

                    setTimeout(() => {
                        this._findAndProcessDataObj(dataObj.next)
                    }, delay)
                } else {
                    this.nextMessage = dataObj.next
                }
            } else {
                this._finalData()
                this.conversationFinished = true
            }
        }, wait)
    }

    _askQuestion (dataObj) {
        this.currentQuestion = dataObj
        const wait = this._calculateWait(dataObj.question)

        this.emitter.emit('typing', wait)

        setTimeout(() => {
            this.emitter.emit('question', this._parseDataObj(dataObj))
        }, wait)
    }

    _answerQuestion (answerString) {
        const answeredQuestionData = {
            question: this.currentQuestion.question,
            answer: answerString
        }

        this.emitter.emit('answered', answeredQuestionData)

        this.answeredData.push(answeredQuestionData)

        this.emitter.emit('update', this.answeredData)

        if (this.currentQuestion.input) {
            let newVariable = {
                [this.currentQuestion.input.variable]: answerString
            }
            
            let newVariables = Object.assign(this.variables, newVariable)

            this.variables = newVariables

            if (this.currentQuestion.next && typeof this.currentQuestion.next === 'string') {
                if (this.options.autoNext) {
                    const delay = this._calculateDelay()
                    this.emitter.emit('delay', delay)
    
                    setTimeout(() => {
                        this._findAndProcessDataObj(this.currentQuestion.next)
                    }, delay)
                } else {
                    this.nextMessage = this.currentQuestion.next
                }
            } else {
                this._finalData()
                this.conversationFinished = true
            }
        } else if (this.currentQuestion.answers) {
            this.currentQuestion.answers.forEach((answer) => {
                if (answer.text === answerString) {
                    if (answer.next && typeof answer.next === 'string') {
                        if (this.options.autoNext) {
                            const delay = this._calculateDelay()
                            this.emitter.emit('delay', delay)
            
                            setTimeout(() => {
                                this._findAndProcessDataObj(answer.next)
                            }, delay)
                        } else {
                            this.nextMessage = answer.next
                        }
                    } else {
                        this._finalData()
                        this.conversationFinished = true
                    }
                }
            })
        }
    }

    _finalData () {
        let data = {
            data: this.answeredData,
            variables: this.variables
        }

        this.emitter.emit('finished', data)
    }

    _parseDataObj (dataObj) {
        for (let key in this.variables) {
            if (dataObj.text) {
                dataObj.text = dataObj.text.replace('${' + key + '}', this.variables[key])
            } else if (dataObj.question) {
                dataObj.question = dataObj.question.replace('${' + key + '}', this.variables[key])
            }
        }
        return dataObj
    }
}
