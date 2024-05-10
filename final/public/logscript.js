'use strict';

const $ = document.querySelector.bind(document);


const form = document.getElementById('signupForm');
const popup = document.getElementsByClassName('hero-content');
const input = document.getElementById('address');

// Update latitude and longitude elements
const latitudeElement = document.getElementById('latitude');
const longitudeElement = document.getElementById('longitude');

const getClimate =  async (address) => {
    var parts = address.split(',');

    fetch(`https://nominatim.openstreetmap.org/search?street=${parts[0]}&city=${parts[1]}&state=${parts[2]}&format=json&limit=1`)
    .then(res => res.json()).then(docs => {
    // if (data) {
        // const result = data.results[0].geometry.location
        const latitude = docs[0].lat
        const longitude = docs[0].lon
        console.log("latitude: ", latitude, "longitude: ", longitude)
        // Fetch weather information
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=6dea368c99a053969745d5e110936277`)
        .then( response => response.json())
        .then( weatherData => {
            //  
            console.log(weatherData)
            $('#weatherref').textContent = 'Weather: ' + weatherData.weather[0].description;
            // Convert temperature from Kelvin to Fahrenheit
            const fahrenheit = (weatherData.main.temp - 273.15) * 9/5 + 32;
            $('#temperatureref').textContent = `Temperature: ${fahrenheit.toFixed(2)}°F`;
            const iconCode = weatherData.weather[0].icon;
            const weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            $('#weatherIcon').src = weatherIconUrl;

        }).catch((err) => {showError(err)})
    }).catch((err) => {showError(err)});
};

// login link action
$('#loginLink').addEventListener('click', openLoginScreen);

// register link action
$('#registerLink').addEventListener('click',openRegisterScreen);

// logout link action
$('#logoutLink').addEventListener('click',openIndexScreen);
// sign In button action
$('#loginBtn').addEventListener('click', () => {
    if (!$('#loginUsername').value || !$('#loginPassword').value)
        return;

    const username = $('#loginUsername').value; // get username from input
    localStorage.setItem("address", $("#address").value);
    fetch('/login',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username: username, password: $('#loginPassword').value}) }
        // get user record)
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
            email: $('#registerEmail').value,
            address: $('#address').value
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
                    console.log("doc: ",doc)
                }
            })
            .catch(err => showError('ERROR: ' + err));
});

// update button action
$('#updateBtn').addEventListener('click', () => {
    if (!$('#updateName').value || !$('#updateAddress').value) {
        showError('Fields cannot be blank.');
        return;
    }

    const data = {
        name: $('#updateName').value,
        address: $('#updateAddress').value
    };
    localStorage.setItem("address", $("#address").value);

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
                alert("Your name and address have been updated.");
                openLoginScreen();
            }
        })
        .catch(err => showError('ERROR: ' + err));
});

// Delete button action
$('#deleteBtn').addEventListener('click', () => {
    if (!confirm("Are you sure you want to delete your profile?"))
        return;
    console.log(localStorage.authToken);
    fetch('/users/' + $('#username').innerText+'/'+localStorage.authToken, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(doc => {
            if (doc.error) {
                showError(doc.error);
            } else {
                openIndexScreen();
            }
        })
        .catch(err => showError('ERROR: ' + err));
    });

function showLocation(address) {
    var parts = address.split(',');

    fetch(`https://nominatim.openstreetmap.org/search?street=${parts[0]}&city=${parts[1]}&state=${parts[2]}&format=json&limit=1`)
        .then(res => res.json())
        .then(docs => {
            $('#latref').innerText = 'Latitude: '+ docs[0].lat;
            $('#longref').innerText = 'Longitude: '+ docs[0].lon;
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
 function openHomeScreen(doc){
    localStorage.authToken = doc.authToken;
    console.log("registering")
    $('#locationref').innerText = doc.user.address;
    showLocation(doc.user.address);
    getClimate(doc.user.address);
    $('#loginScreen').classList.add('hidden');
    $('#registerScreen').classList.add('hidden');
    $('#homeScreen1').classList.remove('hidden');
    resetInputs();
    showError('');
    $('#username').innerText = doc.user.username;
    $('#updateName').value = doc.user.name;
    $('#updateAddress').value = doc.user.address;
}


function openLoginScreen(){
    // hide other screens, clear inputs, clear error
    $('#registerScreen').classList.add('hidden');
    $('#homeScreen1').classList.add('hidden');
    resetInputs();
    showError('');
    // reveal login screen
    $('#loginScreen').classList.remove('hidden');
}

function openRegisterScreen(){
    // hide other screens, clear inputs, clear error
    $('#loginScreen').classList.add('hidden');
    $('#homeScreen1').classList.add('hidden');
    resetInputs();
    showError('');
    // reveal register screen
    $('#registerScreen').classList.remove('hidden');
}

function openIndexScreen(){
    window.location.href = 'index.html';
}