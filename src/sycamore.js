import knot from 'knot.js'

export default class Sycamore {

    /**
        --- CONSTRUCTOR ---
    **/

    constructor (data, options = {}) {
        this.emitter = knot()

        let speed
        if (options.speed && options.speed >= 1 && options.speed <= 10) {
            speed = options.speed
        } else {
            speed = 5
        }

        this.options = {
            speed: speed,
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
            this._findAndAsk(id)
        } else if (this.options.firstQuestion) {
            this._findAndAsk(this.options.firstQuestion)
        } else {
            this._askQuestion(this.data[0])
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

    _findQuestionByID (id) {
        return new Promise((resolve, reject) => {
            this.data.forEach((obj) => {
                if (obj.id === id) {
                    resolve(obj)
                }
            })
            reject('No question found')
        })
    }

    _calculateWait (question) {
        const characterLength = question.length
        let wait = characterLength / this.charactersPerSecond
        wait = wait * 1000
        wait = Math.round(wait)
        return wait
    }

    _askQuestion (obj) {
        this.currentQuestion = obj
        const wait = this._calculateWait(obj.question)

        this.emitter.emit('typing', wait)

        setTimeout(() => {
            this.emitter.emit('question', obj)
        }, wait)
    }

    _findAndAsk (id) {
        this._findQuestionByID(id).then((obj) => {
            this._askQuestion(obj)
        }).catch((error) => {
            throw new Error(error)
        })
    }

    _answerQuestion (answer) {
        const answeredQuestionData = {
            question: this.currentQuestion.question,
            answer: answer.text
        }

        this.answeredData.push(answeredQuestionData)

        this.emitter.emit('update', this.answeredData)

        if (answer.nextQuestion) {
            this._findAndAsk(answer.nextQuestion)
        } else {
            this.emitter.emit('finished', this.answeredData)
        }
        
        if (answer.callback) {
            if (typeof answer.callback == 'function') {
                answer.callback()
            } else {
                throw new Error(`The callback for '${answer.text}' is not a function`)
            }
        }
    }
}
