//FlameBlue 21:32 / 18.03.2022
let version = '0.0.3';
let selected_potion = null;
let potions_id_seq = [];
//moved to PotionInventory
//let tagActive = false;

async function GameDataSet(){
    if (await GAME.CanBuy()) {
        window.location.replace("ingredients.html");
        return;
    }
    await GAME.CanMake().then(CheckDay);
}

async function CheckDay(value){
    if (!value)
    {
        if (await GAME.CanSell()) {
            window.location.replace("plaza.html");
        } else {
           window.location.replace("day-end.html");
        }
    }
    else
    {
        let version_ = await GAME.getGameVersion()
        version_ = version_[0].split(' ')[2]
        if (version_ == version)
        {
            let cauldrons__ = await GAME.getMaxPotionCanMake()
            if (cauldrons__ == 0) {
                window.alert('You cannot play if you do not have cauldrons in game')
                return;
            }
            for (let i = 0; i < GAME.user.potion_inventory.items_seq.length; i++) {
                const element = GAME.user.potion_inventory.items_seq[i];
                if (element)
                {
                    potions_id_seq[i] = GAME.user.potion_inventory.potionsInfo[i][0];
                }
            }
            CreateUI();
        }else{
            document.getElementById('refresh').setAttribute('open',null);
        }
    }
}

//var q_potion_made = 0; //ahora esta en PotionInventor

function UpdatePanel(index){
    
    var pocion = window.GAME.GLOBALPOTIONS[index];
    var panel = document.getElementsByClassName("row up")[0];
    console.log(panel);
    for (let i = 0; i < document.getElementsByClassName("RecetaryPotion").length; i++) {
        const element = document.getElementsByClassName("RecetaryPotion")[i];
        if (index == i) element.classList.add('active')
        else element.classList.remove('active')
    }
    //titulo
    panel.querySelector("div.name.title").innerHTML = pocion.tittle
    //img
    let ima = pocion.tittle.toLowerCase().split(' ')
    if (ima.length > 1) ima[1] = ima[1].charAt(0).toUpperCase() + ima[1].slice(1) 
    if (ima.length > 2) ima[2] = ima[2].charAt(0).toUpperCase() + ima[2].slice(1) 
    var name_image = ima.join('');
    panel.querySelector("img").setAttribute("src","assets/potions/p_basic_"+name_image +".png");
    //Quantity
    panel.querySelector("div.info").innerHTML = GAME.user.potion_inventory.items[index] == undefined ? 0:GAME.user.potion_inventory.items[index]
    //tag
    panel.querySelector('span').setAttribute('style',GAME.user.potion_inventory.tagActive ? 'display:flex' : 'display:none');
    // boton 
    var ingredientes_pocion = pocion.ingredients;
    //var ingrient_list_ui = document.getElementsByClassName("r-ingredients")[0];
    var page = panel.querySelector("div.row.items.small");
    //ingrient_list_ui.innerHTML = " ";
    page.innerHTML = " ";
    for (let i = 0; i < ingredientes_pocion.length; i++) {
        //Variables
        // [id, cant]
        const par_info_ingre = ingredientes_pocion[i];
        //item ingrediente
        var item = window.GAME.GLOBALITEMS[par_info_ingre[0]]
        // cantidad de ingredientes
        var q_user_item = window.GAME.user.ingredient_inventory.items[par_info_ingre[0]];
        // nombre de la imagen del ingrediente
        var image_name = item.tittle.toLowerCase().replaceAll(" ",'-').replace("'s","");
        // ingrediente texto lista ui
        //ingrient_list_ui.innerHTML += `<li><span>`+ par_info_ingre[1]+`</span> <span>`+ item.tittle +`</span> <img src="assets/ingredients/i_`+ image_name +`.png" alt="item"></li>`;
        // pagina de imagenes de ingredientes
        page.innerHTML +=`
         <div class="item PotionIngerdient">
            <div class="name title">`+ item.tittle +`</div>
            <img src="assets/ingredients/i_`+ image_name +`.png" alt="ingredient" />
            <div class="out">`+ par_info_ingre[1]+`</div>
         </div>
         `;
    }
    document.getElementById("prepare").setAttribute("onclick","CreatePotion("+ index+")");
    document.getElementById("prepare").innerHTML = pocion.tittle
    document.getElementsByClassName("end")[0].setAttribute("onclick","FinishPreparation()");
    CheckBtns(index);
    UpdateUI();
    //GAME.user.potion_inventory.UpdateBoard()
    UpdateMovableBoard()
}

