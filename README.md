# sycamore.js

🌲 A decision tree based chat library

## Usage

```javascript
import Sycamore from 'sycamore.js'

// import the data
import data from './data.json'

// or

// create the data array
const data = [
	{
		id: 'animal',
		question: 'Which animal do you like more?',
		answers: [
			{
				text: 'Cat',
				nextQuestion: 'age', // set the next question to be asked by id, if this answer is selected 
				callback: someFunction // set a callback function if this answer is selected 
			},
			{
				text: 'Dog',
				nextQuestion: 'age'
			}
		]
	},
	{
		id: 'age',
		question: 'How old are you?',
		// if an answer object doesn't contain the nextQuestion key, it will be an end point of the tree
		answers: [
			{
				text: 'Under 15'
			},
			{
				text: '15 - 30'
			},
			{
				text: '31 - 45'
			},
			{
				text: '46 - 60'
			},
			{
				text: 'Over 60'
			}
		]
	}
]

const someFunction = () => {
	// this is the callback function for the answer 'Cat'
}

// create instance of sycamore with data
const sycamore = new Sycamore(data)

// initiate and start with the first question in the data
sycamore.init()

// or

// initiate and start with a specific question by it's ID
sycamore.init('age')
```

## Events

```javascript
// when Sycamore is emulating writing and sending the question
sycamore.on('typing', (wait) => {
	// passed the wait time in milliseconds
	
	// start a 'typing' animation for example
})

// sycamore emits a question and will wait for the answer() method to be called in response
sycamore.on('question', (obj) => {
	// stop the 'typing' animation
	// do something with obj.question to display the question
	// iterate over and display each obj.answers.text
})

// after each question is answered, sycamore will emit an updated event with the current collected data
sycamore.on('update', (data) => {

})

// once the tree reaches an end, the finished event will be emitted with the final collected data
sycamore.on('finished', (data) => {
	// can display or store the data array here
})
```

## Methods

```javascript
// send back the answer to the previous asked question
sycamore.answer(answer)
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| speed | int | 5 | A value between 1 - 10. 5 is an average typing speed. If number is below 1 or above 10 then it will be ignored and default will be used.
| firstQuestion | string | | Supply a question ID string to determine that is the first question

```javascript
const options = {
	speed: 5, // Determine the speed of the typing, from 1 - 10
	firstQuestion: 'age' // The first question can be set in the options or passed as the first parameter to the init method
}

const sycamore = new Sycamore(data, options)
```