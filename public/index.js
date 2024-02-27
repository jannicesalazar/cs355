
const express = require('express');
const app = express();

// Function to generate a random integer
const randInt = n => Math.floor(n * Math.random());

// Function to get a random item from an array
const getRandomItemFromArray = arr => arr[randInt(arr.length)];

// Sample data for breeds and images
const breeds = ['portuguese water dog', 'dalmatian', 'bulldog'];
const breedImages = {
    'portuguese water dog': ['pwd.jpeg', 'pwd2.jpeg', 'pwd3.jpeg'],
    'dalmatian': ['dd.jpeg', 'dd2.jpeg', 'dd3.jpeg'],
    'bulldog': ['bd.jpeg', 'bd2.jpeg', 'bd3.jpeg']
};

// Route to get a list of breeds
app.get('/breeds', (req, res) => {
    res.json(breeds);
});

// Route to get a random image for a breed
app.get('/img/:breed', (req, res) => {
    const breed = req.params.breed.toLowerCase();
    const images = breedImages[breed];
    if (images) {
        const imageName = getRandomItemFromArray(images);
        res.sendFile(`${__dirname}/public/img/${imageName}`);
    } else {
        res.status(404).send('Breed not found');
    }
});

// Route to serve static files from the public folder
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});