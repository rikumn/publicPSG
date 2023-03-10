//const serverUrl = "https://kkytaxmnf4kv.usemoralis.com:2053/server";
//const appId = "xFS6Gh9Pu1YSW4iCjo6ZMXnpOe4AIuWZbc3SAASJ";
const serverUrl = "https://dh47bvzvhjll.usemoralis.com:2053/server"
const appId = "WgOFfm4qUQtQK9l1c5vjrNP4OYqj0IUulSwGHJLi";
Moralis.start({ serverUrl, appId });
Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

/*const chainToQuery = 'bsc testnet'

if (Moralis.Web3.User.current()){
    deactivateLoginBtn();
}

async function logout() {
    await Moralis.User.logOut();
    //console.log("logged out");
    location.reload(true);
}

async function login(){
    Moralis.Web3.authenticate().then(function(user){
        user.save();
        createuser(user);
        deactivateLoginBtn();
        //Muestresustokens();
    })
}*/

//Funcional¿?
function deactivateLoginBtn(){
    if (document.getElementById('login')){
        document.getElementById('login').setAttribute("disabled",true);
     document.getElementById('login').setAttribute("readonly",true);
     
     document.getElementById('logout').removeAttribute("readonly");
     document.getElementById('logout').removeAttribute("disabled");
     if (typeof Indexlogged === "function") Indexlogged(window.GAME);
    }
}

/*
async function createuser(user){
    window.GAME.setUser(user.attributes.ethAddress);
}
*/
