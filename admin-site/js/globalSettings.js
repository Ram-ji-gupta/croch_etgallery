async function loadGlobalSettings(){

try{

const response =
await fetch(
AdminConfig.api("/api/settings")
);

const settings =
await response.json();

const title =
document.getElementById(
"storeTitle"
);

if(title){

title.innerHTML =
"🧶 " +
settings.store_name;

}

}
catch(error){

console.log(error);

}

}

loadGlobalSettings();