import knot from 'knot.js'

export default class Sycamore {

    /**
        --- CONSTRUCTOR ---
    **/

    constructor (data, options = {}) {
        this.emitter = knot()

        let speed
        if (options.speed && typeof options.speed === 'number' && options.speed >= 1 && options.speed <= 10) {
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

        this.options = {
            speed: speed,
            delay: delay,
            delayMinMax: delayMinMax,
            firstQuestion: options.firstQuestion || false
        }

        const averageCharactersPerSecond = 6
        this.charactersPerSecond = (averageCharactersPerSecond * 2) * (this.options.speed / 10)

        this.currentQuestion = false
        this.answeredData = []

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
        } else if (this.options.firstQuestion) {
            this._findAndProcessDataObj(this.options.firstQuestion)
        } else {
            this._processDataObj(this.data[0])
        }
    }

    answer (answer) {
        this._answerQuestion(answer)
    }

    on (...args) { return this.emitter.on(...args) }
    off (...args) { return this.emitter.off(...args) }

    /**
        --- CORE FUNCTIONS ---
    **/

    _calculateWait (question) {
        const characterLength = question.length
        let wait = characterLength / this.charactersPerSecond
        wait = wait * 1000
        wait = Math.round(wait)
        return wait
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
        if (dataObj.type === 'message') {
            this._sendMessage(dataObj)
        } else if (dataObj.type === 'question') {
            this._askQuestion(dataObj)
        } else {
            throw new Error(`Data object doesn't have a valid type.`)
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
            this.emitter.emit('message', dataObj)

            const delay = this._calculateDelay()
            this.emitter.emit('delay', delay)
                
            setTimeout(() => {
                this._findAndProcessDataObj(dataObj.next)
            }, delay)
        }, wait)
    }

    _askQuestion (dataObj) {
        this.currentQuestion = dataObj
        const wait = this._calculateWait(dataObj.question)

        this.emitter.emit('typing', wait)

        setTimeout(() => {
            this.emitter.emit('question', dataObj)
        }, wait)
    }

    _answerQuestion (answer) {
        const answeredQuestionData = {
            question: this.currentQuestion.question,
            answer: answer.text
        }

        this.emitter.emit('answered', answeredQuestionData)

        this.answeredData.push(answeredQuestionData)

        this.emitter.emit('update', this.answeredData)

        if (answer.next) {
            const delay = this._calculateDelay()
            this.emitter.emit('delay', delay)

            setTimeout(() => {
                this._findAndProcessDataObj(answer.next)
            }, delay)
        } else {
            this.emitter.emit('finished', this.answeredData)
        }
    }
}
