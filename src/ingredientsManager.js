//Ingredients Manager 28/04 22.30
let version = '0.0.3';
var aux_balance_init;
var list_stores = [];
var auxIngredientsArray = [];

async function GameDataSet(){
    aux_balance_init = GAME.user.balance;
    await GAME.CanBuy().then(CheckDay);
}

async function CheckDay(value){
    if (!value)
    {
        if (await GAME.CanMake()){
            window.location.replace("potions.html");
        }else if(await GAME.CanSell()){
            window.location.replace("plaza.html");
        }else{
         window.location.replace("day-end.html");
        }
        
    }
    else
    {
        let version_ = await GAME.getGameVersion()
        version_ = version_[0].split(' ')[2];
        if (version_ == version)
        {
            await GetQSeller();
        }
        else{
            document.getElementById('refresh').setAttribute('open',null);
        }
    }
}

async function GetQSeller(){
    await GAME.GetMagicPower();
    let q = await GAME.getGameVersion();
    GAME.q_seller = parseInt(q[1].split(' ')[1]) 
    GAME.q_client = parseInt(q[2].split(' ')[1]) 
    if( q[0].split(' ')[2] == '0.0.2'){
        await FetchListStore();
    }else{
        await fetch("GetBenefitSeq.php?usuario="+GAME.user.ID,{
            method:"GET",
        })
        .then(function(response){
            if (response.status >= 200 && response.status < 300) {
                return response.text();
            }
        })
        .then(await async function(_getData){
            if (_getData == 'no se encontro el usuario!') return;
    
            var benefits = _getData.split(',')
            if (benefits[0] == null|| benefits[0] == '') benefits.shift();
            //[null]
            var level = 0;
            for (let i = 0; i < GAME.level_limits.length; i++) {
                if (GAME.level_limits[i] < GAME.user.magic_power){
                    level = i + 1;
                }else{
                    break;
                }
            }
            if (level != benefits.length){
                if (level > benefits.length){
                    // se tiene qeu crear tanttos beneficios como cuanto de dieferncia hay
                    do {
                        let ben = '';
                        if (Math.random() > .5){
                            ben = 'c';
                        }else{
                            ben = 's';
                        }
                        benefits.push(ben);
                        //console.log(benefits)
                    } while (benefits.length < level)
                }else if (level < benefits.length){
                    // se tiene qeu quitar tanttos beneficios como cuanto de dieferncia hay
                    do {
                        benefits.pop()
                        //console.log(benefits)
                    } while (benefits.length > level)
                }
            }
            //console.log(benefits)
            var formulario = new FormData();
            formulario.append("usuario",'"'+GAME.user.ID+'"');
            formulario.append("data", `"${benefits.join(',')}"`);
            await fetch("SetBenefitSeq.php", { method:"POST", body: formulario });
    
            var addedS = 0
            var addedC = 0
            for (let i = 0; i < benefits.length; i++) {
                const benefit = benefits[i];
                if (benefit == 's') addedS++;
                if (benefit == 'c') addedC++;
            }
            
            ActivatePanelBenefit(addedS ,addedC)
            //console.log(addedS)
            GAME.q_seller += addedS;
            await FetchListStore();
        });
    }
    
}

