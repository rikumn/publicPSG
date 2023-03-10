let cauldrons_panel = document.querySelector('#cauldrons')
let cauldrons_maxpot = cauldrons_panel.querySelector('div.info')
let cauldrons_items = cauldrons_panel.getElementsByClassName('row items')[0]

//hello world
async function UpdateCauldronsPopup(){
    let max = await GAME.getMaxPotionCanMake()
    cauldrons_maxpot.innerHTML = max + '<i class="icon-potion"></i> PER DAY'
    cauldrons_items.innerHTML = ''
    let cauldrons__ = await GAME.getStakedCauldronRarity()
    //console.log(cauldrons__);
    
    if (cauldrons__.length == 0) return;
    
    for (let i = 0; i < cauldrons__.length; i++) {
        //console.log(cauldrons__[i]);
        if (cauldrons__[i] != 0){
        let cldrn = GAME.GLOBALCAULDRONS[cauldrons__[i]-1]
        cauldrons_items.innerHTML +=
                `<div class="item c-${cldrn.tittle == 'Basic' ? 'uncommon': cldrn.tittle.toLowerCase()}">
                        <img src="assets/cauldrons/export-${cldrn.tittle.toLowerCase()}.gif" alt="cauldron">
                      <div class="name">`+cldrn.tittle+`</div>
                      <p>`+cldrn.potions_q+`<i class="icon-potion"></i></p>`+`<div class="mpwr">`+cldrn.magic_power+`</div>
                </div>`
        }
    }    
}