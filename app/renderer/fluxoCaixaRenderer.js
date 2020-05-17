const MovimentacaoCaixa = require('../model/movimentacaoCaixa');
const movimentacaoCaixaDao = require('../dao/movimentacaoCaixaDao');
const uiUtils = require('../utils/uiUtils');

let fluxoCaixaTable = null;
let actionButton = null;
let form = null;
let formShield = null;
let formTitle = null;
let inputId = null;
let inputTipo = null;
let inputDesc = null;
let inputCategoria = null;
let inputData = null;
let inputValor = null;
let toggleForm = false;
let filtro = null;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {
    fluxoCaixaTable = document.querySelector('#fluxo-caixa-table');
    actionButton = document.querySelector('#action-btn');
    form = document.querySelector('#fluxo-caixa-form');
    formShield = document.querySelector('#fluxo-caixa-crud-shield');
    formTitle = document.querySelector('#titulo-form');
    inputId = document.querySelector('#fluxo-caixa-id');
    inputTipo = document.getElementsByName('tipoFluxo');
    inputDesc = document.querySelector('#desc');
    inputCategoria = document.querySelector('#categoria');
    inputData = document.querySelector('#data');
    inputValor = document.querySelector('#valor');
    filtro = document.querySelector('#filtro');
    toggleForm = false;

    // Adicionando listeners para elementos da tela
    formShield.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
    filtro.addEventListener('input', uiUtils.debounce(filtrar, 500));

    // Inicializando campos de data
    uiUtils.initDatePicker('.datepicker');

    // Inicializando campos monetários
    let elemsCurrency = document.querySelectorAll('.monetario');
    elemsCurrency.forEach(element => {
        element.addEventListener('keypress', uiUtils.apenasDigitos);
        element.addEventListener('keyup', uiUtils.formatarMonetario);
    });

    // Inicializando autocomplete
    movimentacaoCaixaDao.carregarCategorias((categorias) => {
        let data = {};
        categorias.forEach(categoria => data[categoria] = null);
        M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
            data: data
        });
    })

    atualizarTela();
}

function atualizarTela() {
    // Limpando tabela
    while(fluxoCaixaTable.rows.length > 1) {
        fluxoCaixaTable.deleteRow(1);
    }

    movimentacaoCaixaDao.carregarMovimentacoes(filtro.value, 0, 10, (registro, err) => {
        if (registro) {
            let row = fluxoCaixaTable.insertRow();
            row.insertCell().innerHTML = registro.id;
            row.insertCell().innerHTML = registro.descricao;
            row.insertCell().innerHTML = registro.debito_credito;
            row.insertCell().innerHTML = registro.categoria;
            row.insertCell().innerHTML = registro.data;

            let valorCol = row.insertCell()
            valorCol.innerHTML = uiUtils.converterNumberParaMoeda(registro.valor);
            valorCol.style = 'text-align: right;';
            
            let deleteCol = row.insertCell();
            deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;
            deleteCol.style = 'text-align: center;';
            deleteCol.addEventListener("click", apagar);

            row.addEventListener("click", carregarFormEdicao);
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os fluxos de caixa: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });
}

function exibirFormularioNovo() {
    // Limpando form
    form.reset();
    inputId.value = null;

    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Novo fluxo de caixa';
    formShield.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputTipo[0].focus();
}

function carregarFormEdicao(event) {
    let element = event.target;
    // Limpando form
    form.reset();

    if (element.nodeName == 'I') {
        // No click da lixeira, ignorar a abertura do formulario
        return;
    }
    else if (element.nodeName == 'TD') {
        element = element.parentElement;
    }

    // Setando campos
    inputId.value = element.children[0].textContent;
    inputDesc.value = element.children[1].textContent;
    uiUtils.setRadioValue(inputTipo, element.children[2].textContent)
    inputCategoria.value = element.children[3].textContent;
    inputData.value = element.children[4].textContent;
    inputValor.value = element.children[5].textContent;
    M.updateTextFields();
    
    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Editar fluxo de caixa';
    formShield.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputTipo[0].focus();
    toggleForm = !toggleForm;
}

function inserir(movimentacaoCaixa) {
    
    movimentacaoCaixaDao.salvar(movimentacaoCaixa, (id, err) => {
        if (id) {
            console.debug(`Nova movimentação de caixa inserida com id ${id}`);
            atualizarTela();
        }
        else {
            let msgErro = `Ocorreu um erro ao inserir uma nova movimentação de caixa: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }

        formShield.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    });
}

function atualizar(movimentacaoCaixa) {
    
    movimentacaoCaixaDao.atualizar(movimentacaoCaixa, (ie, err) => {
        if (err) {
            let msgErro = `Ocorreu um erro ao atualizar a movimentação de caixa: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
        else {
            console.debug(`Movimentação de caixa atualizada`);
            atualizarTela();
        }

        formShield.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    });
}

function actionclick() {
    if (!toggleForm) {
        exibirFormularioNovo();
        toggleForm = !toggleForm;
    } else {
        
        // Verificar validade dos campos
        if (validarForm()) {
            let novoFornecedor = inputId.value == null || inputId.value.trim() == '';

            if (novoFornecedor) {
                // Salvar
                inserir(new MovimentacaoCaixa(null, inputDesc.value, document.querySelector('input[name="tipoFluxo"]:checked').value, 
                    inputCategoria.value, inputData.value, uiUtils.converterMoedaParaNumber(inputValor.value)));
            }
            else {
                // Atualizar
                atualizar(new MovimentacaoCaixa(inputId.value, inputDesc.value, document.querySelector('input[name="tipoFluxo"]:checked').value, 
                inputCategoria.value, inputData.value, uiUtils.converterMoedaParaNumber(inputValor.value)));
            }
            toggleForm = !toggleForm;
        }
    }

}

function validarForm() {
    let formValid = true;
    formValid = uiUtils.validarCampo(inputDesc, true) && formValid;
    formValid = uiUtils.validarCampo(inputCategoria, true) && formValid;
    formValid = uiUtils.validarCampo(inputData, true) && formValid;
    formValid = uiUtils.validarCampo(inputValor, true) && formValid;
    
    if (!formValid) {
        M.toast({html: 'Corrija os campos destacados em vermelho!',  classes: 'rounded toastErro'});
        return false;
    }

    return formValid;
}

function fecharFormClick(event) {
    if (event.target.id == this.id) {
        formShield.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        toggleForm = !toggleForm;
    }
}

function filtrar() {
    atualizarTela();
}

function apagar(event) {
    let id = event.target.parentElement.parentElement.children[0].textContent;
    let desc = event.target.parentElement.parentElement.children[1].textContent;
    
    uiUtils.showPopup('Atenção!', `Deseja realmente apagar o fluxo de caixa "${desc}"?`, '200px', '300px', 
        [
            {label: 'Sim', cb: (event) => {
                movimentacaoCaixaDao.remover(id, (id, err) => {
                    if (err) {
                        let msgErro = `Ocorreu um erro ao remover o fluxo de caixa: ${err}`;
                        console.error(msgErro);
                        M.toast({html: msgErro,  classes: 'rounded toastErro'});
                    }
                    else {
                        console.debug(`Fornecedor removido`);
                        atualizarTela();
                    }
                    return;
                });
                uiUtils.closePopup(event);
            }},
            {label: 'Não', cor:'#bfbfbf', cb: uiUtils.closePopup}
        ]);
}