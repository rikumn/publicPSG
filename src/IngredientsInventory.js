import Inventory from "./Inventory.js";

export default class IngredientsInventory extends Inventory{
    
    constructor(_user, _classnameitem){
        super(_user, _classnameitem);
    }

    //should be call only when the html has a invenotry page_content
    CreateUI()
    {
        var page = document.getElementsByClassName("book").ingredients.getElementsByClassName('row items')[0];
        page.innerHTML = ""
        for (let i = 0; i < this.user.game.GLOBALITEMS.length; i++) {
            const item = this.user.game.GLOBALITEMS[i];
            var q_user_item = this.items[i] == undefined ? 0 : this.items[i];
            var image_name = item.tittle.toLowerCase().replaceAll(" ",'-');
            
            page.innerHTML +=`
            <div class="btn item `+ this.classname +`" data-q=`+q_user_item +`>
                <div class="name">`+ item.tittle +`</div>
                <div class="new" style="display:none">0 NEW</div>
                <img src="assets/ingredients/i_`+ image_name +`.png" alt="item">
                <div class="info">`+q_user_item +`</div>
            </div>
             `;
        }
     
        this.UpdateUI();
    }
    
}