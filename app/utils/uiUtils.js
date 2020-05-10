
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

exports.getRadioValue = function(radioElements) {
    for (var i = 0, length = radioElements.length; i < length; i++) {
        if (radioElements[i].checked) {
          return radioElements[i].value;
        }
    }

    return null;
}

exports.setRadioValue = function(radioElements, novoValor) {
    for (var i = 0, length = radioElements.length; i < length; i++) {
        if (radioElements[i].value == novoValor) {
          radioElements[i].checked = true;
          return;
        }
    }
}

exports.apenasDigitos = function(event) {
    if (Number.isNaN(Number.parseInt(event.key))) {
        event.preventDefault();
    }
}

exports.formatarMonetario = function(event) {
    // Removendo todos os caracteres não numéricos
    let valor = event.target.value.replace(/\D/g,'');

    if (valor == '') {
        event.target.value = '';
        return;
    }

    valor = valor.length > 2 ? valor.slice(0, valor.length-2) + '.' + valor.slice(valor.length-2, valor.length) : '.' + (valor.length == 1 ? '0' + valor : valor);

    let formatter = new Intl.NumberFormat([], {
        style: 'currency',
        currency: 'BRL'
      });
    
    event.target.value = formatter.format(valor);
}

exports.converterNumberParaMoeda = function (num) {
    let formatter = new Intl.NumberFormat([], {
        style: 'currency',
        currency: 'BRL'
      });
    
    return formatter.format(num);
}

exports.converterMoedaParaNumber = function(valor) {
    if (!valor) {
        return null;
    }

    valor = valor.replace(/\D/g,'');
    valor = valor.length > 2 ? valor.slice(0, valor.length-2) + '.' + valor.slice(valor.length-2, valor.length) : '.' + (valor.length == 1 ? '0' + valor : valor);
    return new Number(valor);
}

exports.validarCampo = function(campo, obrigatorio) {

    let campoSelect = campo.nodeName == 'SELECT';
    let campoAlvo = campoSelect ? campo.parentElement.children[0] : campo;
    
    if (!campo.checkValidity() || (obrigatorio && campo.value == '')) {
        campoAlvo.classList.add('invalid');
        return false;
    } 
    else {
        campoAlvo.classList.remove("invalid");
        return true;
    }
}