//Primera versión Hostinger 6/04
//import "https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js";
import "https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js";
import "https://unpkg.com/moralis/dist/moralis.js";
//import "https://unpkg.com/moralis@1.5.1/dist/moralis.js";
import "./MMMconection.js";
import Item from "./Item.js";
import Cauldron from "./Cauldron.js";
import Store from "./Store.js";
import User from "./User.js";
import Potion from "./Potion.js";
import Time from "./Time.js";
import ContractStakeCauldronv2 from "./ContractStakeCauldronv2.js";
class Game {
    constructor(user_id="") {
        this.gameVersion = '0.0.3';
        this.q_seller = 0;
        this.q_clients = 0;
        this.index_item = 0;
        this.index_potion = 0;
        this.index_cauldron = 0;
        this.can_buy = "false";
        this.items_sold = [];
        this.offer_accepted = [];
        this.purchased_potions = [];
        
        this.level_limits = [2200,3500,5000,11000,22000,33000,44000];

        this.CheckVersion();

        this.GLOBALITEMS = [new Item("Mandragora Roots",[["antidote", !0], ["Depetrification", !0], ["libido", "increase"]],this,"Good aphrodisiac.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."), new Item("Scorpion double tail",[["herbicide", !0], ["boils", "reduce"]],this,"Highly poisonous.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."), new Item("Blue Apple",[["sleep", "increase"], ["relax", "increase"], ["antidote", !0]],this,"Highly relaxing.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."), new Item("Frog Corn",[["pain", "reduce"], ["inflamation", "reduce"]],this,"Highly medicinal.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."), new Item("Schorl",[["concentration", !0], ["anxiety", "reduce"]],this,"Better vibes.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."), new Item("Citrine",[["depresion", "reduce"], ["anxiety", "reduce"]],this,"Better earnings.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.")];
        this.GLOBALPOTIONS = [new Potion("Best Harvest",[[0, 5], [1, 2]],this,"Great fertilizer.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","agriculture"), new Potion("Happy Cow",[[0, 5], [3, 2]],this,"More cows!","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","ganadery"), new Potion("Ache Shooer",[[1, 5], [4, 2]],this,"Less pain.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","health"), new Potion("Rats Repeller",[[0, 3], [1, 3], [2, 3]],this,"Rats away.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","higiene"), new Potion("Take Over Hangover",[[2, 2], [4, 3], [5, 3]],this,"Reduces hangover.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","other"), new Potion("Lovesickness",[[3, 2], [4, 3], [5, 3]],this,"Anti heartbreak","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","social")]
        this.GLOBALCAULDRONS = [
            new Cauldron("Common",800,2,this,"Normal magic cauldron","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."), 
            new Cauldron("Uncommon",1300,3,this,"Wow! magic cauldron","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."), 
            new Cauldron("Rare",2200,4,this,"Now we are talking","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."),
            new Cauldron("Epic",5500,5,this,"You are really lucky","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."), 
            new Cauldron("Basic",300,1,this,"A pretty tiny bowl","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.")
        ]
        //this.GLOBALPACKS = [new Pack("Basic pack","0.1",[[0, 10], [1, 10], [2, 10], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10]]), new Pack("Cool pack","0.2",[[0, 25], [1, 25], [2, 25], [3, 25], [4, 25], [5, 25], [6, 25], [7, 25], [8, 25], [9, 25]])];
        this.tienda = new Store(this)
    }
    async CheckVersion(){
        let version = await this.getGameVersion();
        version = version[0].split(' ')[2]

        if (this.gameVersion != version){
            document.getElementById('refresh').setAttribute('open',null);
            return;
        }

        if (Moralis.Web3.User.current()) {
            this.setUser(Moralis.Web3.User.current().attributes.ethAddress);
            document.getElementById("session").setAttribute("data-isloged", "true")
        } else {
            document.getElementById("session").setAttribute("data-isloged", "false")
            document.getElementById("settings").setAttribute("open", null)
        }
    }
    async LoginMoralis() {
        if (window.ethereum.networkVersion != 56){
            window.alert("You are not in Main net. Change to main net to login")
            return
        }
        Moralis.Web3.authenticate().then(function(user) {
            user.save();
            location.reload(!0)
        })
    }
    async LogoutMoralis() {
        await Moralis.User.logOut();
       // console.log("logged out");
        location.reload(!0)
    }
    async setUser(user_id) {
        if (user_id != "") {
            await this.loadWeb3();
            const account = await this.getCurrentAccount();
            //console.log (account)
            //console.log (user_id)
            if (window.ethereum.networkVersion != 56) this.LogoutMoralis();
            if (user_id != account.toLowerCase()) this.LogoutMoralis();
            this.user = new User(user_id,this,0);
            let wallet_txt = this.user.ID.slice(0, 5) + "..." + this.user.ID.slice(-4);
            let wllt_arry = document.querySelectorAll("#wallet")
            for (let i = 0; i < wllt_arry.length; i++) {
                const element = wllt_arry[i];
                element.innerHTML = wallet_txt
            }
        }
        let cauldrons__ = await this.getMaxPotionCanMake()
        if (cauldrons__ == 0) {
            window.alert('You cannot play if you do not have cauldrons in game')
            return;
        }
        this.GetDataFromDB()
    }
    async UpdateBalanceUI() {
        if (document.getElementById("q-rodos")) {
            document.getElementById("q-rodos").innerHTML = this.user.balance
        }
    }
    async getCurrentAccount() {
        const accounts = await ethereum.send('eth_requestAccounts');
        return accounts.result[0]
    }
    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable()
        }
    }
    async loadContractStakeCauldron() {
        return await new window.web3.eth.Contract(ContractStakeCauldronv2().abi,ContractStakeCauldronv2().address)
    }
    async loadStakeCauldron() {
        await this.loadWeb3();
        window.contract = await this.loadContractStakeCauldron()
    }
    async getMaxPotionCanMake() {
        await this.loadStakeCauldron();
        const account = await this.getCurrentAccount();
        const array = await window.contract.methods.getMaxPotionCanMake(account).call();
        return array
    }
    async getStakedCauldronRarity() {
        await this.loadStakeCauldron();
        const account = await this.getCurrentAccount();
        const array = await window.contract.methods.getStakedCauldronsRarity(account).call();
        return array
    } 
    async getInventoryLineFromDB() {
        let linea = "";
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        await fetch("GetData.php", {
            method: "POST",
            body: formulario
        }).then(function(response) {
            if (response.status >= 200 && response.status < 300) {
                return response.text()
            }
        }).then(function(_getData) {
            linea = _getData
        });
        return linea
    }
    async GetDataFromDB() {
        var linea = await this.getInventoryLineFromDB();
        let values = linea.split(";");
        let sbalance = values[0];
        let sLineIngredients = values[1];
        let sLineArrayPotions = values[2];
        this.user.balance = parseInt(sbalance);
        let ingtsValues = sLineIngredients.split(",");
        for (let i = 0; i < ingtsValues.length; i++) {
            let tems = ingtsValues[i];
            this.user.ingredient_inventory.items[i] = parseInt(tems)
        }
        let ptnsValues = sLineArrayPotions.split(",");
        for (let i = 0; i < ptnsValues.length; i++) {
            let tems = ptnsValues[i];
            this.user.potion_inventory.items[i] = parseInt(tems)
        }
        //await this.user.potion_inventory.FetchPotionSeq();
        await this.GetMagicPower();
       // console.log(this.user.tagsq)
        this.user.tagsq = await this.GetTagQ();
       // console.log(this.user.tagsq)
        this.updateMagicPowerUI();
        this.user.ingredient_inventory.CreateUI();
        this.user.potion_inventory.CreateUI();
        this.UpdateBalanceUI();
        if (typeof GameDataSet === "function")
            GameDataSet();
        if (typeof UpdateShelfState === "function")
            UpdateShelfState();
        if (typeof UpdateCauldronsPopup === "function")
            UpdateCauldronsPopup()
            
    }

    async GetTagQ(){
        let data = 0;
        await fetch("GetTagsQ.php?usuario="+GAME.user.ID+"",{
            method:"GET",
        })
        .then(function(response){
            if (response.status >= 200 && response.status < 300) {
                return response.text();
            }
        })
        .then(function(_getData){
            //console.log("how many clients left? = " + _getData);
            if (_getData == "" || _getData == "no se encontro el usuario!"){
                // 
            }else{
                data = parseInt(_getData);
            }
        });
        return data;
    }

    /*async GetMagicPower() {
        let linea = "";
        await fetch("GetMagicPower2.php?usuario='" + this.user.ID + "'", {
            method: "GET",
        }).then(function(response) {
            if (response.status >= 200 && response.status < 300) {
                return response.text()
            }
        }).then(function(_getData) {
            linea = _getData
        });
        console.log(linea)
        this.user.magic_power = parseInt(linea) ? parseInt(linea) : 0
    }*/
    async GetMagicPower(){
        var magi_potion = await this.GetMagicPowerPotions();
        var magi_cauldron = await this.GetMagicPowerCauldron();
        this.user.magic_power = magi_potion + magi_cauldron;
    }
    async GetMagicPowerPotions() {
        let linea = "";
        var formulario = new FormData();
        formulario.append("usuario", await GAME.getCurrentAccount()); //formulario.append("usuario", GAME.user.ID);
        await fetch("GetMagicPower2.php", {
            method: "POST",
            body: formulario
        }).then(function(response) {
            if (response.status >= 200 && response.status < 300) {
                return response.text()
            }
        }).then(await async function(_getData) {
            if (_getData == 'no se encontro pociones!'){
                //crear y guardar pociones en tabla dependiendo del potion Seq
                //await GAME.user.potion_inventory.CreatePotionTable()
            }
            linea = _getData
        });
        //console.log(linea)
        return parseInt(linea) ? parseInt(linea) : 0
    }
    async GetMagicPowerCauldron() {
        let power = 0;
        var ca = await this.getStakedCauldronRarity();
        for (let i = 0; i < ca.length; i++) {
            if (ca[i] != 0){
                power+= GAME.GLOBALCAULDRONS[ca[i]- 1].magic_power;
            }
        }
        //console.log(power)
        return power
    }
    EncodeToLineInventory() {
        var linea = this.user.balance;
        linea += ";";
        let numMaxItems = this.user.game.GLOBALITEMS.length
        for (let i = 0; i < numMaxItems; i++) {
            let itemQty = this.user.ingredient_inventory.items[i];
            let iqty = itemQty == undefined ? 0 : itemQty;
            linea += iqty;
            if (i < numMaxItems - 1) {
                linea += ","
            }
        }
        linea += ";";
        let NumMaxPotion = this.user.game.GLOBALPOTIONS.length;
        for (let i = 0; i < NumMaxPotion; i++) {
            let potionQty = this.user.potion_inventory.items[i];
            let pqty = potionQty == undefined ? 0 : potionQty;
            linea += pqty
            if (i < NumMaxPotion - 1) {
                linea += ","
            }
        }
        return linea
    }
    async CanBuy() {
        const account = await this.getCurrentAccount();
        let canbuy = !1;
        var formulario = new FormData();
        formulario.append("usuario", account);
        await fetch("GetCanBuy.php", {
            method: "POST",
            body: formulario
        }).then(function(response) {
            if (response.status >= 200 && response.status < 300) {
                return response.text()
            }
        }).then(function(_getData) {
            if (_getData == "" || _getData == "no se encontro el usuario!" || _getData == undefined) {
                canbuy = 1
            } else {
                canbuy = _getData
            }
            return canbuy
        });
        this.can_buy = canbuy;
        if (canbuy == 1) {
            canbuy = !0
        } else if (canbuy == 0) {
            canbuy = !1
        }
        return canbuy
    }
    async CanMake() {
        const account = await this.getCurrentAccount();
        let canmake = !1;
        var formulario = new FormData();
        formulario.append("usuario", account);
        await fetch("GetCanMake.php", {
            method: "POST",
            body: formulario
        }).then(function(response) {
            if (response.status >= 200 && response.status < 300) {
                return response.text()
            }
        }).then(function(_getData) {
            if (_getData == "" || _getData == "no se encontro el usuario!" || _getData == undefined) {
                canmake = 1
            } else {
                canmake = _getData
            }
            return canmake
        });
        this.can_make = canmake;
        if (canmake == 1) {
            canmake = !0
        } else if (canmake == 0) {
            canmake = !1
        }
        return canmake
    }
    async CanSell() {
        const account = await this.getCurrentAccount();
        let cansell = !1;
        var formulario = new FormData();
        formulario.append("usuario", account);
        await fetch("GetCanSell.php", {
            method: "POST",
            body: formulario
        }).then(function(response) {
            if (response.status >= 200 && response.status < 300) {
                return response.text()
            }
        }).then(function(_getData) {
            if (_getData == "" || _getData == "no se encontro el usuario!" || _getData == undefined) {
                cansell = 1
            } else {
                cansell = _getData
            }
            return cansell
        });
        this.can_sell = cansell;
        if (cansell == 1) {
            cansell = !0
        } else if (cansell == 0) {
            cansell = !1
        }
        return cansell
    }
    ToIndex() {
        if (location.href != "index.html")
            location.href = "index.html"
    }
    GetLog() {
       // console.log("corre")
    }
    RandomsInArrayNonRepeting(array, result_length=1, start = 0) {
        var array_copy = []
        for (let i = start; i < array.length; i++) {
            array_copy.push(array[i])
        }
        var array_toshow = []
        for (let i = 0; i < result_length; i++) {
            var indice = Math.floor(Math.random() * (array_copy.length - 1));
            array_toshow.push(array_copy[indice]);
            array_copy.splice(indice, 1)
        }
        return array_toshow
    }

    //beneficios y ahora limite de niveels 

    updateMagicPowerUI(){
        let magicPower = this.user.magic_power;
        //console.log(magicPower);
        if(document.getElementById("q-mpwr")){
            document.getElementById("q-mpwr").innerHTML = `${Math.round(magicPower)}`
        }        
        this.updateMagicPowerProgress();
    }

    updateTagsQUI(){
        document.getElementById('inv-label').getElementsByClassName('info')[0].innerHTML = GAME.user.tagsq;
    }

    updateMagicPowerProgress(){
        var next_limite = 0;
        let magicPower = this.user.magic_power;
        let lv = 0;
        for (let i = 0; i < this.level_limits.length; i++) {
            if (this.level_limits[i] > magicPower){
                next_limite = this.level_limits[i];
                lv = i;
                break;
            }
        }

        if(document.getElementById("magic-pwr").querySelector('div.row').querySelector('strong')){
            document.getElementById("magic-pwr").querySelector('div.row').querySelector('strong').innerHTML = 'Lv.' + lv;
        }

        if(document.getElementsByClassName("progress")[0]){
            let dif = this.level_limits[lv] - (lv > 0 ? this.level_limits[lv-1] : 0)
            let dif1 = magicPower - (lv > 0 ? this.level_limits[lv-1] : 0)
            var percent = ((100 * dif1)/dif);
            document.getElementsByClassName("progress")[0].setAttribute('style',`width:${percent}%`);
        }
    }

    
    async getGameVersion(){
        return new Promise(function(myResolve, myReject) 
        { 
                fetch("getGameVersion.php",{
                method:"GET",
                })
                .then(function(response){
                    if (response.status >= 200 && response.status < 300) {
                        return response.text();
                    }
                })
                .then(function(_getData){
                    let string_templates = _getData.replaceAll('\r','')
                    string_templates = string_templates.split('\n')
                    myResolve(string_templates);
                });
        });
    }    
}

