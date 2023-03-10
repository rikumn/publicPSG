//cada linea es un pedido
let version = '0.0.3';

var list_clients = [];
var store_open = false;
let btns_ = document.querySelector("footer").querySelectorAll('button')
var data_temporal = ""; //////////<<<<<<<<<<<<<<<<< CAMBIO 1 (cambiar a let)

async function GameDataSet(){
    if (await GAME.CanBuy()){
        window.location.replace("ingredients.html");
    }
    if (await GAME.CanMake()){
        window.location.replace("potions.html");
    }
    await GAME.CanSell().then(CheckDay);
}

async function CheckDay(value){
    //console.log("checkday",value)
    if (!value){
        if (await GAME.CanMake()){
            window.location.replace("potions.html");
        }else{
            window.location.replace("day-end.html");
        }
    }else{
        //console.log("Reiniciaré la base de datos y le haré la vida imposible a Desarrollo");
        await FetchDB();
    }
}

var potion_pedido = [];
var final_price = 0;
 
async function NextClient(){
    let abletosell = await AbleToSell()
    if (!abletosell){
        window.alert('You cannot get another client if you do not have cauldrons in game')
        return 
    }
    /*
    //await SetUserDataInDB(GAME.EncodeToLineInventory());
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("data", GAME.EncodeToLineInventory());
    formulario.append("attended", GAME.offer_accepted[0]);
    await fetch("SetSellPotion.php", { method:"POST", body: formulario });
    */
    /*await GAME.GetTimes().then(function(times){
        SetTimeStamp(times[0])
    });*/
    //console.log(list_clients.length>0)
    //console.log(list_clients.length)
    GAME.offer_accepted.length = 0;
    list_clients.shift();
    if (list_clients.length>0){
        SetClient();
    } else{
        DayFinished();
    }

    //await SetClientsAttentedQuantity(list_clients.length);
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    formulario.append("quantity", list_clients.length);
    await fetch("SetClientQuantity.php", { method:"POST", body: formulario });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function DeactivateBtns(){
    for (let i = 0; i < btns_.length; i++) {
        const element = btns_[i];
        element.removeAttribute('readonly')
        element.removeAttribute('disabled')
    }
}

function SetClient(){
    document.getElementsByClassName('end')[0].style.display = "none"

    if (list_clients.length > 0)
    {
        potion_pedido = [];
        UpdateSteper()
        final_price = 0;
        let ingredients = list_clients[0].replaceAll(' ','').split('|');
        var string_pedido = "";
        let top_table = document.querySelector('footer').querySelector('.items')
        top_table.innerHTML = ""
        for (let i = 0; i < ingredients.length; i++) {
            const item = ingredients[i].split(',');
            //console.log(item);
            var ingredient_to_potion = [item[1],window.GAME.GLOBALPOTIONS[item[0]]];
            //console.log(window.GAME.GLOBALPOTIONS[item[0]])
            //console.log(ingredient_to_potion)
            potion_pedido.push(ingredient_to_potion);
            final_price += ingredient_to_potion[0] * item[2];
            string_pedido += (i == 0? "" : (i == ingredients.length -1 ? " plus " :",<br/>") )+ " <span class='price'>" + ingredient_to_potion[0] * item[2]  + "</span> for " + ingredient_to_potion[0] + " " + ingredient_to_potion[1].tittle ;
            
            let name_image = GAME.user.potion_inventory.GetPotionImageName(item[0])
            top_table.innerHTML +=	`
            <div class="item">
            <img src="assets/potions/p_basic_`+name_image+`.png" alt="potion">
            <div class="out">`+ingredient_to_potion[0]+`</div>
            <div class="price">`+item[2]+`</div>
            </div>`
        }
        //modification dialog
        let dialogo = ""
        dialogo = "I'll give you " + string_pedido + ",please";
        document.getElementsByClassName("txt")[0].innerHTML = dialogo;
        var numpng = getRandomInt(1,10);
        var buyer = "assets/characters/buyers/buyer_villager_0"+ numpng +".png"
        document.getElementById("wizard-buyer").setAttribute("src",buyer);

        UpdateButtonOptions()
    }
}

function UpdateSteper(){
    let buyer_ = (GAME.q_clients - list_clients.length) + 1
    document.getElementsByClassName('info').steps.innerHTML = "SELLER " + (buyer_)+"/"+(GAME.q_clients)
    document.getElementsByClassName('center')[0].getElementsByClassName('dat')[0].innerHTML = list_clients.length -1
}

async function SellPotion(){
    let abletosell = await AbleToSell()
    if (!abletosell){
        window.alert('You cannot sell a potion if you do not have cauldrons in game')
        return 
    }
    if (!CheckingAvailableToSell()) return

    for (let i = 0; i < btns_.length; i++) {
        const element = btns_[i];
        element.setAttribute('readonly',null)
        element.setAttribute('disabled',null)
    }

    GAME.offer_accepted.push(GAME.q_clients - list_clients.length);

    for (let i = 0; i < potion_pedido.length; i++) {
        const ingre = potion_pedido[i];
        await window.GAME.user.potion_inventory.RemoveItem(ingre[1].ID,ingre[0]);
        let sol_elemnt = document.getElementsByClassName("book").potions.getElementsByClassName('out')[ingre[1].ID]
        let ii = (parseInt(sol_elemnt.innerHTML.split(' ')[0]) + parseInt(ingre[0]))
       // console.log(ii)
        sol_elemnt.innerHTML = ii + ' SOLD'
        sol_elemnt.style.display = "flex"
    }
    window.GAME.user.balance += parseInt(final_price);
    //window.GAME.user.magic_power = window.GAME.user.magic_power - parseInt(final_price) < 0 ? 0 :window.GAME.user.magic_power - parseInt(final_price);
    // window.GAME.SendInfoDB();

    var continuar = false;

    //await SetUserDataInDB(GAME.EncodeToLineInventory());
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    formulario.append("data", GAME.EncodeToLineInventory());
    formulario.append("attended", GAME.offer_accepted[0]);
    await fetch("SetSellPotion.php", { method:"POST", body: formulario })
    .then(function(response){ if (response.status >= 200 && response.status < 300) { return response.text(); } })
    .then(function(_getData){ if (_getData == "success") { continuar = true; } });

    if (continuar == true)
    {
        //window.GAME.user.potion_inventory.SetPotionSeq()
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        formulario.append("data", GAME.user.potion_inventory.items_seq.join(';'));
        await fetch("SetPotionSeq.php", { method:"POST", body: formulario });

        var formulario1 = new FormData();
        formulario1.append("data", GAME.user.potion_inventory.pocionesMagicPower_updated.join(';'));
        await fetch("SetPotionsPosInMagicPower.php", { method:"POST", body: formulario1 })
    }

    //SetMagicPower();
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("data",GAME.user.magic_power);
    await fetch("SetMagicPower.php", { method:"POST", body: formulario });
    
    window.GAME.UpdateBalanceUI();
    window.GAME.updateMagicPowerUI();
    FinishTransaction();
}

function UpdateButtonOptions(){
    //modification options 
    //modification options 
    DeactivateBtns()
    //donde childNodes[1] & [3] son los botones
    //nos fijamos si se puede acordar el trato ... de lo contrario se desactiva el boton
    //console.log(CheckingAvailableToSell(potion_pedido));
    if (CheckingAvailableToSell(potion_pedido)){
        btns_[1].setAttribute("onclick","SellPotion()");
        btns_[1].innerHTML = "Accept offer <span class='price'>" + final_price +"</span>";
        document.getElementsByClassName('row up')[0].setAttribute('style','display:flex')
    }else{
        btns_[1].setAttribute("readonly",null);
        btns_[1].setAttribute("disabled",null);
        btns_[1].innerHTML = "Can not accept offer";
        //document.getElementsByClassName('row up')[0].setAttribute('style','display:none')
    }
}

function CheckingAvailableToSell(){
    if ( potion_pedido.length < 1) return false;
    for (let i = 0; i < potion_pedido.length; i++) {
        const ingre = potion_pedido[i];
        //console.log(!window.GAME.user.potion_inventory.items);
        //console.log(!window.GAME.user.potion_inventory.items[ingre[1].ID]);
        //console.log(ingre[1].ID);
        //console.log(!window.GAME.user.potion_inventory.GetItemQuantitybyID(ingre[1].ID));
        if (!window.GAME.user.potion_inventory.GetItemQuantitybyID(ingre[1].ID) || ingre[0] > window.GAME.user.potion_inventory.GetItemQuantitybyID(ingre[1].ID)) return false;
    }
    return true;
}

function FinishTransaction(){
    //console.log("se realizo transaccion " + final_price +" vendiendo");
    //console.log(potion_pedido);
    //deactivar botones en escena
    DeactivateBtns()
    //transaccion en meta mask

    //if transaccion realizada correctamente
    //  mandar datos DB
    //  se despide de cliente
    //  se actualiza inventario
    window.GAME.user.potion_inventory.UpdateUI();
    //  if (hay clientes && hay algo en el inventario) aparece otro cliente
    NextClient();
    //else
    //  reactivar botones correspondients
}

function DayFinished(){
    document.getElementsByClassName('end')[0].style.display = "flex" //cambio 2
    document.getElementsByClassName("anim")[0].innerHTML = "";
    document.getElementsByClassName("anim")[0].innerHTML = `<p class="adv" align = "center">Today's sales are done. Press the button "Finish today's sales" to save progress</p>`;
        //document.getElementsByClassName("options")[0].setAttribute("align","middle");
    /*document.getElementsByClassName("dialog")[0].innerHTML = "";
    document.getElementsByClassName("dialog")[0].setAttribute("style", "display: none;");
    document.getElementsByClassName("sell")[0].innerHTML = "";
    document.getElementsByClassName("options")[0].innerHTML = `<p class="adv">Today's sales are done. Press the button to save progress</p>
        <button onclick = "BtnDayFinish()">Finish Today's sales</button>`;
        document.getElementsByClassName("options")[0].setAttribute("align","middle");*/
}

/*
function rechargeInventory(){
    for (let i = 0; i < window.GAME.GLOBALPOTIONS.length; i++) {
        window.GAME.user.potion_inventory.items[i] = 10;
    }
    window.GAME.user.potion_inventory.UpdateUI();
}
*/

async function BtnDayFinish(){
    document.getElementById('dialog').setAttribute('open','open');
    let securitty = await GAME.CanSell();
    if (!securitty) {
        location.reload(!0);
    }else{
        await FinishSellingDay();
        window.location.replace("day-end.html");
    }
    
    //console.log(GAME.user.balance);
    //let rodso = await GAME.getInventoryLineFromContract();
    //let diference =  Math.abs(GAME.user.balance - rodso[0])
    //console.log(diference)
    //window.GAME.FinishSellPotionsDay(diference,On_CompleteDayFinish,On_errorDayFinish);
}
/*
async function SetMagicPower(){//Setea CanBuy
    //console.log("INGRESA A FINISH SELLING DAY")
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("data",GAME.user.magic_power);
    //formulario.append("TS", data);
    await fetch("SetMagicPower.php",
    {
        method:"POST",
        body: formulario
    });   
    
    //console.log(">>>"+formulario.get("usuario"));
    //console.log(">>>"+formulario.get("TS"));
}*/

function On_errorDayFinish(){
    //console.log("chile... ma bad. hold on ama give u one more try suga <3");
    location.reload(true);
}

//FUNCION ELIMINAR O BORRAR. PELIGROSA
/*async function On_CompleteDayFinish(data){
    await SetClientsAttentedQuantity("null")
    await SetClientsArray("null")
    //await SetData("null") //Debería apagarse
    await SetTimeStamp("null")
    window.location.replace("ingredients.html");
}*/

async function FetchClientsAttentedQuantity(){
    //var _getData = "";
    //console.log("fetch");
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    await fetch("GetClientQuantity.php",{
        method:"POST",
        body: formulario
    })
    .then(function(response){
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        }
    })
    .then(function(_getData){
        let numero = 0;
        //console.log("how many clients left? = " + _getData);
        if (_getData == ""){
            UIbuttonCreate();
        }else{
            //GAME.q_clients = _getData
            numero = parseInt(_getData);
            if(numero > 0){
                CreateStore();
            }
            else if(numero == 0){
                BtnDayFinish();
            }
        }
        GAME.offer_accepted.length = 0;
        FetchClientsArray(numero); //13032240
        //FetchData() //13032240
        GAME.user.potion_inventory.UpdateBoard();
        if(document.getElementsByClassName("options").length > 0) document.getElementsByClassName("options")[0].childNodes[3].setAttribute("onclick","NextClient()");
        return _getData;//NULL si no ha atendido a nadie
    });
}  

