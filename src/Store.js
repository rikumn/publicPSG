export default class Store{
    //FlameBlue 21:32 / 18.03.2022
                    /*arreglo de precio de items*//*arreglo de cantidad de items*/
    constructor(_game, price_items = [], _stock_items = [], _seller = []){
        this.game = _game;
        //se puede cambiar por un diccionario para mas orden ig //guardado en el id del item
        this.valuable_items = price_items;
        this.stock_items = _stock_items;
        this.seller_id = _seller;
    }

    /**Esta funcion sera llamada por los botones que estan en el item de display*/
    BuyItem(id , quantity = 1 ){
        var item_price = this.valuable_items[id];
        var item_q = this.stock_items[id];
        var id_seller = this.seller_id[id];

        if (item_price == undefined){
            //Si no encuentra el id del item en el stock de venta, 
            // significa que se esta realizando una transaccion fraudulenta
            console.error("the item you are trying to buy is not for sale");
            return;
        }
        
        if (item_q < quantity){
            //si hay suficiente stock para realizar la compra
            console.error("the item you are trying to buy does not have enough stock for sale");
            return;
        }
        
        //verificando que usuario tenga solvencia
        if (this.game.user.balance >= item_price){
            //se paga por el item y luego se le otorga en inventario
            this.game.user.balance -= item_price * quantity;
            //this.game.user.magic_power += item_price * quantity;
            this.stock_items[id] -= quantity;
            //console.log(document.getElementsByClassName('page_content')[1].getElementsByClassName('item')[id])
            let new_elemnt = document.getElementsByClassName('book').ingredients.getElementsByClassName('item')[id].getElementsByClassName('new')[0]
            if (new_elemnt){
                let actual_q = parseInt(new_elemnt.innerHTML.split(' ')[0]) + quantity 
                new_elemnt.innerHTML =actual_q+' NEW'
                new_elemnt.style.display = 'flex'
            }
            let receipt = document.getElementById('receipt')
            let price_ = receipt.getElementsByClassName('price')[id].innerHTML == '-' ? 0 : parseInt(receipt.getElementsByClassName('price')[id].innerHTML)
            let new_ = receipt.getElementsByClassName('new')[id].innerHTML == '-' ? 0 : parseInt(receipt.getElementsByClassName('new')[id].innerHTML)
            receipt.getElementsByClassName('price')[id].innerHTML = price_ + item_price * quantity
            receipt.getElementsByClassName('new')[id].innerHTML = new_ + quantity
            //console.log(id);
            this.game.user.ingredient_inventory.AddItem(id,quantity);
            this.game.items_sold.push(id_seller + "," + id + "," + item_price);
            //console.log(this.game.items_sold);
            //console.log("user bought " + this.game.GLOBALITEMS[id].tittle+ "succesfully");
            //console.log("user has " + this.game.user.ingredient_inventory.GetItemQuantitybyID(id) +" of " + this.game.GLOBALITEMS[id].tittle);
        }
        else{
            //activar notificacion de web
            /*console.log("user no posee el balance necesario para comprar " + this.game.GLOBALITEMS[id].tittle);
            console.log("user balance: " + this.game.user.balance);
            console.log("price tag: "  + item_price);*/
        }
        this.game.UpdateBalanceUI();
        this.UpdateUI();
    }
    
    AddValuelableItem(_id, value, stock, seller){
        this.valuable_items[_id] = value;
        this.stock_items[_id] = stock;
        this.seller_id[_id] = seller;
    }

    CreateUI()
    {
        var arreglos = document.getElementById("store-shelf");
        arreglos.innerHTML = " ";
         //Esta es la cracion de los items de tienda
        for (let i = 0; i < this.valuable_items.length; i++) {
            const item = this.game.GLOBALITEMS[i];
            if (this.valuable_items[i])
            {
                var image_name = item.tittle.toLowerCase().replaceAll(" ",'-').replace("'s","");
                arreglos.innerHTML += `                         
                        <div class="item `+ this.classname +`" data-q=`+ this.stock_items[i] +`>
                            <div class="name title">`+ item.tittle +`</div>
                            <div class="price">`+ this.valuable_items[i] +`</div>
                            <img src="assets/ingredients/i_`+ image_name +`.png" alt="item">
                            <div class="info">`+ this.stock_items[i] +`</div>
                            <button onclick = "window.GAME.tienda.BuyItem(`+ i +`)">
                            <span class="material-icons">shopping_cart</span>
                            `+ this.valuable_items[i] +` <i class="icon-rodo_coin"></i>
                            </button>
                        </div>`;
            }
        }
        
        this.UpdateUI();
    }
    
    
    UpdateUI(){
        
        var itemsindisplay = document.getElementsByClassName(this.classname);
        var display_ind = 0;
        //se va por todos los item
        for (let i = 0; i < this.stock_items.length; i++) {
            //si existe el item
            if (this.valuable_items[i]){
                //se agarra su display
                let item = itemsindisplay[display_ind];
                //y se coloca valores respectivamente
                if ( this.stock_items[i] > 0){
                    
                    //console.log("item.childNodes",item.childNodes);
                    
                    item.setAttribute("data-q",this.stock_items[i]);
                    item.getElementsByClassName("info")[0].innerHTML = this.stock_items[i];
                }
                else 
                {
                    item.setAttribute("data-q", "0");
                    
                    //console.log("item.childNodes",item.childNodes);
                    
                    item.getElementsByClassName("info")[0].innerHTML = 0;
                    //item.childNodes[11].setAttribute("readonly","true");
                    //item.childNodes[11].setAttribute("disabled","true");
                    //jjjj
                }
                //siguiente display
                display_ind++;
            }
            
        }
    }
}
