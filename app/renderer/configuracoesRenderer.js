const uiUtils = require('../utils/uiUtils');
const Configuracoes = require('../model/configuracoes');
const configuracoesDao = require('../dao/configuracoesDao');


let saveButton = null;

let inputValorInicial = null;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {
    saveButton = document.querySelector('#salvar-btn');
    inputValorInicial = document.querySelector('#valor-inicial-cc');

    // Adicionando listeners para elementos da tela
    saveButton.addEventListener('click', salvarConfiguracoes);

    // Inicializando campos monetários
    let elemsCurrency = document.querySelectorAll('.monetario');
    elemsCurrency.forEach(element => {
        element.addEventListener('keypress', uiUtils.apenasDigitos);
        element.addEventListener('keyup', uiUtils.formatarMonetario);
    });

    atualizarTela();
}

function atualizarTela() {

    configuracoesDao.carregarConfiguracoes((config) => {
        inputValorInicial.value = uiUtils.converterNumberParaMoeda(config.valorInicial);
        M.updateTextFields();
        inputValorInicial.focus();
    });
}

function salvarConfiguracoes() {
    
    if (validarForm()) {
        configuracoesDao.salvar(new Configuracoes(uiUtils.converterMoedaParaNumber(inputValorInicial.value).valueOf()), (sucessos, falhas) => {
            if (falhas.length > 0) {
                M.toast({html: `Houve falha na gravação dos seguintes campos: ${falhas}`,  classes: 'rounded toastErro'});
            } else {
                M.toast({html: 'Configurações salvas com sucesso!',  classes: 'rounded toastSucesso'});
            }
        });
    }
}

function validarForm() {
    let formValid = true;
    formValid = uiUtils.validarCampo(inputValorInicial, true) && formValid;
    
    if (!formValid) {
        M.toast({html: 'Corrija os campos destacados em vermelho!',  classes: 'rounded toastErro'});
        return false;
    }

    return formValid;
}