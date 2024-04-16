'use strict';

const $ = document.querySelector.bind(document);

// login link action
$('#loginLink').addEventListener('click',openLoginScreen);

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
        .then(doc => {
            if (!doc.authToken) {
                showError(doc.error);
            } else {
                openHomeScreen(doc);
            }
        })
        .catch(err => showError('ERROR: ' + err));
    });

// register button action
$('#registerBtn').addEventListener('click', () => {
    if (!$('#registerUsername').value || !$('#registerPassword').value ||
        !$('#registerName').value || !$('#registerEmail').value) {
        showError('All fields are required.');
        return;
    }

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
        .then(doc => {
            if (doc.error) {
                showError(doc.error);
            } else {
                openHomeScreen(doc);
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

function openHomeScreen(doc){
    localStorage.authToken = doc.authToken;
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

function openLoginScreen(){
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