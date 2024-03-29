'use strict'

//extract parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const fname = urlParams.get('fname');
const lname = urlParams.get('lname');
const q1 = urlParams.get('q1');
const q2 = urlParams.get('q2');
const q3 = urlParams.get('q3');

//check answers and display results
const correctAnswers = { q1: 'c', q2: 'c', q3: 'b' };
let results = '';

results += `<p>Name: ${fname} ${lname}</p>`;
results += '<p>Quiz Results:</p>';

results += `<p>1. How many times wider is the sun than Earth? <br> Your answer: ${q1} <br> Correct answer: ${correctAnswers.q1}</p>`;
results += `<p>2. What is the sun's core temperature? <br> Your answer: ${q2} <br> Correct answer: ${correctAnswers.q2}</p>`;
results += `<p>3. How long does it take for the sun to complete one rotation of its equator? <br> Your answer: ${q3} <br> Correct answer: ${correctAnswers.q3}</p>`;

document.body.innerHTML = results;