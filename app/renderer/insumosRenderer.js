const Insumo  = require('../model/insumo');
const insumoDao = require('../dao/insumoDao');
const fornecedorDao = require('../dao/fornecedorDao');
const uiUtils = require('../utils/uiUtils');

let insumosTable = null;
let actionButton = null;
let formPanel = null;
let formTitle = null;
let inputDesc = null;
let inputId = null;
let toggleForm = false;
let toggleFormEstoque = false;
let insumoForm = null;
let insumoFormEstoque = null;
let formEstoqueTitle = null;
let formEstoqueShield = null;
let formEstoqueFornecedor = null;
let filtro = null;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {
    insumosTable = document.querySelector('#insumos-table');
    actionButton = document.querySelector('#action-insumo-btn');
    formPanel = document.querySelector('#insumo-form-panel');
    formTitle = document.querySelector('#titulo-form');
    inputDesc = document.querySelector('#desc');
    inputId = document.querySelector('#insumo-id');
    insumoForm = document.querySelector('#insumo-form');
    insumoFormEstoque = document.querySelector('#estoque-form');
    formTitle = document.querySelector('#titulo-estoque-form');
    formEstoqueTitle = document.querySelector('#titulo-estoque-form');
    formEstoqueShield = document.querySelector('#estoque-form-shield');
    formEstoqueFornecedor = document.querySelector('#estoque-fornecedor');
    filtro = document.querySelector('#filtro');
    toggleForm = false;

    // Inicializando campos de data
    let elemsData = document.querySelectorAll('.datepicker');
    M.Datepicker.init(elemsData, {
        format: 'dd/mm/yyyy',
        autoClose: true
    });

    // Inicializando campos select
    var elemsSelect = document.querySelectorAll('select');
    M.FormSelect.init(elemsSelect, {});

    // Inicializando campos monetários
    let elemsCurrency = document.querySelectorAll('.monetario');
    elemsCurrency.forEach(element => {
        element.addEventListener('keypress', uiUtils.apenasDigitos);
        element.addEventListener('keyup', uiUtils.formatarMonetario);
    });

    // Inicializando campos numéricos
    let elemsNumericos = document.querySelectorAll('.numerico');
    elemsNumericos.forEach(element => element.addEventListener('keypress', uiUtils.apenasDigitos));

    // Adicionando listeners para elementos da tela
    formPanel.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
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
            var row = insumosTable.insertRow();
            row.insertCell().innerHTML = registro.id;
            row.insertCell().innerHTML = registro.descricao;
            row.insertCell().innerHTML = 'x';
            row.insertCell().innerHTML = 'x';

            var comprarCol = row.insertCell();
            comprarCol.innerHTML = `<i class="fas fa-cart-plus"></i>`;
            comprarCol.addEventListener("click", comprarInsumo);

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
        // No click da lixeira ou no carrinho, ignorar a abertura do formulario
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

function exibirFormularioEstoqueNovo(id, nome) {
    // Limpando form
    insumoFormEstoque.reset();

    // Exibir formulário de cadastro
    formEstoqueTitle.innerHTML = `Compra de ${nome}`;
    formEstoqueShield.style.display = 'block';

    fornecedorDao.carregarFornecedores(null, null, null, (registro, err) => {
        if (registro) {
            let option = document.createElement("option");
            option.id = registro.id;
            option.text = registro.nome;
            formEstoqueFornecedor.add(option);
            M.FormSelect.init(formEstoqueFornecedor, {});
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os fornecedores: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });
    //inputDesc.focus();
}

function comprarInsumo(event) {
    let element = event.target;

    while (element.nodeName != 'TR') {
        element = element.parentElement;
    }

    let idInsumo = element.children[0].textContent;
    let nomeInsumo = element.children[1].textContent;
    
    if (!toggleFormEstoque) {
        exibirFormularioEstoqueNovo(idInsumo, nomeInsumo);
    } else {
        // Verificar validade dos campos
        /*
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
        */
    }

    toggleFormEstoque = !toggleFormEstoque;


    
}