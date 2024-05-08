const express = require('express');
const nedb = require("nedb-promises");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
const db = nedb.create('users.jsonl');

app.use(express.static('public'));
app.use(express.json());

function generateAuthToken() {
    return crypto.randomBytes(30).toString('hex');
}

//route to get all user records
app.get('/users',(req,res)=>{ // GET all data
    db.find({})
    .then(docs=>res.send(docs))
    .catch(error=>res.status(500).send({error}));
   });

//route to register user
app.post('/users', (req, res) => {
    const { username, password, email, name } = req.body;
    
    //validate input fields
    if (!username || !password || !email || !name) {
        return res.status(400).send({ error: 'Missing fields.' });
    }

    //check if username already exists
    db.findOne({ username })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).send({ error: 'Username already exists. Please choose a different one.' });
            }

            //hash the password
            const hashedPassword = bcrypt.hashSync(password, 10);
            //generate authentication token
            const authToken = generateAuthToken();

            //create new user object
            const newUser = {
                username,
                password: hashedPassword,
                email,
                name,
                authToken // authToken is defined here
            };

            //insert new user into the database
            return db.insertOne(newUser)
                       .then(insertedUser => ({insertedUser, authToken})); // return both inserted user and authToken
        })
        .then(({insertedUser, authToken}) => {
            if (!insertedUser) {
                // Handle the case where insertion failed
                return res.status(500).send({ error: 'Failed to register user.' });
            }
            //send back authentication token
            res.send({user: {username: insertedUser.username, name: insertedUser.name, email: insertedUser.email}, authToken });
        })
        .catch(error => {
            console.error(error);
            res.status(500).send({ error: 'Internal server error.' });
        });
});



//route to update user doc
app.patch('/users/:username/:authToken', (req, res) => {
    const { username, authToken } = req.params;

    //verify the authentication token
    db.findOne({ username, authToken})
        .then(user => {
            if (!user) {
                return res.status(401).send({ error: 'Unauthorized.' });
            }
            //update user data
            db.updateOne({ username }, { $set: req.body })
            .then(numUpdated => {
                if (numUpdated === 1) {
                    res.send({ ok: true });
                } else {
                    res.status(500).send({ error: 'Something went wrong.' });
                }
            })
        })
        .catch(error => {
            res.status(500).send({ error: 'Internal server error.' });
        });
});

//route to delete user doc
app.delete('/users/:username/:authToken', (req, res) => {
    const { username, authToken } = req.params;

    // verify the authentication token
    db.findOne({ username, authToken })
        .then(user => {
            if (!user) {
                console.log('here')
                return res.status(401).send({ error: 'Unauthorized.' });     
            }
            // delete user data
            db.deleteOne({ username }, { $set: req.body })
            .then(numDeleted => {
                console.log('here!',numDeleted)
                if (numDeleted === 1) {
                    res.send({ ok: true });
                } else {
                    res.status(500).send({ error: 'Something went wrong.' });
                }
            })
        })
        .catch(error => {
            console.log('here?',error)
            res.status(500).send({ error: 'Internal server error.' });
        });
});

//route to handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.findOne({ username })
        .then(user => {
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.status(401).send({ error: 'Invalid username or password.' });
            }
            
            const authToken = generateAuthToken();
            
            db.updateOne({ username }, { $set: { authToken } })
                .then(() => res.send({ authToken, user: { username: user.username, name: user.name, email: user.email } }))
                .catch(err => res.status(500).send({ error: 'Internal server error.' }));
        })
        .catch(err => res.status(500).send({ error: 'Internal server error.' }));
});

//default route
app.all('*', (req, res) => {res.status(404).send('Invalid URL.');});

//start server
app.listen(3000, () => console.log("Server started on http://localhost:3000"));