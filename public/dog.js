const breedInput = document.getElementById('breed-input'); //input
const imageButton = document.getElementById('show-images-btn'); //button
const imageContainer = document.getElementById('breed-images'); //container for images

breedInput.addEventListener('input', async () => {
    const breed = breedInput.value.trim();
    //if breed input is empty, exit the function
    if (breed.length === 0) return;
    
    //fecth breeds
    const response = await fetch(`/breeds`);
    //parse response as JSON
    const breeds = await response.json();
    
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
            datalist.appendChild(option); //append option to the datalist
        });
        //inserts datalist before the breed input field
        breedInput.parentNode.insertBefore(datalist, breedInput.nextSibling);
    } else {
        //if theres no filtered breeds, remove the datalist and autocomplete attribute
        breedInput.removeAttribute('list');
        breedInput.removeAttribute('autocomplete');
    }
});

//when button is clicked
imageButton.addEventListener('click', async () => {
    const breed = breedInput.value.trim().toLowerCase(); //get breed input
    if (breed == "") {
        imageContainer.innerHTML = "No Breed Selected"; //if no breed is selected, display message
    }
    else {
        url = "http://localhost:3000/image/" + breed //get image for breed
        fetch(url)      
            .then(r => r.json()) //parse response as JSON
            .then(data => { //display image
                console.log(data); 
                if (data.status == "error") {
                   imageContainer.innerHTML = "Breed not found";
                }
                else {
                    imageContainer.innerHTML = "<img src='" + data.message + "'>";
                }
            });
    }
});