const breedInput = document.getElementById('breed-input'); //input
const imageButton = document.getElementById('show-images-btn'); //button
const imageContainer = document.getElementById('breed-images'); //container for images

breedInput.addEventListener('input', async () => {
    const breed = breedInput.value.trim();
    //if breed input is empty, exit the function
    if (breed.length === 0) return;
    
    //API to get a list of all dog breeds
    const response = await fetch(`https://dog.ceo/api/breeds/list/all`);
    //parse response as JSON
    const data = await response.json();
    //get names
    const breeds = Object.keys(data.message);
    
    //filters names based off of input
    const filteredBreeds = breeds.filter(b => b.startsWith(breed));
    
    if (filteredBreeds.length > 0) {
        breedInput.autocomplete = 'off'; 
        breedInput.setAttribute('list', 'breed-suggestions'); //make list breed input
        const datalist = document.createElement('datalist'); 
        datalist.id = 'breed-suggestions';
        filteredBreeds.forEach(b => {
            const option = document.createElement('option'); //create option
            option.value = b; 
            datalist.appendChild(option); // Append option to the datalist
        });
        //inserts datalist before the breed input field
        breedInput.parentNode.insertBefore(datalist, breedInput.nextSibling);
    } else {
        //if theres no filtered breeds, remove the datalist and autocomplete attribute
        breedInput.removeAttribute('list');
        breedInput.removeAttribute('autocomplete');
    }
});

imageButton.addEventListener('click', async () => {
    const breed = breedInput.value.trim();
    //if breed input is empty, exit the function
    if (breed.length === 0) return;

    const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random/5`);
    //parse the response as JSON
    const data = await response.json();
    
    //display the images
    if (data.status === 'success') {
        imageContainer.innerHTML = '';
        data.message.forEach(imgUrl => {
            const img = document.createElement('img'); //create an img 
            img.src = imgUrl; //set the src attribute for the img
            imageContainer.appendChild(img); //appends image to the container
        });} 
    else {
        //display an error message 
        imageContainer.innerHTML = 'No such breed';
    }
});