async function FinishSellingDay(){//Setea CanBuy
    //console.log("INGRESA A FINISH SELLING DAY")
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    //formulario.append("TS", data);
    await fetch("SetCanSell.php",
    {
        method:"POST",
        body: formulario
    });   
    
    //console.log(">>>"+formulario.get("usuario"));
    //console.log(">>>"+formulario.get("TS"));
}

/*
async function SetUserDataInDB(data){ //Evaluar enviar a Module para versión final. Y llamarlo en potionManager y plazaManager
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    if (data == "null"){
        formulario.append("data","null");
    }
    else
    {
        formulario.append("data", data);
        formulario.append("attended", GAME.offer_accepted[0]);
    }
    
    await fetch("SetSellPotion.php",
    {
        method:"POST",
        body: formulario
    });
    //console.log(">>>"+formulario.get("usuario"));
    //console.log(">>>"+formulario.get("data"));
    //console.log(">>>"+formulario.get("attended"));
}  
*/

async function FetchClientsArray(){
    //var _getData = "";
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    await fetch("GetClientArray.php",{
        method:"POST",
        body: formulario
    })
    .then(function(response){
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        }
    })
    .then(async function(_getData){
        //console.log("clients info= " + _getData);
        if (_getData == "" || _getData == 'no se encontro el usuario!'){
            //let template = await GAME.getTemplateBuyers();
            
            //list_clients = GAME.RandomsInArrayNonRepeting(template,q_clients);
            
            //await SetListClientsfromTemplates()
            let string_templates = await getTemplates()
            string_templates = string_templates.replaceAll('\r','')
            string_templates = string_templates.split('\n')
            //console.log(" list_clients_template = "+ string_templates);
           // console.log(" q_Clients = "+ GAME.q_clients);
            list_clients = GAME.RandomsInArrayNonRepeting(string_templates,GAME.q_clients,1);
            var formulario = new FormData();
            formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
            formulario.append("array", list_clients.join(';'));
            console.log("Usuario " + GAME.getCurrentAccount);
            console.log("clients list= " + list_clients);
            await fetch("SetClientArray.php", { method:"POST", body: formulario });

        }else{
            list_clients = _getData.split(';');
            list_clients.forEach(element => {
                element = parseInt(element);
            });
        }
        await Parch905()
        //console.log(list_clients)
        return _getData;//NULL
    });
}  

