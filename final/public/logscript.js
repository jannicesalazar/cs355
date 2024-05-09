'use strict';

const $ = document.querySelector.bind(document);


const form = document.getElementById('signupFOrm');
const popup = document.getElementsByClassName('hero-content');
const input = document.getElementById('address');

// Initialize Google Places Autocomplete
// const autocomplete = new google.maps.places.Autocomplete(input);

const getClimate =  async () => {
    if (input.value) localStorage.setItem("address", input.value)

    const address = input.value || localStorage.getItem('address');

    // Perform basic validation to ensure address is not empty
    if (!address.trim()) {
        alert('Please enter a valid address.');
        return;
    }

    // Use a geocoding service to get latitude and longitude
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyAy9DVSWmQyFMBkMzly4eFjczHnZLPU08w`);
    const data = await response.json();
    console.log(data, 'lat and lon')

    if (data) {
        const result = data.results[0].geometry.location
        const latitude = result.lat
        const longitude = result.lng
        console.log("latitude: ", latitude, "longitude: ", longitude)
        // Fetch weather information
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=6dea368c99a053969745d5e110936277`);
        const weatherData = await weatherResponse.json();
        console.log(weatherData, 'weather')

        // Fetch natural disaster information
        const disasterResponse = await fetch(`https://api.ncei.noaa.gov/data/global-summary-of-the-day?latitude=${latitude}&longitude=${longitude}&datasetid=GSOM&units=metric&startdate=2023-01-01&enddate=2023-01-01&token=PwfvrAAFdXIluwIJJDDemafDSVEUEpAF`);
        const disasterData = await disasterResponse.json();
        console.log(disasterData)

        // Construct popup content
        const popupContent = `
            <h3>Weather Information</h3>
            <p>Temperature: ${weatherData.main.temp}°C</p>
            <p>Description: ${weatherData.weather[0].description}</p>
            <h3>Natural Disaster Information</h3>
            <!-- Display relevant disaster information here -->
        `;

        // Display popup with content
        popup.innerHTML = popupContent;
        popup.style.display = 'block';
    } else {
        alert('Address not found!');
    }
};

// $("#getClimamte") && $("#getClimamte").addEventListener("click", getClimate)

// login link action
$('#loginLink').addEventListener('click', openLoginScreen);

// register link action
$('#registerLink').addEventListener('click',openRegisterScreen);

// logout link action
$('#logoutLink').addEventListener('click',openLoginScreen);
// sign In button action
$('#loginBtn').addEventListener('click', () => {
    if (!$('#loginUsername').value || !$('#loginPassword').value)
        return;

    const username = $('#loginUsername').value; // get username from input

    fetch('/login',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username: username, password: $('#loginPassword').value}) }
        // get user record}
    ).then(res => res.json())
        .then(async doc => {
            if (!doc.authToken) {
                showError(doc.error);
            } else {
                await openHomeScreen(doc);
            }
        })
        .catch(err => showError('ERROR: ' + err));
    });

// register button action
$('#registerBtn').addEventListener('click', async () => {
    if (!$('#registerUsername').value || !$('#registerPassword').value ||
        !$('#registerName').value || !$('#registerEmail').value || !$("#address").value) {
        showError('All fields are required.');
        return;
    }
    localStorage.setItem("address", $("#address").value);
    const data = {
        username: $('#registerUsername').value,
        password: $('#registerPassword').value,
        name: $('#registerName').value,
        email: $('#registerEmail').value
    };

    fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(async doc => {
            if (doc.error) {
                showError(doc.error);
            } else {
                await openHomeScreen(doc);
            }
        })
        .catch(err => showError('ERROR: ' + err));
});

// update button action
$('#updateBtn').addEventListener('click', () => {
    if (!$('#updateName').value || !$('#updateEmail').value) {
        showError('Fields cannot be blank.');
        return;
    }

    const data = {
        name: $('#updateName').value,
        email: $('#updateEmail').value
    };

    fetch('/users/' + $('#username').innerText+'/'+localStorage.authToken, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(doc => {
            if (doc.error) {
                showError(doc.error);
            } else if (doc.ok) {
                alert("Your name and email have been updated.");
            }
        })
        .catch(err => showError('ERROR: ' + err));
});

// Delete button action
$('#deleteBtn').addEventListener('click', () => {
    if (!confirm("Are you sure you want to delete your profile?"))
        return;

    fetch('/users/' + $('#username').innerText+'/'+localStorage.authToken, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(doc => {
            if (doc.error) {
                showError(doc.error);
            } else {
                openLoginScreen();
            }
        })
        .catch(err => showError('ERROR: ' + err));
});

function showListOfUsers() {
    fetch('/users')
        .then(res => res.json())
        .then(docs => {
            docs.forEach(showUserInList);
        })
        .catch(err => showError('Could not get user list: ' + err));
}

function showUserInList(doc){
    // add doc.username to #userlist
    var item = document.createElement('li');
    $('#userlist').appendChild(item);
    item.innerText = doc.username;
}

function showError(err){
    // show error in dedicated error div
    $('#error').innerText=err;
}

function resetInputs(){
    // clear all input values
    var inputs = document.getElementsByTagName("input");
    for(var input of inputs){
        input.value='';
    }
}

async function openHomeScreen(doc){
    localStorage.authToken = doc.authToken;
    console.log("registering")
    window.location.href = "/home.html"
    return
    // hide other screens, clear inputs, clear error
    $('#loginScreen').classList.add('hidden');
    $('#registerScreen').classList.add('hidden');
    resetInputs();
    showError('');
    // reveal home screen
    $('#homeScreen').classList.remove('hidden');
    // display name, username
    $('#name').innerText = doc.user.name;
    $('#username').innerText = doc.user.username;
    // display updatable user info in input fields
    $('#updateName').value = doc.user.name;
    $('#updateEmail').value = doc.user.email;
    // clear prior userlist
    $('#userlist').innerHTML = '';
    // show new list of users
    showListOfUsers();
}

async function openLoginScreen(){
    // hide other screens, clear inputs, clear error
    $('#registerScreen').classList.add('hidden');
    $('#homeScreen').classList.add('hidden');
    resetInputs();
    showError('');
    // reveal login screen
    $('#loginScreen').classList.remove('hidden');
}

function openRegisterScreen(){
    // hide other screens, clear inputs, clear error
    $('#loginScreen').classList.add('hidden');
    $('#homeScreen').classList.add('hidden');
    resetInputs();
    showError('');
    // reveal register screen
    $('#registerScreen').classList.remove('hidden');
}