let flag = false;
async function CreatePotion(index){
    document.getElementById("prepare").setAttribute("disabled",null);
    document.getElementById("prepare").setAttribute("readonly",null);
    
    if (!flag) {
        flag = true;
    }else{
        return
    }
    
    let cauldrons__ = await GAME.getMaxPotionCanMake()
    if (cauldrons__ == 0) {
        window.alert('You cannot play if you do not have cauldrons in game')
        return;
    }

    if (!await GAME.user.potion_inventory.CheckingAvailableToMake(index)) return;
     /*
    //console.log(index + " " +q)
    
    for (let i = 0; i < window.GAME.GLOBALPOTIONS[index].ingredients.length; i++) {
        const pair = window.GAME.GLOBALPOTIONS[index].ingredients[i];
        window.GAME.user.ingredient_inventory.RemoveItem(pair[0],pair[1]);
    }
    */
    
    let continuar = await window.GAME.user.potion_inventory.AddItem(index);
    if (continuar)
    {
        let new_elemnt = document.getElementsByClassName('book').potions.getElementsByClassName('item')[index].getElementsByClassName('new')[0]
        if (new_elemnt){
            let actual_q = parseInt(new_elemnt.innerHTML.split(' ')[0]) + 1 
            new_elemnt.innerHTML =actual_q+' NEW'
            new_elemnt.style.display = 'flex'
        }
        UpdateMovableBoard();
        /* ↓ Move to Potion Inventory as this should be also process when creating a potion in the inventory
        var magg = await GAME.user.potion_inventory.PowerPotion(index)
        GAME.purchased_potions.push([index + 1, magg, continuar]); //await SetPocionesMagicPower(index + 1, await PowerPotion(index), -1)
        GAME.user.magic_power += magg;
        GAME.updateMagicPowerUI();*/

        //window.GAME.SendInfoDB();
        ///q_potion_made+=1; //ahora esta en PotionInventor
        //UpdateUI();
        //UpdatePanel(index);
    }
    flag =false;
}

function ActivateTag(){
    if (GAME.user.potion_inventory.tagActive){
        document.getElementById('btn-etiquette').setAttribute('style','filter:brightness(75%)');
        GAME.user.potion_inventory.tagActive = false;
    }else{
        if (GAME.user.tagsq > 0){
            GAME.user.potion_inventory.tagActive = true;
            document.getElementById('btn-etiquette').removeAttribute('style')
        }
    }
    document.getElementsByClassName("row up")[0].querySelector('span').setAttribute('style',GAME.user.potion_inventory.tagActive ? 'display:flex' : 'display:none');
}

function CreateUI(){
    GAME.purchased_potions.length = 0;
    var arreglos = document.getElementsByClassName("row items parch")[0];
    arreglos.innerHTML = " ";
     //Esta es la cracion de los items de tienda
    for (let i = 0; i < window.GAME.GLOBALPOTIONS.length; i++) {
        const item = window.GAME.GLOBALPOTIONS[i];
        //var q_user_item = window.GAME.user.potion_inventory.items[i] == undefined ? 0 : window.GAME.user.potion_inventory.items[i]
        let ima = item.tittle.toLowerCase().split(' ')
        if (ima.length > 1) ima[1] = ima[1].charAt(0).toUpperCase() + ima[1].slice(1) 
        if (ima.length > 2) ima[2] = ima[2].charAt(0).toUpperCase() + ima[2].slice(1) 
        var name_image = ima.join('');
        //console.log(name_image)
        arreglos.innerHTML += ` <div class="btn item row RecetaryPotion" onclick = "UpdatePanel(`+ i +`)">
                                <img src="assets/potions/p_basic_`+name_image +`.png" alt="potion" />
                                <div class="name">`+ item.tittle +`</div>
                                </div>
                            `;
    }
    document.getElementById('btn-etiquette').setAttribute('onclick','ActivateTag()')
    GAME.user.tagActive = true;
    ActivateTag();
    //UpdateUI();
    UpdatePanel(0);
}

