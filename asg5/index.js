const express = require('express');
const Datastore = require('nedb-promises');
const path = require('path');

const app = express();
const port = 3000;

const db = Datastore.create({ filename: 'hits.jsonl', autoload: true }); //initialize the hit counter

db.findOne({ hits: { $exists: true } }) //variable to store the hit count
  .then(doc => {
    if (doc) { //if the document exists, get the hit count
      hits = doc.hits;
    } else {
      hits = 0; //if the document does not exist, set the hit count to 0
      return db.insert({ hits });
    }
  })
  .catch(err => console.error(err)); //catch any errors

app.use('/hits', async (req, res, next) => { //middleware to update the hit count
  try {
    hits++; //increment the hit count
    await db.update({ hits: { $exists: true } }, { hits }, { upsert: true }); //update the hit count in the database
    next();
  } catch (err) { //catch any errors
    next(err);
  }
});

app.get('/hits', (req, res) => { //route to get the hit count
  res.send(`${hits}`);
});

app.use(express.static(path.join(__dirname, 'static'))); //serve static files

app.listen(port, () => { //listen on port 3000
  console.log(`Server running at http://localhost:${port}`);
});