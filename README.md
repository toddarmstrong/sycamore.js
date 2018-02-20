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
		id: 'intro',
		text: 'Hey!',
		next: 'compliment'
	},
	{
		id: 'fact',
		text: 'I am not a robot, I am a real human.',
		next: 'color'
	},
	{
		id: 'compliment',
		text: 'You look great today!',
		next: 'animal',
	},
	{
		id: 'animal',
		question: 'Which animal do you like more?',
		answers: [
			{
				text: 'Cat',
				next: 'age'
			},
			{
				text: 'Dog',
				next: 'age'
			}
		]
	},
	{
		id: 'age',
		question: 'How old are you?',
		answers: [
			{
				text: 'Under 15',
				next: 'fact'
			},
			{
				text: '15 - 30',
				next: 'fact'
			},
			{
				text: '31 - 45',
				next: 'fact'
			},
			{
				text: '46 - 60',
				next: 'fact'
			},
			{
				text: 'Over 60',
				next: 'fact'
			}
		]
	},
	{
		id: 'color',
		question: 'Which colour is your favourite?',
		answers: [
			{
				text: 'red'
			},
			{
				text: 'blue'
			},
			{
				text: 'green'
			},
			{
				text: 'yellow'
			},
			{
				text: 'purple'
			},
			{
				text: 'orange'
			}
		]
	}
]

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

// sycamore emits a message to the user
sycamore.on('message', (obj) => {

})

// sycamore emits a question and will wait for the answer() method to be called in response
sycamore.on('question', (obj) => {
	// stop the 'typing' animation
	// do something with obj.question to display the question
	// iterate over and display each obj.answers.text
})

// when there is a delay between questions/messages this will fire
sycamore.on('delay', (delay) => {

})

// sycamore emits the 'answered' event when the answer() method is called
sycamore.on('answered', (qa) => {
	//qa obj contains the question and answer
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
| speed | int | 5 | A value of 1 or above. 5 is an average typing speed. If number is below 1 then it will be ignored and default will be used.
| delay | int | 0 | A millisecond value greater or equal to 0, which specifies the delay time after the answer() method is called before the next question is asked
| delayMinMax | array | | An array of 2 numbers only to determine the range of randomised delay after each answer() (ex. [1500, 3000])
| firstMessage | string | | Supply a question ID string to determine that is the first question

```javascript
const options = {
	speed: 5, // Determine the speed of the typing
	delay: 1000, // Delay after question is answered before next is asked, millisecond >= 0
	delayMinMax: [1500, 3000], // Array containing only 2 numbers, first index must be lower than second
	firstMessage: 'age' // The first question can be set in the options or passed as the first parameter to the init method
}

const sycamore = new Sycamore(data, options)
```