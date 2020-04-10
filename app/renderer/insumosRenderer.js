const Insumo  = require('../model/insumo');
const insumoDao = require('../dao/insumoDao');
const uiUtils = require('../utils/uiUtils');

let insumosTable = null;
let actionButton = null;
//let filterButton = null;
let formPanel = null;
let formTitle = null;
let inputDesc = null;
let inputId = null;
let toggleForm = false;
let insumoForm = null;
//let filtroPanel = null;
let filtro = null;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {
    insumosTable = document.querySelector('#insumos-table');
    actionButton = document.querySelector('#action-insumo-btn');
    //filterButton = document.querySelector('#filter-insumo-btn');
    formPanel = document.querySelector('#insumo-form-panel');
    formTitle = document.querySelector('#titulo-form');
    inputDesc = document.querySelector('#desc');
    inputId = document.querySelector('#insumo-id');
    insumoForm = document.querySelector('#insumo-form');
    //filtroPanel = document.querySelector('#insumo-filtro-panel');
    filtro = document.querySelector('#filtro');
    toggleForm = false;


    // Adicionando listeners para elementos da tela
    formPanel.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
    //filterButton.addEventListener('click', filtroClick);
    filtro.addEventListener('input', uiUtils.debounce(filtrar, 500));

    atualizarTela();
}

function atualizarTela() {
    // Limpando tabela
    while(insumosTable.rows.length > 1) {
        insumosTable.deleteRow(1);
    }

    insumoDao.carregarInsumos(filtro.value, 0, 10, (registro, err) => {
        if (registro) {
            let id = registro.id;
            let desc = registro.descricao;
            var row = insumosTable.insertRow();
            var idCol = row.insertCell();
            idCol.innerHTML = id;
            var descCol = row.insertCell();
            descCol.innerHTML = desc;
            var deleteCol = row.insertCell();
            deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;

            deleteCol.addEventListener("click", apagar);
            row.addEventListener("click", carregarFormEdicao);
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os insumos: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });
}

function exibirFormularioNovo() {
    // Limpando form
    insumoForm.reset();

    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Novo insumo';
    formPanel.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputDesc.focus();
}

function carregarFormEdicao(event) {
    let element = event.target;
    
    // Limpando form
    insumoForm.reset();

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
    
    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Editar insumo';
    formPanel.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputDesc.focus();
    toggleForm = !toggleForm;
}

function inserir(novoInsumo) {
    insumoDao.salvar(novoInsumo, (id, err) => {
        if (id) {
            console.debug(`Novo insumo inserido com id ${id}`);
            atualizarTela();
        }
        else {
            let msgErro = `Ocorreu um erro ao inserir um novo insumo: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }

        formPanel.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    });
}

function atualizar(insumo) {
    insumoDao.atualizar(insumo, (ie, err) => {
        if (err) {
            let msgErro = `Ocorreu um erro ao atualizar um insumo: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
        else {
            console.debug(`Insumo atualizado`);
            atualizarTela();
        }

        formPanel.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    });
}

function actionclick() {
    if (!toggleForm) {
        exibirFormularioNovo();
    } else {
        // Verificar validade dos campos
        if (inputDesc.checkValidity()) {
            let novoInsumo = inputId.value == null || inputId.value.trim() == '';

            if (novoInsumo) {
                // Salvar
                inserir(new Insumo(null, inputDesc.value));
            }
            else {
                // Atualizar
                atualizar(new Insumo(inputId.value, inputDesc.value));
            }
        }
        else {
            M.toast({html: 'Corrija os campos destacados em vermelho!',  classes: 'rounded toastErro'});
            return;
        }
    }

    toggleForm = !toggleForm;
}

function fecharFormClick(event) {
    if (event.target.id == this.id) {
        formPanel.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        toggleForm = !toggleForm;
    }
}

function filtrar() {
    atualizarTela();
}

/*
function filtroClick() {
    filtroPanel.style.display = 'block';
}
*/

function apagar(event) {
    let id = event.target.parentElement.parentElement.children[0].textContent;
    let desc = event.target.parentElement.parentElement.children[1].textContent;
    
    uiUtils.showPopup('Atenção!', `Deseja realmente apagar o insumo ${desc}?`, '200px', '300px', 
        [
            {label: 'Sim', cb: (event) => {
                insumoDao.remover(id, (id, err) => {
                    if (err) {
                        let msgErro = `Ocorreu um erro ao remover o insumo: ${err}`;
                        console.error(msgErro);
                        M.toast({html: msgErro,  classes: 'rounded toastErro'});
                    }
                    else {
                        console.debug(`Insumo removido`);
                        atualizarTela();
                    }
                    return;
                });
                uiUtils.closePopup(event);
            }},
            {label: 'Não', cor:'#bfbfbf', cb: uiUtils.closePopup}
        ]);
}