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
		next: 'name'
	},
	{
		id: 'name',
		question: 'What is your name?',
		input: {
			variable: 'name',
			label: 'Enter your name'
		},
		next: 'compliment'
	},
	{
		id: 'compliment',
		text: 'You look great today, ${name}!',
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
		question: 'So ${name}, how old are you?',
		answers: [
			{
				text: 'Under 15',
				next: 'color'
			},
			{
				text: '15 - 30',
				next: 'color'
			},
			{
				text: '31 - 45',
				next: 'color'
			},
			{
				text: '46 - 60',
				next: 'color'
			},
			{
				text: 'Over 60',
				next: 'color'
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

## Variables

Variables can be set when an input object is added to a question and a variable key is set within

```javascript
{
	id: 'name',
	question: 'What is your name?',
	input: {
		variable: 'name',
		label: 'Enter your name'
	},
	next: 'compliment'
}
```

You are able to reference these variables using the following syntax

```javascript
{
	id: 'compliment',
	text: 'You look great today, ${name}!',
	next: 'animal',
}
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

// go to next message if the autoNext option is set to false
// if a message id is passed as a parameter, it will skip to that message next
sycamore.next(id)
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| speed | int | 5 | A value of 1 or above. 5 is an average typing speed. If number is below 1 then it will be ignored and default will be used.
| delay | int | 0 | A millisecond value greater or equal to 0, which specifies the delay time after the answer() method is called before the next question is asked
| delayMinMax | array | | An array of 2 numbers only to determine the range of randomised delay after each answer() (ex. [1500, 3000])
| characterDependentWait | boolean | true | Set whether a wait is calculated on the length of the string
| firstMessage | string | | Supply a question ID string to determine that is the first question
| autoNext | boolean | true | Set whether the next message or question will be automatically sent

```javascript
const options = {
	speed: 5, // Determine the speed of the typing
	delay: 1000, // Delay after question is answered before next is asked, millisecond >= 0
	delayMinMax: [1500, 3000], // Array containing only 2 numbers, first index must be lower than second
	characterDependentWait: true, // Sycamore will calculate the waiting time depending on the length of the string
	firstMessage: 'age', // The first question can be set in the options or passed as the first parameter to the init method
	autoNext: false // Sycamore will wait for the next() method to be called before advancing
}

const sycamore = new Sycamore(data, options)
```