async function CheckBtns(index){
    document.getElementById("prepare").setAttribute("disabled",null);
    document.getElementById("prepare").setAttribute("readonly",null);
    
    if (await GAME.user.potion_inventory.CheckingAvailableToMake(index)){
        document.getElementById("prepare").removeAttribute("disabled");
        document.getElementById("prepare").removeAttribute("readonly");
    }

    /**menos
     * se desactivara cuando la cantidad es 1 
     * se activara cuando la cantidad es mayor que uno
     * 
     * mas 
     * se desactivara cuando no se pueda crear mas que esa cantidads
     * se activara si se puede crear mas
     * 
     * max 
     * se desactiva si no se puede crear mas
     * se activa si se puede crear mas
     */
}

function UpdateUI(){
    for (let i = 0; i < document.getElementsByClassName("RecetaryPotion").length; i++) {
        const element = document.getElementsByClassName("RecetaryPotion")[i];
        var q = window.GAME.user.potion_inventory.items[i]
        //console.log(window.GAME.user.potion_inventory);
        //console.log(q);
        q = !q ? 0 :q;
        element.setAttribute("data-q",q == 0 ? "-":q);
        //element.childNodes[1].innerHTML = q;
        //console.log(element.childNodes);
    }
}

/*
async function CheckingAvailableToMake(index,quantity = 1){
    let q_potion = await GAME.getMaxPotionCanMake()
    if (q_potion_made < 0) return
    document.getElementsByClassName("center")[0].querySelector("span.dat").innerHTML = q_potion - q_potion_made;
    if ((q_potion - (q_potion_made + quantity)) < 0){
        return false
    }
    for (let i = 0; i < window.GAME.GLOBALPOTIONS[index].ingredients.length; i++) {
        const pair = window.GAME.GLOBALPOTIONS[index].ingredients[i];
        if (window.GAME.user.ingredient_inventory.items[pair[0]] < (pair[1] * quantity))
            return false;
    }
    return true;
}
*/

async function FinishPreparation(){
    //console.log("Finishing preparation...");
    document.getElementById('dialog').setAttribute('open','null');
    //window.GAME.FinishMakePotionsDays(OnComplete,OnError);
    //console.log(GAME.purchased_potions.length < await GAME.getMaxPotionCanMake())
    //console.log(GAME.purchased_potions.length)
    //console.log(await GAME.getMaxPotionCanMake())
    let securitty = await GAME.CanMake() && (GAME.purchased_potions.length <= await GAME.getMaxPotionCanMake())
    if (!securitty) {
        location.reload(!0);
    }else{
        //await SetUserDataInDB(GAME.EncodeToLineInventory());
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        formulario.append("data", GAME.EncodeToLineInventory());
        await fetch("SetMakePotion.php", { method:"POST", body: formulario });

        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        formulario.append("PurchasedPotions", PurchasedPotionsLine());
        await fetch("SetPocionesMagicPower.php",{ method:"POST", body: formulario })
        .then(function(response){
            if (response.status >= 200 && response.status < 300) {
                return response.text();
            }
        })
        .then(function(_getData){
           console.log(_getData);
        });
        //console.log(">>>"+formulario.get("usuario"));
        //console.log(">>>"+formulario.get("PurchasedPotions"));

        //await GAME.user.potion_inventory.SetPotionSeq();
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        formulario.append("data", GAME.user.potion_inventory.items_seq.join(';'));
        await fetch("SetPotionSeq.php", { method:"POST", body: formulario });

        GAME.purchased_potions.length = 0;
        //await this.FinishPreparationDay();
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        await fetch("SetCanMake.php", { method:"POST", body: formulario });
        //console.log(">>>"+formulario.get("usuario"));

        //await SetMagicPower()
        var formulario = new FormData();
        formulario.append("usuario",GAME.user.ID);
        formulario.append("data",GAME.user.magic_power);
        await fetch("SetMagicPower.php", { method:"POST", body: formulario });

        var formulario = new FormData();
        formulario.append("usuario", GAME.user.ID);
        formulario.append("data", GAME.user.tagsq);
        await fetch("SetTagsQ.php", { method:"POST", body: formulario })

        var formulario = new FormData();
        let val = CompareMaskWihtOgPotionPos()
        formulario.append("data", val.join(';'));
        await fetch("SetPotionsPosInMagicPower.php", { method:"POST", body: formulario })
        
        //await OnComplete();
        document.getElementById('dialog').removeAttribute('open');
        window.location.replace("plaza.html");
    }
    
}