function ActivatePanelBenefit(extraS, extraC){
    let panel = document.getElementsByClassName('transparent')[0]
    panel.setAttribute('open',null)
    let lightM = panel.getElementsByClassName('light-magic')[0]
    let lightS = panel.getElementsByClassName('light-magic')[1]
    let lightC = panel.getElementsByClassName('light-magic')[2]
    lightC.setAttribute('style','display:none;') 
    lightS.setAttribute('style','display:none;')

    var next_limite = 0;
    var level = 0;
    for (let i = 0; i < GAME.level_limits.length; i++) {
        if (GAME.level_limits[i] < GAME.user.magic_power){
            next_limite = GAME.level_limits[i+1];
            level = i+1;
        }else{
            break;
        }
    }
    if(GAME.user.magic_power >= GAME.level_limits[GAME.level_limits.length-1]){
        next_limite = GAME.user.magic_power;
    }
    var percent = ((100 *  GAME.user.magic_power)/next_limite)
    lightM.getElementsByClassName('dat')[0].innerHTML = GAME.user.magic_power;
    panel.getElementsByClassName('progress')[0].setAttribute('style',`width:${percent}%;`)
    panel.getElementsByClassName('big')[0].innerHTML = `You are at level ${level}!`
    //console.log("LEVEL: " + level);
    if (level > 0){
        if (extraC > 0){
            lightC.setAttribute('style','display:flex;') 
            lightC.querySelector('p').innerHTML = `${extraC} extra client(s) (${extraC + GAME.q_client} in total)`
        }
        if (extraS > 0){
            lightS.setAttribute('style','display:flex;')
            lightS.querySelector('p').innerHTML = `${extraS} extra seller(s) (${extraS + GAME.q_seller} in total)`
        }
    }else{
        panel.querySelectorAll('p')[1].innerHTML = 'No currently benefits'
    }
}

async function FetchStoreVisitedQuantity(){
    //var _getData = "";
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    await fetch("GetStoreQuantity.php", {
        method:"POST",
        body: formulario
    })
    .then(function(response){
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        }
    })
    .then(function(_getData){
        //console.log("how many clients left? = " + _getData);
        if (_getData == "" || _getData == "no se encontro el usuario!"){
        //    console.log(_getData);
        }else{
            //console.log("list_stores.length = " + list_stores.length);
         //   console.log("CONSOLE DATA: " + _getData);
            var numero = parseInt(_getData)
            list_stores.splice(0,GAME.q_seller - numero);
        }
    });
}

async function FetchListStore(){
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);

    await fetch("GetStoreList.php", {
        method:"POST",
        body: formulario
    })
    .then(function(response){
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        }
    })
    .then(async function(_getData){
        let cauldrons__ = await GAME.getMaxPotionCanMake()
        if (cauldrons__ == 0) {
            window.alert('You cannot buy ingredients if you do not have cauldrons in game')
            return;
        }

        if (_getData == "" || _getData == "no se encontro el usuario!"){
            //await SetListStorefromTemplates();
            let string_templates = await getTemplates()
            string_templates = string_templates.replaceAll('\r','')
            string_templates = string_templates.split('\n')
            list_stores = GAME.RandomsInArrayNonRepeting(string_templates,GAME.q_seller,1);
            
            //SetListStore();
            var formulario = new FormData();
            formulario.append("usuario", GAME.user.ID);
            formulario.append("array", list_stores.join(';'));
            await fetch("SetStoreList.php", { method:"POST", body: formulario });
        }
        else{
            list_stores = _getData.split(';');
        }
        await FetchStoreVisitedQuantity();
        GAME.items_sold.length = 0; //reiniciamos la variable que guarda las compras de ingredientes
        NextStore();
        if (list_stores.length == 0) { document.getElementsByClassName('end')[0].setAttribute("onclick","FinishGetIngredients()"); } //despues de NextStore()
        GAME.tienda.CreateUI();
        document.getElementById("next_seller").setAttribute("onclick" , "NextStoreButton()");
        //document.getElementById("next_seller").setAttribute("onclick" , "NextStore(); fillcompra_perday();");
        return _getData;
    });
}  

/*
async function SetListStorefromTemplates(){
    let string_templates = await getTemplates()
    string_templates = string_templates.replaceAll('\r','')
    string_templates = string_templates.split('\n')
    console.log()
    list_stores = GAME.RandomsInArrayNonRepeting(string_templates,q_seller);
    SetListStore();
}
*/

async function getTemplates(){
    return new Promise(function(myResolve, myReject) 
    { 
            fetch("getStoreTemplates.php",{
            method:"GET",
            })
            .then(function(response){
                if (response.status >= 200 && response.status < 300) {
                    return response.text();
                }
            })
            .then(function(_getData){
                myResolve(_getData);
            });
    });
}

