export default class Inventory{
    constructor(_user, _classnameitem = ""){
        this.user = _user;
        //se guardan "cantidad de item"
        this.items = [];
        this.classname = _classnameitem;
    }

    AddItem(_id, quantity = 1){
        this.items[_id] = this.items[_id] == undefined ? quantity : this.items[_id] + quantity;
        this.UpdateUI();
    }

    RemoveItem(_id,quantity = 1){
        //si usuario posee para remover cierta cantidad
        if (this.items[_id] == undefined || this.items[_id] < quantity){
            console.error("user does not have enough "+ this.user.game.GLOBALITEMS[_id].tittle + " to proceed");
        }
        else
        {
            this.items[_id] -= quantity; 
            this.UpdateUI();
        }
    }

    GetItemQuantitybyID(_id){
       return this.items[_id];
    }
    
    CreateUI(){ }

    UpdateUI(){
        
        var itemsindisplay = document.getElementsByClassName(this.classname);
        for (let i = 0; i < itemsindisplay.length; i++) {
            const item = itemsindisplay[i];
            if(this.items[i]>0){
                item.setAttribute("data-q",this.items[i]);
                item.getElementsByClassName('info')[0].innerHTML = this.items[i] 
            } else{
                item.setAttribute("data-q", "0");
                item.getElementsByClassName('info')[0].innerHTML = 0 
            }
        }
    }

    IsEmpty(){
        for (let i = 0; i < this.items.length; i++) {
            const q_item = this.items[i];
            if (q_item > 0) return false;
        }
        return true;
    }
}