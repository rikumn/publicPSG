export default class Cauldron{
    constructor(_tittle,_magic_power, _potions_q,_game,_desc ="",_description=""){
        this.game = _game;
        this.tittle = _tittle;
        this.magic_power = _magic_power;
        this.ID = _game.index_cauldron++;
        this.potions_q = _potions_q;
        this.desc = _desc;
        this.description = _description;
    }
}
