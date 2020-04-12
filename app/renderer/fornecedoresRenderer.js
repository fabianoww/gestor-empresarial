const Fornecedor = require('../model/fornecedor');
const fornecedorDao = require('../dao/fornecedorDao');
const uiUtils = require('../utils/uiUtils');
const maskInput = require('mask-input');

let fornecedoresTable = null;
let actionButton = null;
let formPanel = null;
let formTitle = null;
let inputId = null;
let inputNome = null;
let inputTipo = null;
let inputOnline = null;
let inputTelefone = null;
let inputEmail = null;
let inputSite = null;
let toggleForm = false;
let fornecedorForm = null;
let filtro = null;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {
    fornecedoresTable = document.querySelector('#fornecedores-table');
    actionButton = document.querySelector('#action-fornecedor-btn');
    formPanel = document.querySelector('#fornecedor-crud-shield');
    formTitle = document.querySelector('#titulo-form');
    inputId = document.querySelector('#fornecedor-id');
    inputNome = document.querySelector('#nome');
    inputTipo = document.querySelector('#tipo');
    inputOnline = document.getElementsByName('tipoFornecedor');
    inputTelefone = document.querySelector('#telefone');
    inputEmail = document.querySelector('#email');
    inputSite = document.querySelector('#site');
    fornecedorForm = document.querySelector('#fornecedor-form');
    filtro = document.querySelector('#filtro');
    toggleForm = false;

    // Adicionando listeners para elementos da tela
    formPanel.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
    filtro.addEventListener('input', uiUtils.debounce(filtrar, 500));

    // Inicializando campos campos
    const telefoneMask = new maskInput.default(document.querySelector('#telefone'), {
        mask: '(00) 0000-0000',
        alwaysShowMask: true,
        maskChar: '0',
    });
    
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, {});

    atualizarTela();
}

function atualizarTela() {
    // Limpando tabela
    while(fornecedoresTable.rows.length > 1) {
        fornecedoresTable.deleteRow(1);
    }

    fornecedorDao.carregarFornecedores(filtro.value, 0, 10, (registro, err) => {
        if (registro) {
            var row = fornecedoresTable.insertRow();
            row.insertCell().innerHTML = registro.id;
            row.insertCell().innerHTML = registro.nome;
            row.insertCell().innerHTML = registro.tipo;
            row.insertCell().innerHTML = registro.online == 1 ? 'Sim' : 'Não';
            row.insertCell().innerHTML = registro.telefone;
            row.insertCell().innerHTML = registro.email;
            row.insertCell().innerHTML = registro.site;
            var deleteCol = row.insertCell();
            deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;

            deleteCol.addEventListener("click", apagar);
            row.addEventListener("click", carregarFormEdicao);
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os fornecedores: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });
}

function exibirFormularioNovo() {
    // Limpando form
    fornecedorForm.reset();

    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Novo fornecedor';
    formPanel.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputNome.focus();
}

function carregarFormEdicao(event) {
    let element = event.target;
    // Limpando form
    fornecedorForm.reset();

    if (element.nodeName == 'I') {
        // No click da lixeira, ignorar a abertura do formulario
        return;
    }
    else if (element.nodeName == 'TD') {
        element = element.parentElement;
    }

    // Setando campos
    inputId.value = element.children[0].textContent;
    inputNome.value = element.children[1].textContent;
    inputTipo.value = element.children[2].textContent;
    uiUtils.setRadioValue(inputOnline, element.children[3].textContent ==  "Sim" ? '1' : '0')
    inputTelefone.value = element.children[4].textContent;
    inputEmail.value = element.children[5].textContent;
    inputSite.value = element.children[6].textContent;
    M.updateTextFields();
    
    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Editar fornecedor';
    formPanel.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputNome.focus();
    toggleForm = !toggleForm;
}

function inserir(novoFornecedor) {
    
    fornecedorDao.salvar(novoFornecedor, (id, err) => {
        if (id) {
            console.debug(`Novo fornecedor inserido com id ${id}`);
            atualizarTela();
        }
        else {
            let msgErro = `Ocorreu um erro ao inserir um novo fornecedor: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }

        formPanel.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    });
    
}

function atualizar(fornecedor) {
    fornecedorDao.atualizar(fornecedor, (ie, err) => {
        if (err) {
            let msgErro = `Ocorreu um erro ao atualizar um fornecedor: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
        else {
            console.debug(`Fornecedor atualizado`);
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
        if (inputNome.checkValidity() && inputTipo.value != '' && inputTelefone.checkValidity() && inputEmail.checkValidity() && inputSite.checkValidity()) {
            let novoFornecedor = inputId.value == null || inputId.value.trim() == '';

            if (novoFornecedor) {
                // Salvar
                inserir(new Fornecedor(null, inputNome.value, inputTipo.value, uiUtils.getRadioValue(inputOnline), inputTelefone.value, inputEmail.value, inputSite.value));
            }
            else {
                // Atualizar
                atualizar(new Fornecedor(inputId.value, inputNome.value, inputTipo.value, uiUtils.getRadioValue(inputOnline), inputTelefone.value, inputEmail.value, inputSite.value));
            }
        }
        else {
            if (inputTipo.value == '') {
                M.toast({html: 'Selecione um tipo de fornecedor!',  classes: 'rounded toastErro'});
            }
            else {
                M.toast({html: 'Corrija os campos destacados em vermelho!',  classes: 'rounded toastErro'});
            }

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

function apagar(event) {
    let id = event.target.parentElement.parentElement.children[0].textContent;
    let nome = event.target.parentElement.parentElement.children[1].textContent;
    
    uiUtils.showPopup('Atenção!', `Deseja realmente apagar o fornecedor ${nome}?`, '200px', '300px', 
        [
            {label: 'Sim', cb: (event) => {
                fornecedorDao.remover(id, (id, err) => {
                    if (err) {
                        let msgErro = `Ocorreu um erro ao remover o fornecedor: ${err}`;
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