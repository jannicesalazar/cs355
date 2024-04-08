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
app.get('/users', async (req, res) => {
    try {
        const users = await db.find({});
        res.send(users);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error.' });
    }
});

//route to get user record by username
app.get('/users/:username', async (req, res) => {
    try {
        const user = await db.findOne({ username: req.params.username });
        if (user) {
            res.send(user);
        } else {
            res.status(404).send({ error: 'Username not found.' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Internal server error.' });
    }
});

//route to register user
app.post('/register', async (req, res) => {
    try {
        const { username, password, email, name } = req.body;
        //validate input fields
        if (!username || !password || !email || !name) {
            return res.status(400).send({ error: 'Missing fields.' });
        }

        //check if username already exists
        const existingUser = await db.findOne({ username });
        if (existingUser) {
            return res.status(400).send({ error: 'Username already exists.' });
        }

        //hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);
        // Generate authentication token
        const authToken = generateAuthToken();

        //create new user object
        const newUser = {
            username,
            password: hashedPassword,
            email,
            name,
            authToken
        };

        //insert new user into the database
        const insertedUser = await db.insertOne(newUser);
        //send back authentication token
        res.send({ auth: authToken });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

//route to update user doc
app.patch('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { authToken, newData } = req.body;

        //verify the authentication token
        const user = await db.findOne({ username, authToken });
        if (!user) {
            return res.status(401).send({ error: 'Unauthorized.' });
        }

        //update user data
        const numUpdated = await db.updateOne({ username }, { $set: newData });
        if (numUpdated === 1) {
            res.send({ ok: true });
        } else {
            res.status(500).send({ error: 'Something went wrong.' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Internal server error.' });
    }
});

//route to delete user doc
app.delete('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { authToken } = req.body;

        //verify the authentication token
        const user = await db.findOne({ username, authToken });
        if (!user) {
            return res.status(401).send({ error: 'Unauthorized.' });
        }

        //delete user data
        const numDeleted = await db.deleteOne({ username });
        if (numDeleted === 1) {
            res.send({ ok: true });
        } else {
            res.status(500).send({ error: 'Something went wrong.' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Internal server error.' });
    }
});


//route to handle user login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.findOne({ username });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).send({ error: 'Invalid username or password.' });
        }

        const authToken = generateAuthToken();
        await db.updateOne({ username }, { $set: { authToken } });
        return res.send({ auth: authToken });
    } catch (error) {
        res.status(500).send({ error: 'Internal server error.' });
    }
});

//default route
app.all('*', (req, res) => {
    res.status(404).send('Invalid URL.');
});

//start server
app.listen(3000, () => console.log("Server started on http://localhost:3000"));