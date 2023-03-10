let pythoness_dropdown = document.getElementById('pythoness')
let pythoness_btn = document.getElementById('btn-pythoness')
pythoness_btn.setAttribute("onclick","pythoness_UpdateState()")
let pythoness_state = true;

let pythoness_HTMLbtnactive = `
<span class="material-icons">expand_less</span>
`

let pythoness_HTMLbtninactive = `
<i class="icon-pythoness"></i>
<span class="hide-sm">Pythoness</span>
<span class="material-icons">expand_more</span>
`

//let pythoness_info = [7,6,6,8,8,8]
//let pythoness_info = [6,7,5,7,9,9]
//let pythoness_info = [6,6,7,8,8,9]
//let pythoness_info = [7,7,6,7,9,7]
//let pythoness_info = [8,7,7,6,7,8]
//let pythoness_info = [8,6,6,6,8,9]
//let pythoness_info = [8,8,7,6,7,6]
let pythoness_info = [6,9,6,7,8,8]

function pythoness_UpdateState(){
    pythoness_state = !pythoness_state
    pythoness_dropdown.setAttribute("style", pythoness_state ? "display:block" : "display:none")
    pythoness_btn.innerHTML = pythoness_state ? pythoness_HTMLbtnactive : pythoness_HTMLbtninactive
    if (pythoness_state){
        pythoness_UpdateInfo()
    }
}

function pythoness_UpdateInfo(){
    let itemes = pythoness_dropdown.getElementsByClassName('item')
    for (let i = 0; i < itemes.length; i++) {
        const element = itemes[i];
        element.getElementsByClassName('price')[0].innerHTML = pythoness_info[i];
    }
}

if (pythoness_state) pythoness_UpdateState()
