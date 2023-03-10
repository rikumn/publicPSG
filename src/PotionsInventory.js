
    //Tabla manda. 

import Inventory from "./Inventory.js";

export default class PotionsInventory extends Inventory{
    
    constructor(_user,_classnameitem){
        super(_user,_classnameitem);
        //sequencias de id de cuando se crearon
        this.items_seq=[]
        this.max_per_page_board = 35
        this.page_index = 0
        this.q_potion_made = 0;
        this.potionsInfo = [];
        this.pocionesMagicPower_updated = [];
        this.GetPotionsInfo();
        this.tagActive = false;
    }
    
    async GetPotionsInfo(){
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        await fetch("GetPotion.php",{
            method:"POST", body: formulario
        })
        .then(function(response) { if (response.status >= 200 && response.status < 300) { return response.text() }})
        .then(function(_getData) {
            //console.log(_getData)
            let inventorio = GAME.user.potion_inventory;
            let potionInfo_aux = _getData.split(';');
            for (let i = 0; i < potionInfo_aux.length; i++) {
                let tems = potionInfo_aux[i].split(",");
                let tipo = parseInt(tems[2])-1;
                let pos = parseInt(tems[4]);
                
                if (parseInt(tems[5]) > 0){
                    inventorio.potionsInfo[pos] = potionInfo_aux[i].split(',');
                    //inventorio.items[tipo] = inventorio.items[tipo] == undefined ? 1 : inventorio.items[tipo] + 1;
                    inventorio.items_seq[pos] = [tipo,parseInt(tems[3]),parseInt(tems[6])];
                } 
            }
            //inventorio.UpdateBoard();
        });
    }


    GetPotionImageName(index){
        let item = this.user.game.GLOBALPOTIONS[index];
        let ima = item.tittle.toLowerCase().split(' ')
        if (ima.length > 1) ima[1] = ima[1].charAt(0).toUpperCase() + ima[1].slice(1) 
        if (ima.length > 2) ima[2] = ima[2].charAt(0).toUpperCase() + ima[2].slice(1) 
        return ima.join('');
    }
    
    //should be call only when the html has a invenotry page_content
    CreateUI()
    {
        var page = document.getElementsByClassName("book").potions.getElementsByClassName('row items')[0];
        page.innerHTML = ""
        for (let i = 0; i < this.user.game.GLOBALPOTIONS.length; i++) {
            const item = this.user.game.GLOBALPOTIONS[i];
            var q_user_item = this.items[i] == undefined ? 0 : this.items[i];
            let ima = item.tittle.toLowerCase().split(' ')
            if (ima.length > 1) ima[1] = ima[1].charAt(0).toUpperCase() + ima[1].slice(1) 
            if (ima.length > 2) ima[2] = ima[2].charAt(0).toUpperCase() + ima[2].slice(1) 
            var name_image = ima.join('');
            
            page.innerHTML +=`
                        <div class="btn item `+ this.classname +`" data-q=`+q_user_item +`>
                            <div class="name">`+ item.tittle +`</div>
                            <div class="new" style="display:none">0 NEW</div>
                            <div class="out" style="display:none">0 SOLD</div>
                            <img src="assets/potions/p_basic_`+name_image +`.png" alt="item">
                            <div class="info">`+q_user_item +`</div>
                        </div>
            `;
        }
        document.getElementById('inv-label').getElementsByClassName('info')[0].innerHTML = this.user.tagsq
        this.UpdateUI();
    }   
    