//Added to FinishPreparation
/*
async function FinishPreparationDay(){//Setea CanBuy
    console.log("INGRESA A FINISH Preparation DAY");
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    //formulario.append("TS", data);
    await fetch("SetCanMake.php",
    {
        method:"POST",
        body: formulario
    });
    console.log(">>>"+formulario.get("usuario"));
    //console.log(">>>"+formulario.get("TS"));
}*/

function PurchasedPotionsLine()
{
    var line = "";
    for (let i = 0; i < GAME.purchased_potions.length; i++) {
        line += GAME.purchased_potions[i][0] + "," + GAME.purchased_potions[i][1] + "," + GAME.purchased_potions[i][2]+ "," + GAME.purchased_potions[i][3];
        if (i < GAME.purchased_potions.length - 1) { line += ";"; }
    }
    return line;
}

function UpdateMovableBoard(indx = -1){
    let leinvatario = GAME.user.potion_inventory;

    leinvatario.page_index = indx == -1 ? leinvatario.page_index : indx
    let boards = document.getElementsByClassName("board")
    if (boards[0]){
        let board = boards[0]
        board.innerHTML = ""
        //hacer que si page_index = 0 primeros 0 - 81 [a*81 - (a+1)*81] 
        //hacer que si page_index = 1 primeros 81 - 162
        for (let i = leinvatario.page_index * leinvatario.max_per_page_board; i < (leinvatario.page_index + 1) * leinvatario.max_per_page_board; i++) {
            let nam = "b_"
            if ( GAME.user.potion_inventory.items_seq[i] != undefined){
                let id__ = GAME.user.potion_inventory.items_seq[i][0];
                const element = GAME.GLOBALPOTIONS[id__];
                nam += element.tittle[0].toLowerCase()
                if (id__ == 5) nam += 's'
                else if (id__ == 4) nam += 'h'
                else nam += element.tittle.split(' ')[1][0]
            }
            else{
                nam = "empty"
            }
            var is_new = false;
            for (let j = 0; j < GAME.purchased_potions.length; j++) {
                if (GAME.purchased_potions[j][2] == i) {
                    is_new = true;
                    break;
                }
            }
            board.innerHTML += `<div class=${nam} onclick = "SelectPositionPotion(${i})">${(nam != 'empty' && GAME.user.potion_inventory.items_seq[i][2]) ?  `<span class="mpwr">${ is_new ? '?' :  GAME.user.potion_inventory.items_seq[i][1].toFixed(0)}</span>` : ''}</div>`;
        }
    }
    if ( document.getElementById('board-pag')){
        let nav_board = document.getElementById('board-pag').getElementsByClassName('row')[0]
        let prev = document.getElementById('board-pag').getElementsByClassName('icon-prev')[0]
        let next = document.getElementById('next')
        let q_pag_potions = Math.ceil(GAME.user.potion_inventory.items_seq.length / GAME.user.potion_inventory.max_per_page_board)
        console.log(q_pag_potions);
        nav_board.innerHTML = ''
        for (let i = 0; i < q_pag_potions; i++) {
            nav_board.innerHTML += `<button class="icon ${leinvatario.page_index == i ? 'active' : ''}" onclick = "UpdateMovableBoard(${i})" >${i+1}</button>`
        } 

        document.getElementById('board-pag').setAttribute('data-qpages',`${q_pag_potions}`)
        if (leinvatario.page_index == q_pag_potions - 1) document.getElementById('board-pag').setAttribute('data-currpage',`-1`)
        else if (leinvatario.page_index == 0) document.getElementById('board-pag').setAttribute('data-currpage',`1`)
        else document.getElementById('board-pag').setAttribute('data-currpage',`0`)

        prev.removeAttribute('onclick')
        next.removeAttribute('onclick')
        if (leinvatario.page_index > 0){
            prev.setAttribute('onclick',`UpdateMovableBoard(${leinvatario.page_index -1})`)
        }
        if (q_pag_potions > leinvatario.page_index +1 ){
            next.setAttribute('onclick',`UpdateMovableBoard(${leinvatario.page_index +1})`)
        }
    }
    
}

