'use strict'

function darkmode(){
    var SetTheme = document.body;
    SetTheme.classList.toggle("dark-mode")
    var theme;
    if(SetTheme.classList.contains("dark-mode")){
        console.log("Dark mode");
        theme = "DARK";
    }else{
        console.log("Light mode");
        theme = "LIGHT";
    }
    // save to localStorage
    localStorage.setItem("PageTheme", JSON.stringify(theme));
}

setInterval(() => {
    let GetTheme = JSON.parse(localStorage.getItem("PageTheme")); // get from localStorage
    console.log(GetTheme);
    if (GetTheme === "DARK") { 
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}, 5);