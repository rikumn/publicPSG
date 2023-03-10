class ShelfState {
    // Create new instances of the same class as static attributes
    static ingredients = new ShelfState("ingredients")
    static potions = new ShelfState("potions")
    static cauldrons = new ShelfState("cauldrons")
    static none = new ShelfState("")
  
    constructor(name) {
      this.name = name
    }
}

//GAME.user.ingredient_inventory.CreateUI();
//GAME.user.potion_inventory.CreateUI();
let shelf_state = ShelfState.none
let shelf_dropdown = document.getElementsByClassName('shelf')[0]
let shelf_btns = shelf_dropdown.querySelectorAll('button')
shelf_btns[0].setAttribute('onclick', "UpdateShelfState(ShelfState.ingredients)")
shelf_btns[1].setAttribute('onclick', "UpdateShelfState(ShelfState.potions)")
//console.log(shelf_dropdown)

function UpdateShelfState(new_state = ShelfState.none){
     shelf_state = new_state;
    for (let i = 0; i < shelf_btns.length; i++) {
      shelf_btns[i].classList.remove('active');;
    }
    let shelf_ingre = document.getElementsByClassName('book').ingredients
    shelf_ingre.setAttribute('style',"display:none")
    let shelf_potions = document.getElementsByClassName('book').potions
    shelf_potions.setAttribute('style',"display:none")
    
    switch (shelf_state) {
      case ShelfState.ingredients:
        shelf_ingre.setAttribute('style',"display:block")
        //GAME.user.ingredient_inventory.CreateUI();
        shelf_btns[0].classList.add('active');
        shelf_btns[0].setAttribute('onclick', "UpdateShelfState(ShelfState.none)")
        shelf_btns[1].setAttribute('onclick', "UpdateShelfState(ShelfState.potions)")
        break;
      case ShelfState.potions:
        shelf_potions.setAttribute('style',"display:block")
        //GAME.user.potion_inventory.CreateUI();
        shelf_btns[1].classList.add('active');
        shelf_btns[1].setAttribute('onclick', "UpdateShelfState(ShelfState.none)")
        shelf_btns[0].setAttribute('onclick', "UpdateShelfState(ShelfState.ingredients)")
        break;
      case ShelfState.cauldrons:
      
        break;
      case ShelfState.none:
        shelf_btns[1].setAttribute('onclick', "UpdateShelfState(ShelfState.potions)")
        shelf_btns[0].setAttribute('onclick', "UpdateShelfState(ShelfState.ingredients)")
        break;
      default:
        break;
    }
}
