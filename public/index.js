const express = require('express');
const app = express();

// generates random integer
const randInt = n => Math.floor(n * Math.random());

// gets random item from an array
const getRandomItemFromArray = arr => arr[randInt(arr.length)];

// list of breeds and images
const breeds = ['portuguese water dog', 'dalmatian', 'bulldog'];
const breedImages = {
    'portuguese water dog': ['pwd.jpeg', 'pwd2.jpeg', 'pwd3.jpeg'],
    'dalmatian': ['dd.jpeg', 'dd2.jpeg', 'dd3.jpeg'],
    'bulldog': ['bd.jpeg', 'bd2.jpeg', 'bd3.jpeg']
};

// list of breeds
app.get('/breeds', (req, res) => {
    res.json(breeds);
});

// random image for a breed
app.get('/image/:breed', (req, res) => {
    let thebreed = req.params.breed;
    const randInt = n => Math.floor(n * Math.random());
    const getRandomItemFromArray = arr => arr[randInt(arr.length)];
    const imagePath = "img/" + getRandomItemFromArray(breedImages[thebreed]);

    res.send({ message: imagePath });
});

//serve static files from the public folder
app.use(express.static('public'));

//start 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


