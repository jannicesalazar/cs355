const params = new URLSearchParams(location.search) ; 
console.log( params.get('docid') );
console.log( params.get('hl') );