    async AddItem(_id, quantity = 1){
        //console.log(_id + " "+ quantity)
        if (!await this.CheckingAvailableToMake(_id)) return false;
        if (this.tagActive && GAME.user.tagsq < quantity) return false;
        var magg = await this.PowerPotion(_id)
        let list_newPotion_postitions = []
        this.items[_id] = this.items[_id] == undefined ? quantity : this.items[_id] + quantity;
        while(quantity>0) {

            //------ Potion Seq
            let indx = this.items_seq.findIndex( function(_l){
                return _l == null
            })
            indx = indx < 0 ? this.items_seq.length : indx
            this.items_seq[indx] = [_id,magg,(this.tagActive && GAME.user.tagsq >= quantity) ? 1 : 0]
            list_newPotion_postitions.push(indx)
            //-------Ingredients Managemnt
            for (let i = 0; i < window.GAME.GLOBALPOTIONS[_id].ingredients.length; i++) {
                const pair = window.GAME.GLOBALPOTIONS[_id].ingredients[i];
                window.GAME.user.ingredient_inventory.RemoveItem(pair[0],pair[1]);
            }

            //-------To be added in DB
            GAME.purchased_potions.push([_id + 1, magg, indx, (this.tagActive && GAME.user.tagsq >= quantity) ? 1 : 0]);
            GAME.user.magic_power += magg;
            if (this.tagActive) GAME.user.tagsq--;
            this.q_potion_made++;
            quantity--;
        }
        //console.log(GAME.purchased_potions);
        //GAME.updateMagicPowerUI();
        //this.UpdateBoard();
        if ( GAME.user.tagsq <= 0 ) {
            this.tagActive =false;
            if (document.getElementById('btn-etiquette')){
                document.getElementById('btn-etiquette').setAttribute('style','filter:brightness(75%)');
                document.getElementsByClassName("row up")[0].querySelector('span').setAttribute('style',GAME.user.potion_inventory.tagActive ? 'display:flex' : 'display:none');    
            }  
        }
        this.UpdateUI();
        GAME.updateTagsQUI();

        //Brillitos animacion
        document.getElementById('magic-pwr').querySelector('div').classList.add('light-magic')
        document.getElementById('magic-pwr').querySelector('div.progressbar').classList.add('light-magic')
        document.getElementById('magic-pwr').classList.add('light-magic')
        /*for (let i = 0; i < list_newPotion_postitions.length; i++) {
            const pos = list_newPotion_postitions[i];
            let ui_index = pos - (GAME.user.potion_inventory.page_index * GAME.user.potion_inventory.max_per_page_board);
            document.getElementsByClassName("board")[0].querySelectorAll('div')[ui_index].classList.add('light-magic')
        }*/
        GAME.updateMagicPowerProgress()

        this.delay(500).then(() =>{
            /*for (let i = 0; i < list_newPotion_postitions.length; i++) {
                const pos = list_newPotion_postitions[i];
                let ui_index = pos - (GAME.user.potion_inventory.page_index * GAME.user.potion_inventory.max_per_page_board);
                document.getElementsByClassName("board")[0].querySelectorAll('div')[ui_index].classList.remove('light-magic')
            }*/
            document.getElementById('magic-pwr').querySelector('div').classList.remove('light-magic')
            document.getElementById('magic-pwr').querySelector('div.progressbar').classList.remove('light-magic')
            document.getElementById('magic-pwr').classList.remove('light-magic')
            UpdatePanel(_id)
        });
        //Brillitos animacion

        return true;
    }
    
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    } 

    //falta comepltar borrar de DB
    async RemoveItem(_id, quantity = 1){
        //the most important diference bewtwne adding a removeing is taht removing is inmidiately, it goes directly to DB
        if (this.items[_id] == undefined || this.items[_id] < quantity){
            console.error("user does not have enough "+ this.user.game.GLOBALITEMS[_id].tittle + " to proceed");
        }
        else
        {
            while(quantity>0) {
                //------ Potion Seq
                let indx = this.items_seq.findIndex( function(_l){
                    return _l ? _l[0] == _id :false
                })

                let lastpos = indx;
                GAME.user.magic_power -= this.items_seq[indx][1]
                this.items_seq[indx] = null;

                //-------Remove in DB
                let id_db;
                id_db = this.potionsInfo[lastpos][0];
                console.log(id_db)

                this.pocionesMagicPower_updated.push([id_db,-1,0])
                //SAcar de while o for
                /*var formulario = new FormData();
                formulario.append("id",'"'+id_db+'"');
                formulario.append("pos", -1);
                formulario.append("state", 0);
                await fetch("SetPotionPosInMagicPower.php", { method:"POST", body: formulario })
                .then(function(response){
                    if (response.status >= 200 && response.status < 300) {
                        return response.text();
                    }
                })
                .then(function(_getData){
                    console.log(_getData)
                });*/
                //In thsi section the potion is deactivated in DB as well as its posiotn is set to -1
                this.items[_id] --; 
                quantity--
            }

            this.UpdateBoard();
            this.UpdateUI();
            GAME.updateMagicPowerUI();
            //Update DB
        }
    }
    
    /*
    async FetchPotionSeq(){
        //Se pregunta por la data
        await fetch("GetPotionSeq.php?usuario='"+GAME.user.ID+"'",{
            method:"GET",
        })
        .then(function(response){ //si sale un error
            if (response.status >= 200 && response.status < 300) {
                return response.text();
            }
        })
        .then(await async function(_getData){ //se obtuvo la data
            //console.log("potion list is: " + _getData);
            //si el time stamp es nulo significa que nunca a jugado o a jugado antes de la implemencation de esta actualzacion 
            //y significa que si es un nuevo dia
            if (_getData == "" || _getData == "no se encontro el usuario!"){
                //hay potiones ?
                
                if (!GAME.user.potion_inventory.IsEmpty()){
                    for (let i = 0; i < GAME.user.potion_inventory.items.length; i++) {
                        const pot = GAME.user.potion_inventory.items[i];
                        for (let j = 0; j < pot; j++) {
                            GAME.user.potion_inventory.items_seq.push(i)
                        }
                    }
                //GAME.user.potion_inventory.SetPotionSeq();
                var formulario = new FormData();
                formulario.append("usuario",'"'+GAME.user.ID+'"');
                formulario.append("data", '"'+GAME.user.potion_inventory.items_seq.join(',')+'"');
                fetch("SetPotionSeq.php", { method:"POST", body: formulario });
                }
            }
            else //si sequencia de potiones
            {
                GAME.user.potion_inventory.items_seq = []
                console.log(_getData)
                if (_getData[0] == 'V'){
                    //poner en items_seq igualmetn los id de tipo de pocion, pero recebir los IDPociones
                    //cleanV and read data
                    let seq = _getData.substring(1).split(',');
                    for (let i = 0; i < seq.length; i++) {
                        if (seq[i] != ''){
                            var aux = await GAME.user.potion_inventory.GetPotionTypeIdbyDBID(parseInt(seq[i]));
                            GAME.user.potion_inventory.items_seq.push(aux)
                        }                            
                        else
                            GAME.user.potion_inventory.items_seq.push(null)
                    }
                }else{
                    let seq = _getData.split(',');
                    //await GAME.user.potion_inventory.CreatePotionSeqV2(seq);
                }
                /*for (let i = 0; i < seq.length; i++) {
                    if (seq[i] != '')
                        GAME.user.potion_inventory.items_seq.push(parseInt(seq[i]))
                    else
                        GAME.user.potion_inventory.items_seq.push(null)
                }
            }
            GAME.user.potion_inventory.UpdateBoard()
            return _getData;//NULL
        });
    } */

    ///Esta es la funcion de crear table 
    async CreatePotionTable(){
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        await fetch("GetPotionSeq.php",{
            method:"POST",
            body: formulario
        })
        .then(function(response){ //si sale un error
            if (response.status >= 200 && response.status < 300) {
                return response.text();
            }
        })
        .then(await async function(_getData){ //se obtuvo la data
            let  seq = _getData.split(',')
            var line = "";
            for (let i = 0; i < seq.length; i++) {
                if (seq[i] != ''){
                    var tipo = parseInt(seq[i]);
                    var magg = await GAME.user.potion_inventory.PowerPotion(tipo)
                    line += (tipo +1 )  + "," + magg + "," + i;
                    if (i < seq.length - 1) { line += ";"; }
                    GAME.user.potion_inventory.items_seq[i]= [tipo,magg]
                } 
            }
            
            var formulario = new FormData();
            formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
            formulario.append("PurchasedPotions",line);
            await fetch("SetPocionesMagicPower.php",
            {
                method:"POST",
                body: formulario
            });

            var formulario = new FormData();
            formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
            formulario.append("data", GAME.user.potion_inventory.items_seq.join(';'));
            await fetch("SetPotionSeq.php", { method:"POST", body: formulario });
            await GAME.user.potion_inventory.GetPotionsInfo();
        });
    }

    async GetPotionTypeIdbyDBID(_id){
        var info = ""
        await fetch("GetPotionMagicbyId.php?id="+_id,{
            method:"GET",
        })
        .then(function(response) { if (response.status >= 200 && response.status < 300) { return response.text() }})
        .then(function(_getData) { info = _getData;} );
        return info.split(',')[2] -1;
    }

    /*
    async SetPotionSeq(){
        var formulario = new FormData();
        //console.log('"'+GAME.user.ID+'"')
        formulario.append("usuario",'"'+GAME.user.ID+'"');
        formulario.append("data", '"'+this.items_seq.join(',')+'"');
        await fetch("SetPotionSeq.php",
        {
            method:"POST",
            body: formulario
        });
        console.log(">>>"+formulario.get("usuario"));
        console.log(">>>"+formulario.get("data"));
    }  
    */
    async UpdateBoard(indx = -1){
        this.page_index = indx == -1 ? this.page_index : indx
        let boards = document.getElementsByClassName("board")
        if (boards[0]){
            let board = boards[0]
            board.innerHTML = ""
            //hacer que si page_index = 0 primeros 0 - 81 [a*81 - (a+1)*81] 
            //hacer que si page_index = 1 primeros 81 - 162
            for (let i = this.page_index * this.max_per_page_board; i < (this.page_index + 1) * this.max_per_page_board; i++) {
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
                board.innerHTML += `<div class=${nam}>${ (nam != 'empty' && this.potionsInfo[i][6] == '1') ?  `<div class="mpwr">${GAME.user.potion_inventory.items_seq[i][1]}</div>` : ''}</div>`
            }
        }
        
        if ( document.getElementById('board-pag')){
            let nav_board = document.getElementById('board-pag').getElementsByClassName('row')[0]
            let prev = document.getElementById('board-pag').getElementsByClassName('icon-prev')[0]
            let next = document.getElementById('board-pag').getElementsByClassName('icon-next')[0]
            let q_pag_potions = Math.ceil(GAME.user.potion_inventory.items_seq.length / GAME.user.potion_inventory.max_per_page_board)
            nav_board.innerHTML = ''
            for (let i = 0; i < q_pag_potions; i++) {
                nav_board.innerHTML += `<button class="icon ${this.page_index == i ? 'active' : ''}" onclick = "GAME.user.potion_inventory.UpdateBoard(${i})" >${i+1}</button>`
            } 
    
            document.getElementById('board-pag').setAttribute('data-qpages',`${q_pag_potions}`)
            if (this.page_index == q_pag_potions - 1) document.getElementById('board-pag').setAttribute('data-currpage',`-1`)
            else if (this.page_index == 0) document.getElementById('board-pag').setAttribute('data-currpage',`1`)
            else document.getElementById('board-pag').setAttribute('data-currpage',`0`)
    
            prev.removeAttribute('onclick')
            next.removeAttribute('onclick')
            if (this.page_index > 0){
                prev.setAttribute('onclick',`GAME.user.potion_inventory.UpdateBoard(${this.page_index -1})`)
            }
            if (q_pag_potions > this.page_index +1 ){
                next.setAttribute('onclick',`GAME.user.potion_inventory.UpdateBoard(${this.page_index +1})`)
            }
        }
        
    }

    async CheckingAvailableToMake(index,quantity = 1){
        let q_potion = await GAME.getMaxPotionCanMake()
        if (this.q_potion_made < 0) return
        document.getElementsByClassName("center")[0].querySelector("span.dat").innerHTML = q_potion - this.q_potion_made;
        if ((q_potion - (this.q_potion_made + quantity)) < 0){
            return false
        }
        for (let i = 0; i < window.GAME.GLOBALPOTIONS[index].ingredients.length; i++) {
            const pair = window.GAME.GLOBALPOTIONS[index].ingredients[i];
            if (window.GAME.user.ingredient_inventory.items[pair[0]] < (pair[1] * quantity))
                return false;
        }
        return true;
    }

    async PowerPotion(ID_POT)
    {
        let TotalPower = 0;
        var cantidad = []; //[[0, 5], [1, 2]]
        var ID_todos = [];

        //[[0, 5], [1, 2],]
        for (let i = 0; i < window.GAME.GLOBALPOTIONS[ID_POT].ingredients.length; i++) {
            var pair = window.GAME.GLOBALPOTIONS[ID_POT].ingredients[i];
            cantidad.push(pair[1]);
            ID_todos.push(pair[0] + 1); //en DB el id de ingredietne comienza en 1
        }

        //[0, 1 , 5, 6]
        var string_id = ID_todos.join(',');
        var precios_DB = "";
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        formulario.append("id_ingredientes", string_id);
        await fetch("GetPotionPower.php", { method:"POST", body: formulario })
        .then(function(response) { if (response.status >= 200 && response.status < 300) { return response.text() }})
        .then(function(_getData) { precios_DB = _getData });
        precios_DB = precios_DB.split(",");
        for (let i = 0; i < cantidad.length; i++) 
        { 
            TotalPower += cantidad[i] * parseFloat(precios_DB[i]).toFixed(2);
        }
        return TotalPower;
    }
}

//tendra que haber un PHP que me da todos las pociones de un usuario sin recsticsion de que tipo
//y luego otra que si me da dependiendo del tipo (recuerde que en el DB es +1 qeu el id en Js)
//