function SelectPositionPotion(index){
    let selected_potion_now= [,,index,];
    if (GAME.user.potion_inventory.items_seq[index]){
        selected_potion_now = [GAME.user.potion_inventory.items_seq[index][0],GAME.user.potion_inventory.items_seq[index][1],index,GAME.user.potion_inventory.items_seq[index][2]]
    }

    //no te olvide hacer tmb el cambio en DB
    if (selected_potion != null){
        // if la pocion que estoy mcabiando de posicion es recein cread esdecir esta en purchased potions
        // si esque la psocion purchased
        //console.log(index)
        //console.log(selected_potion[2])
        if (index != selected_potion[2]){
            let aux = selected_potion;        
            GAME.user.potion_inventory.items_seq[selected_potion[2]] = GAME.user.potion_inventory.items_seq[index];
            if (selected_potion[1]){
                GAME.user.potion_inventory.items_seq[index] = [aux[0],aux[1],aux[3]];
            }else{
                GAME.user.potion_inventory.items_seq[index] = null;
            }
            ChangePosInMask(selected_potion[2], index)
        }        
        selected_potion = null;
        //console.log(GAME.user.potion_inventory.pocionesMagicPower_updated)
        UpdateMovableBoard() 
    }else{
        let ui_index = index - (GAME.user.potion_inventory.page_index * GAME.user.potion_inventory.max_per_page_board);
        document.getElementsByClassName("board")[0].querySelectorAll('div')[ui_index].classList.add('light-magic')
        selected_potion = selected_potion_now
    }
}

function ChangePosInMask(pos1, pos2){
    let aux = potions_id_seq[pos2];
    potions_id_seq[pos2] = potions_id_seq[pos1];
    potions_id_seq[pos1] = aux;
    for (let i = 0; i < GAME.purchased_potions.length; i++) {
        if (pos1 == GAME.purchased_potions[i][2]){
            GAME.purchased_potions[i][2] = pos2;
        }
        else if (pos2 == GAME.purchased_potions[i][2]){
            GAME.purchased_potions[i][2] = pos1;
        }
    }
}

function CompareMaskWihtOgPotionPos(){
    let inf = [];
    for (let i = 0; i < potions_id_seq.length; i++) {
        if ( potions_id_seq[i] && potions_id_seq[i] != (GAME.user.potion_inventory.potionsInfo[i] ? GAME.user.potion_inventory.potionsInfo[i][0] : false ))
        {
            inf.push([potions_id_seq[i],i,1]);
        }
    }
    return inf;
}

/*
//IDPociones	IDUsuario	TipoPocion	Power	Posicion	Estado	
async function SetPocionesMagicPower(TipoPocion, Power, Posicion){
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("TipoPocion", TipoPocion);
    formulario.append("Power", Power);
    formulario.append("Posicion", Posicion);
    await fetch("SetPocionesMagicPower.php",
    {
        method:"POST",
        body: formulario
    });
    console.log(">>>"+formulario.get("usuario"));
    console.log(">>>"+formulario.get("TipoPocion"));
    console.log(">>>"+formulario.get("Power"));
    console.log(">>>"+formulario.get("Posicion"));
}
*/

/*
async function SetUserDataInDB(data){
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    if (data == "null"){
        formulario.append("data","null");
    }
    else
    {
        formulario.append("data", data);
    }
    //cambiar este setdata por SetDataInGame.PHP seguridad no se crean usuarios nuevos dentro del juego
    await fetch("SetMakePotion.php",
    {
        method:"POST",
        body: formulario
    });
    //console.log(">>>"+formulario.get("usuario"));
    //console.log(">>>"+formulario.get("data"));
}  
*/

/*
async function OnComplete(){
    //console.log("Finish preparation!");
    document.getElementById('dialog').removeAttribute('open');
    await GAME.user.potion_inventory.SetPotionSeq().then(function (){
        //console.log("termine <3")
        window.location.replace("plaza.html");
        //SetPotionSeq()
    })
}
*/

//precio actual
//precio DB


function OnError(){
    console.log("Error preparation!");
    location.reload(true);
}

//recetario donde muestra recetas de pociones
//   se muestra la cantidad e ingredientes necesarioa de cada pocion
//   boton para crear pocion [que se activa si posees los requesitos]
//inventario pociones
// al crear una pocion se aumenta uno en su inventario

//clase caldero 
// consume ingredientes y agrega en inventario

//boton que consume los ingredientes
