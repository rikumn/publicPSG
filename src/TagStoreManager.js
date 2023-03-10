let version = '0.0.3';

let TagOffer = [
    //[100,300],
    //[200,550],
    //[600,1350]
]

async function GameDataSet(){
    let version_ = await GAME.getGameVersion()
    version_ = version_[0].split(' ')[2];
    if (version_ == version)
    {
        //CreateUI()
    }
    else{
        document.getElementById('refresh').setAttribute('open',null);
    }
    //load store
}

async function BuyTagOffer(indx){
    // tiene rodos? 
    document.getElementById('btn_offer'+indx).setAttribute('disabled',true);
    if (TagOffer[indx][1] < GAME.user.balance){
        GAME.user.tagsq += TagOffer[indx][0];
        GAME.user.balance -= TagOffer[indx][1];

        var formulario = new FormData();
        formulario.append("usuario", '"'+GAME.user.ID+'"');
        formulario.append("data", GAME.user.tagsq);
        await fetch("SetTagsQ.php", { method:"POST", body: formulario })

        var formulario = new FormData();
        formulario.append("usuario", GAME.user.ID);
        formulario.append("rodos", GAME.user.balance);
        await fetch("SetRodos.php", { method:"POST", body: formulario })
    }
    document.getElementById('btn_offer'+indx).removeAttribute('disabled');
    GAME.UpdateBalanceUI();
    GAME.updateTagsQUI();
}


function CreateUI(){
    document.getElementById('showcase').innerHTML = '';
    for (let i = 0; i < TagOffer.length; i++) {
        const element = TagOffer[i];
        document.getElementById('showcase').innerHTML += 
        `<div class="wall-shelf">
            <img src="assets/objects/label-box_${element[0]}.png" alt="label-box">
            <button id = "btn_offer${i}" class="hlight" onclick = 'BuyTagOffer(${i})'>
                <i class="icon-rodo_coin"></i> ${element[1]}
                <i class="material-icons">shopping_cart</i>
            </button>
        </div>
        `
    }
    document.getElementsByClassName('end')[0].setAttribute('onclick','location.href = "day-end.html"')
}