if (!window.GAME)
    window.GAME = new Game();
async function updateClock(time) {
    let utime = time.timestamp;
    let dayregistered = time.dayregistered;
    let interval = time.interval;
    let restoTime = utime % interval;
    let restoDayregistered = dayregistered % interval;
    //let dayspassed = ((utime - restoTime) - (dayregistered - restoDayregistered)) / interval;
    var taimnow = new Date(new Date().getTime());
    let dayspassed = Math.floor((taimnow.getTime() - Date.UTC(2022, 2,13))/86400000);
    let nextdec = Math.ceil(taimnow.getUTCMinutes() / 10) * 10
     
    //var countDownDate = Date.UTC( taimnow.getUTCFullYear(), taimnow.getUTCMonth(), taimnow.getUTCDate(),taimnow.getUTCHours(),nextdec); //Cada 10 min
    var countDownDate = Date.UTC(taimnow.getUTCFullYear(), taimnow.getUTCMonth(), taimnow.getUTCDate() + 1); //Diario
    let t = countDownDate - taimnow;
    let dad = new Date(t)
    t /= 1000
    let date = new Date(time.timestamp);
    let h = taimnow.getUTCHours() < 10 ? '0' + taimnow.getUTCHours() : taimnow.getUTCHours();
    let m = taimnow.getUTCMinutes() < 10 ? '0' + taimnow.getUTCMinutes() : taimnow.getUTCMinutes();
    let s = new Intl.DateTimeFormat(undefined,{
        second: '2-digit'
    }).format(date);
    if (document.getElementById("dtime")) {
        document.getElementById("dt-time").innerHTML = `${h}:${m}`
        document.getElementById("dt-day").innerHTML = `${dayspassed}`
    }
    if (document.getElementById("time_left")) {
        document.getElementById("time_left").innerHTML = `${Math.floor(t / 3600)}:${dad.getMinutes()}:${dad.getSeconds()}`          
    }
    if (t <= 1 || t >= 86397) {
        location.reload(!0)
    } 
    
}
let time = new Time()
GenerateTime()
async function GenerateTime() {
    let a = await time.initialize();
    setInterval(function() {
        a.AddSecond();
        a.AddDayIf();
        updateClock(a)
    }, 1000)
}

window.ethereum.on('accountsChanged', function (accounts) {
    if (Moralis.Web3.User.current().attributes.ethAddress != accounts[0].toLowerCase()) GAME.LogoutMoralis();
})

window.ethereum.on('chainChanged', function(networkId){
      location.reload(true)
    });

if (typeof Gameloaded === "function")
    {
        Gameloaded(window.GAME)
    }