/*
async function SetListStore(data){
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    if (data == "null"){
        formulario.append("array","null");
    }
    else
    {
        formulario.append("array",'"'+list_stores.join(';')+'"');
    }
    
    await fetch("SetStoreList.php",
    {
        method:"POST",
        body: formulario
    });
}  
*/

async function NextStoreButton(){
    
    document.getElementById('next_seller').setAttribute('disabled',true)
    let testIngredient = auxIngredientsArray[2];
    let tempIngredientsArray = auxIngredientsArray;
    //console.log("testingredient: " + testIngredient);
    //console.log("Aux Array: " + tempIngredientsArray);
    var success = await NextStore();


    if (success == "success")
    {

        var aux_pro = await fillcompra_perday();

        //await SetShopsToday(GAME.compra_perday) 
        var formulario = new FormData();
        formulario.append("usuario", GAME.user.ID); //formulario.append("usuario", await GAME.getCurrentAccount);
        formulario.append("array", GAME.compra_perday);
        await fetch("SetShopsToday.php", { method:"POST", body: formulario });
        
        //await SetProPriceIngr(aux_pro)
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        for (let i = 0; i < aux_pro.length; i++) {
            const element = aux_pro[i];
            formulario.append("ingr_qt"+(i+1),element[0]);
            formulario.append("ingr_st"+(i+1),element[1]);
            formulario.append("ingr_dqt"+(i+1),tempIngredientsArray[i]); //formulario.append("ingr_dqt"+(i+1),GAME.user.ingredient_inventory.items[i]);
            //console.log(element[1])
            //console.log("Aux ingredients array : " + tempIngredientsArray[i])
        }
        await fetch("SetProPriceIngr.php", { method:"POST", body: formulario })
        .then(function(response){ if (response.status >= 200 && response.status < 300) { return response.text(); } })
        .then(function(_getData){ 
           // console.log(_getData);
         });

        //await SetMagicPower()
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        formulario.append("data",GAME.user.magic_power);
        await fetch("SetMagicPower.php", { method:"POST", body: formulario });
       document.getElementById('next_seller').removeAttribute('disabled')//ELIMINA EL ATRIBUTO NEXTSTORE LLEGA A LA ULTIMA NO PUEDE ELIMINAR DA ERROR 0_0

    }

    GAME.items_sold.length = 0;
}

async function NextStore(){
    //console.log(GAME.items_sold);
    var success = "failed";
    
    //await SetStoreVisited(list_stores.length);
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    formulario.append("quantity", list_stores.length);
    //console.log("usuario "+GAME.getCurrentAccount);
    //console.log("HOLA "+list_stores.length);
    await fetch("SetStoreQuantity.php", { method:"POST", body: formulario });

    //await SetUserDataInDB(GAME.EncodeToLineInventory());
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    formulario.append("data", GAME.EncodeToLineInventory());
    formulario.append("sold", await LineaDeVentas());
    await fetch("SetIngredients.php", { method:"POST", body: formulario })
    .then(function(response){ if (response.status >= 200 && response.status < 300) { return response.text(); }})
    .then(function(_getData){ success = _getData; console.log(_getData); });

    //if (success == "success") //bloquea el cambio de la UI
    //{
        GAME.updateMagicPowerUI();
        //GAME.items_sold.length = 0;
        if (list_stores.length > 0) {
            setStore();
            list_stores.shift();
        } 
        else{
            NoStoresLeft();
        }
    //}
    return success;
}