async function Parch905(){
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    await fetch("GetClientQuantity.php",{ method:"POST", body: formulario })
    .then(function(response){
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        }
    })
    .then(function(_getData){
        let numero = GAME.q_clients;
        //console.log("how many clients left? = " + _getData);
        if (_getData == ""){
            //UIbuttonCreate();
        }else{
            //GAME.q_clients = _getData
            numero = parseInt(_getData);
        }
        list_clients.splice(0,list_clients.length - numero);
        //console.log(list_clients)
       if (list_clients.length>0){
            SetClient();
            //list_clients.shift();
        } else{
            DayFinished();
        }
        return _getData;//NULL si no ha atendido a nadie
    });
}

/*
async function SetListClientsfromTemplates(){
    let string_templates = await getTemplates()
    string_templates = string_templates.replaceAll('\r','')
    string_templates = string_templates.split('\n')
    list_clients = GAME.RandomsInArrayNonRepeting(string_templates,q_clients);
    SetClientsArray();
}
*/

async function getTemplates(){
    return new Promise(function(myResolve, myReject) 
    { 
            fetch("getClientTemplates.php",{
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
async function FetchData(){
    //var _getData = "";
    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    await fetch("GetData.php",{
        method:"POST",
        body: formulario
    })
    .then(function(response){
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        }
    })
    .then(function(_getData){
        //console.log("info= " + _getData);
        if (_getData == "" || _getData == "no se encontro el usuario!"){
            //SetData(GAME.EncodeToLineInventory());
            GAME.user.potion_inventory.CreateUI();
        }else
        {
            data_temporal = _getData;
            SetDataLocal()
            data_temporal = "";
        }
        return _getData;//NULL
    });
}  
*/
/*
async function SetClientsAttentedQuantity(q){
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("quantity",q);
    await fetch("SetClientQuantity.php",
    {
        method:"POST",
        body: formulario
    });
    //console.log(">>>"+formulario.get("usuario"));
    //console.log(">>>"+formulario.get("quantity"));
} 
*/ 

/*
async function SetClientsArray(data){
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    if (data == "null"){
        formulario.append("array","null");
    }
    else
    {
        formulario.append("array",'"'+list_clients.join(';')+'"');
    }
    
    await fetch("SetClientArray.php",
    {
        method:"POST",
        body: formulario
    });
    //console.log(">>>"+formulario.get("usuario"));
    //console.log(">>>"+formulario.get("array"));
}  
*/

/*
async function SetData(data){
    var formulario = new FormData();
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    if (data == "null"){
        formulario.append("data","null");
    }
    else
    {
        formulario.append("data",'"'+data+'"');
    }
    //cambiar este setdata por SetDataInGame.PHP seguridad no se crean usuarios nuevos dentro del juego
    await fetch("SetData.php",
    {
        method:"POST",
        body: formulario
    });
    //console.log(">>>"+formulario.get("usuario"));
    //console.log(">>>"+formulario.get("data"));
}  
*/
/*
function SetDataLocal(){
    
    if(data_temporal != "")
    {
        
        /*
        let values = data_temporal.split(";");
        //console.log(values)
        let sbalance = values[0];
        let sLineIngredients = values[1];
        let sLineArrayPotions = values[2];
    
        GAME.user.balance = parseInt(sbalance) >= 0 ? parseInt(sbalance) : 0 ;
        
        //carga valores del inventario de ingredientes
        let ingtsValues = sLineIngredients.split(",");
        for (let i = 0; i < ingtsValues.length; i++) {
            let tems = ingtsValues[i];
            GAME.user.ingredient_inventory.items[i] =  parseInt(tems);
            //.log(">> item"+ i +" = "+ ingtsValues[i] );
        }
        //carga valores del inventario de pociones
        let ptnsValues = sLineArrayPotions.split(",");
        for (let i = 0; i < ptnsValues.length; i++) {
            let tems = ptnsValues[i];
            GAME.user.potion_inventory.items[i] =  parseInt(tems);
            //console.log(">> item"+ i +" = "+ ptnsValues[i] );
        }
    }
    
    GAME.UpdateBalanceUI();
    GAME.user.potion_inventory.CreateUI();
}
*/
//////////<<<<<<<<<<<<<<<<< CAMBIO 18 (//Aparentemente innecesaria)
async function SetTimeStamp(data){
    var formulario = new FormData();
    //console.log('"'+GAME.user.ID+'"')
    formulario.append("usuario",'"'+GAME.user.ID+'"');
    formulario.append("TS", data);
    await fetch("SetTimeStamp.php",
    {
        method:"POST",
        body: formulario
    });
    //console.log(">>>"+formulario.get("usuario"));
    //console.log(">>>"+formulario.get("TS"));
}  

async function FetchTimeStamp(){ //Aparentemente innecesaria
    //Se pregunta por la data
    await fetch("GetTimeStamp.php?usuario='"+GAME.user.ID+"'",{
        method:"GET",
    })
    .then(function(response){ //si sale un error
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        }
    })
    .then(function(_getData){ //se obtuvo la data
        //console.log("time stamp is: " + _getData);
        //si el time stamp es nulo significa que nunca a jugado o si presiono el boton de terminar ventas 
        //y significa que si es un nuevo dia
        if (_getData == "" || _getData == "no se encontro el usuario!"){
            //borrar las 3 columnas de datos y reemplazarlos con nuevos 
            ReiniciarDia();
        }
        else //si hay un timestamp
        {
           // comprobar que ya paso un dia 
           CheckPassDay(_getData);
        }
        return _getData;//NULL
    });
}  

async function CheckPassDay(data){ //Aparentemente innecesaria
    //let taim = await GAME.GetTimestamp();
    let taim = await GAME.GetInDayMax();
    let intervalcooldown = await GAME.GetTimeIntervalCooldown();
    //console.log(taim+ "<- TIEMPO MAX     Tiempo DB-> "+ data)
    //console.log(parseInt(data) + parseInt(intervalcooldown))
    if (!((parseInt(data) + parseInt(intervalcooldown)) <= parseInt(taim))){
        //no paso un dia: recoger data de DB
        await FetchDB();
    }else{
        //si ya paso un dia reiniciar dia
        console.log("ya paso un dia")
        await ReiniciarDia();
    }
}

async function ReiniciarDia(){
    console.log("limpiando db")
    //await LimpiarDB().then(UIbuttonCreate)
}
async function LimpiarDB(){
    /*
    await SetClientsArray("null")
    await SetClientsAttentedQuantity("null")
    //await SetData("null")
    await GAME.GetTimes().then(function(times){
        SetTimeStamp(times[0])
    });
    */
}
async function GetQClient(){   
    let q = await GAME.getGameVersion();
    GAME.q_clients = parseInt(q[2].split(' ')[1]) 
    if( q[0].split(' ')[2] != '0.0.2'){
        await FetchClientsAttentedQuantity();
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
            var benefits = _getData.split(',')
          //  console.log(_getData)

            var addedC = 0
            for (let i = 0; i < benefits.length; i++) {
                const benefit = benefits[i];
                if (benefit == 'c') addedC++;
            }
           // console.log(addedC)
            GAME.q_clients += addedC;
            await FetchClientsAttentedQuantity();
        });
    }
}

async function FetchDB(){
    let version_ = await GAME.getGameVersion()
    version_ = version_[0].split(' ')[2];
    if (version_ == version)
    {
        await GetQClient();
    }
    else{
        document.getElementById('refresh').setAttribute('open',null);
    }
}

function UIbuttonCreate(){
    document.querySelector("main").setAttribute("style","display:none")
    document.querySelector("footer").setAttribute("style","display:none")
    document.getElementById('store').setAttribute("style","display:flex")
    document.getElementsByClassName("end")[0].setAttribute("style","display:none")
    document.getElementById("open_store").setAttribute("onclick","OpenStore()");
    //document.getElementsByClassName("end")[0].innerHTML = "Open Store";

}

async function OpenStore(){
    //console.log(q_clients);
    let abletosell = await AbleToSell()
    if (!abletosell){
        window.alert('You cannot open store if you do not have cauldrons in game')
        return 
    }
    
    document.getElementById('open_store').setAttribute('disabled',null)
    document.getElementById('open_store').setAttribute('readonly',null)
    var continuar = false;

    var formulario = new FormData();
    formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
    await fetch("GetClientQuantity.php",{ method:"POST", body: formulario})
    .then(function(response){ if (response.status >= 200 && response.status < 300) { return response.text(); } })
    .then(function(_getData){ if (_getData == null || _getData =="") { continuar = true; } });

    if (continuar == true)
    {
        //SetClientsAttentedQuantity(q_clients)
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        formulario.append("quantity", list_clients.length);
        await fetch("SetClientQuantity.php", { method:"POST", body: formulario });
        
        FetchClientsArray()
        //FetchData()
        CreateStore();
    }
    else
    {
        window.location.reload();
    }
}

async function CreateStore(){
    //console.log(q_clients);
    let abletosell = await AbleToSell()
    if (!abletosell){
        window.alert('You cannot open store if you do not have cauldrons in game')
        return 
    }
    document.querySelector("main").setAttribute("style","display:flex")
    document.querySelector("footer").setAttribute("style","display:flex")
    document.getElementById("store").setAttribute("style","display:none")
    document.getElementsByClassName("end")[0].setAttribute("onclick","BtnDayFinish()");
    document.getElementsByClassName("end")[0].innerHTML = "Finish today's sales";
    document.getElementsByClassName("end")[0].setAttribute("style","display:flex")
    //FetchClientsArray()
    //FetchData()
}

async function AbleToSell(){
    let cauldrons__ = await GAME.getMaxPotionCanMake()
    return !(cauldrons__ == 0)
}

/**/
