import IngredientsInventory from "./IngredientsInventory.js";
import PotionsInventory from "./PotionsInventory.js";

export default class User {
    constructor(_id, _game, _balance){
        //console.log("creando class USER");
        this.game = _game;
        this.ID = _id;
        this.balance = _balance;
        this.ingredient_inventory =  new IngredientsInventory(this,"InventoryIngredient");   
        this.potion_inventory =  new PotionsInventory(this,"InventoryPotion");
        this.magic_power = 0
        this.tagsq = 0;
    }
}