function NoStoresLeft(){
    document.getElementById("store-shelf").innerHTML = ""
    //document.getElementById("receipt").style.display = "flex"
    //document.querySelector("main").style.display = "none"
    document.getElementsByClassName("anim")[0].innerHTML = "";
    document.getElementsByClassName("anim")[0].innerHTML = `<p class="adv" align = "center">Today's purchases are done. Press the button "Finish today's purchases" to save progress</p>`;
    document.getElementsByClassName('end')[0].setAttribute("onclick","FinishGetIngredients()") //cambio 1
    document.getElementsByClassName('end')[0].removeAttribute('style'); //cambio 4
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function setStore(){
    UpdateSteper()
    //document.getElementsByClassName('end')[0].setAttribute("onclick","FinishGetIngredients()") //cambio 2
    document.getElementsByClassName('end')[0].style.display = "none" //cambio 3
    
    var tienda = window.GAME.tienda;
    tienda.valuable_items = [0];
    var data_array = list_stores[0].split('|');
    
    //console.log("data_array",data_array);
    for (let i = 0; i < data_array.length; i++) {
        const single_data = data_array[i];
        var pair = single_data.split(',');
        tienda.AddValuelableItem(parseInt(pair[0]),parseInt(pair[2]),parseInt(pair[1]),(GAME.q_seller-list_stores.length));
    }
    
    var numpng = getRandomInt(1,7);
    var buyer = "assets/characters/sellers/seller_0"+numpng+".png" 
    document.getElementById("wizard-seller").setAttribute("src",buyer);
    
    tienda.CreateUI();
    auxIngredientsArray = Array.from(GAME.user.ingredient_inventory.items);
    //console.log("Setting store: " + auxIngredientsArray);
}

function UpdateSteper(){
    let seller_ = (GAME.q_seller - list_stores.length) + 1
    document.getElementsByClassName('info').steps.innerHTML = "SELLER " + (seller_)+"/"+(GAME.q_seller)
    document.getElementsByClassName('center')[0].getElementsByClassName('dat')[0].innerHTML = list_stores.length -1
}

async function FinishGetIngredients(){
    let securitty = await GAME.CanBuy()
    if (!securitty){
        location.reload(!0);
    } else{
        document.getElementById('dialog').setAttribute('open',null);
        //let diference = aux_balance_init - GAME.user.balance;
        ///await SetUserDataInDB(GAME.EncodeToLineInventory());
        //await SetMagicPower();
        //await SetListStore("null");
        await FinishBuyingDay();
        GAME.items_sold.length = 0; //reiniciamos la variable que guarda las compras de ingredientes
        window.location.replace("potions.html");
    }
}

async function FinishBuyingDay(){
    //console.log("INGRESA A FINISH BUYING DAY");

    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    await fetch("SetCanBuy.php",
    {
        method:"POST",
        body: formulario
    });
}

/*
async function SetMagicPower(){
    //console.log("INGRESA A FINISH BUYING DAY");

    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("data",GAME.user.magic_power);
    await fetch("SetMagicPower.php",
    {
        method:"POST",
        body: formulario
    });
}
*/

/*
async function SetStoreVisited(q){
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("quantity",q);
    await fetch("SetStoreQuantity.php",
    {
        method:"POST",
        body: formulario
    });
}
*/

/*
async function SetUserDataInDB(data){ 
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    if (data == "null"){
        formulario.append("data","null");
        formulario.append("sold","null");
    }
    else
    {
        var ingredientes_comprados = await LineaDeVentas();
        formulario.append("data", data);
        formulario.append("sold", ingredientes_comprados);
    }
    //cambiar este setdata por SetDataInGame.PHP seguridad no se crean usuarios nuevos dentro del juego
    await fetch("SetIngredients.php",
    {
        method:"POST",
        body: formulario
    });
}
*/

async function LineaDeVentas(){
    if (GAME.items_sold.length <= 0) { return ""; }

    var linea = "";
    var copia = [];
    var venta = GAME.items_sold.sort();
    
    var current = null;
    var contador = 0;
    
    for (var i = 0; i < venta.length; i++) {

        if (venta[i] != current) {

            //No funcionara la primeera vez, porque el resto inicia con 1
            if (contador > 0) { copia.push(current + "," + contador); }
            
            current = venta[i];
            contador = 1;

        } else { contador++; }

        //el ultimo, se guarda obligatoriamente
        if (i == venta.length - 1) { copia.push(current + "," + contador); }
    }

    linea = copia.join(";");
    //console.log(">>> ingredienteCompradosComprimidos" + linea);

    return linea;
}

async function LimpiarDB(){
    //await SetStoreVisited("null")
}
 
async function Oncomplete(){
    //await SetListStore("null")
    window.location.replace("potions.html");
}
function OnError()
{
    location.reload(true);
}

/*
async function SetShopsToday(data){
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("array",data);
    await fetch("SetShopsToday.php",
    {
        method:"POST",
        body: formulario
    });
}
*/

async function getShopsToday(){
    var account = await GAME.getCurrentAccount();
    return new Promise(function(myResolve, myReject) 
    {
        var formulario = new FormData();
        formulario.append("usuario", account); //formulario.append("usuario", GAME.user.ID);
        
        fetch("GetShopsToday.php", {
            method:"POST",
            body: formulario
        })
        .then(function(response){
            if (response.status >= 200 && response.status < 300) {
                return response.text();
            }
        })
        .then(function(_getData){
            myResolve(_getData);
        });
    });
}

async function fillcompra_perday(){
    var data_db = await getShopsToday();
    if (data_db == 'no se encontro el usuario!') data_db = ''
    GAME.compra_perday = data_db
    var aux_q = []
    var aux_price = []
    var aux_pro = []
    //console.log(GAME.compra_perday)
  //  console.log(data_db)
    if (data_db != null && data_db != '') GAME.compra_perday += ';'
    for (let i = 0; i < GAME.items_sold.length; i++) {
        const element = GAME.items_sold[i].split(',');
        var ele_ing_index = parseInt(element[1]) //q
        var ele_ing_price = parseInt(element[2]) //price
        aux_q[ele_ing_index] = aux_q[ele_ing_index]  == undefined ? 1 : aux_q[ele_ing_index]  + 1
        aux_price[ele_ing_index] = ele_ing_price
    }
    for (let i = 0; i < GAME.GLOBALITEMS.length; i++) {
        const element = aux_q[i];
        var helper = ''
        if (element != undefined){
            helper += i + "," + element + "," + aux_price[i]
            aux_pro[i] = [element,aux_price[i]]
        }else{
            helper += i + "," + 0 + "," + 0
            aux_pro[i] = [0,0]
        }
        if (i != GAME.GLOBALITEMS.length -1 ) helper += "|";
        GAME.compra_perday += helper
    }

    /*
    //await SetShopsToday(GAME.compra_perday) 
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("array", GAME.compra_perday);
    await fetch("SetShopsToday.php", { method:"POST", body: formulario });
    */
    
    /*
    //await SetProPriceIngr(aux_pro)
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    for (let i = 0; i < aux_pro.length; i++) {
        const element = aux_pro[i];
        formulario.append("ingr_qt"+(i+1),element[0]);
        formulario.append("ingr_st"+(i+1),element[1]);
        formulario.append("ingr_dqt"+(i+1),GAME.user.ingredient_inventory.items[i]);
    }
    await fetch("SetProPriceIngr.php", { method:"POST", body: formulario })
    .then(function(response){ if (response.status >= 200 && response.status < 300) { return response.text(); } })
    .then(function(_getData){ console.log(_getData); });
    */

    return aux_pro;
}

/*
async function SetProPriceIngr(array){
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        formulario.append("ingr_qt"+(i+1),element[0]);
        formulario.append("ingr_st"+(i+1),element[1]);
        formulario.append("ingr_dqt"+(i+1),GAME.user.ingredient_inventory.items[i]);
    }
    await fetch("SetProPriceIngr.php",
    {
        method:"POST",
        body: formulario
    })
    .then(function(response){
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        }
    })
    .then(function(_getData){
        console.log(_getData);
    });
}
*/

