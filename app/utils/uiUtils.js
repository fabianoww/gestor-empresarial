
exports.showPopup = function(titulo, msg, altura, largura, botoes) {
    
    let elemShield = document.createElement("DIV");
    elemShield.classList.add("popup-shield");
    elemShield.addEventListener("click", (event) => {
        if (event.target.classList == 'popup-shield') {
            event.target.remove();
        }
    });

    let elemPopup = document.createElement("DIV");
    elemPopup.classList.add("popup");
    elemPopup.style.width = largura;
    elemPopup.style.height = altura;
    
    let elemTitulo = document.createElement("P");
    elemTitulo.classList.add("popup-titulo");
    elemTitulo.innerHTML = titulo;
    elemPopup.appendChild(elemTitulo);
    
    let elemMsg = document.createElement("P");
    elemMsg.classList.add("popup-msg");
    elemMsg.innerHTML = msg;
    elemPopup.appendChild(elemMsg);

    let elemBotoes = document.createElement("DIV");
    elemBotoes.classList.add("popup-botoes");

    for (let i = 0; i < botoes.length; i++) {
        const item = botoes[i];
        let botao = document.createElement("DIV");
        botao.innerHTML = item.label;

        if (item.cor) {
            botao.style.backgroundColor = item.cor;
        }

        botao.addEventListener("click", item.cb);
        elemBotoes.appendChild(botao);
    }
    
    elemPopup.appendChild(elemBotoes);
    elemShield.appendChild(elemPopup);
    document.body.appendChild(elemShield); 
}

exports.closePopup = function(event) {
    let elem = event.target;
    
    while (elem.classList != 'popup-shield') {
        elem = elem.parentElement
    }

    if (elem) {
        elem.remove();
    }
}

exports.debounce = function(func, wait) {
    let timer = null;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(func, wait);
    }
}