function myfunction() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}
const $ = document.querySelector.bind(document);

$('#darkBtn').addEventListener('click',toggleDark)

function toggleDark(){

    if($(':root').hasAttribute('dark-mode')){
        $(':root').removeAttribute('dark-mode');
    }else{
        $(':root').setAttribute('dark-mode',true);
    }
}
