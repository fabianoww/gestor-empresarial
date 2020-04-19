const Insumo = require('../model/insumo');
const CompraInsumo = require('../model/compraInsumo');
const insumoDao = require('../dao/insumoDao');
const fornecedorDao = require('../dao/fornecedorDao');
const uiUtils = require('../utils/uiUtils');

let insumosTable = null;
let actionButton = null;
let filtro = null;

let toggleForm = false;
let insumoForm = null;
let formShield = null;
let formTitle = null;
let inputId = null;
let inputDesc = null;

let toggleFormEstoque = false;
let insumoFormEstoque = null;
let formEstoqueShield = null;
let formEstoqueTitle = null;
let inputEstoqueInsumoId = null;
let inputEstoqueFornecedor = null;
let inputEstoqueQtde = null;
let inputEstoqueValor = null;
let inputEstoqueFrete = null;
let inputEstoqueParcelas = null;
let inputEstoqueDataCompra = null;
let inputEstoqueDataDebito = null;
let inputEstoqueDataEntrega = null;

let currencyFormatter = null;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {
    insumosTable = document.querySelector('#insumos-table');
    actionButton = document.querySelector('#action-insumo-btn');
    formShield = document.querySelector('#insumo-form-shield');
    formTitle = document.querySelector('#titulo-form');
    inputDesc = document.querySelector('#desc');
    inputId = document.querySelector('#insumo-id');
    insumoForm = document.querySelector('#insumo-form');
    insumoFormEstoque = document.querySelector('#estoque-form');
    formEstoqueTitle = document.querySelector('#titulo-estoque-form');
    formEstoqueTitle = document.querySelector('#titulo-estoque-form');
    formEstoqueShield = document.querySelector('#estoque-form-shield');
    inputEstoqueInsumoId = document.querySelector('#estoque-insumo-id');
    inputEstoqueFornecedor = document.querySelector('#estoque-fornecedor');
    inputEstoqueQtde = document.querySelector('#estoque-qtde-itens');
    inputEstoqueValor = document.querySelector('#estoque-valor');
    inputEstoqueFrete = document.querySelector('#estoque-frete');
    inputEstoqueParcelas = document.querySelector('#estoque-qtde_parcelas');
    inputEstoqueDataCompra = document.querySelector('#estoque-data-compra');
    inputEstoqueDataDebito = document.querySelector('#estoque-data-debito');
    inputEstoqueDataEntrega = document.querySelector('#estoque-data-entrega');
    filtro = document.querySelector('#filtro');
    toggleForm = false;
    toggleFormEstoque = false;

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
    formShield.addEventListener('click', fecharFormClick);
    formEstoqueShield.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
    filtro.addEventListener('input', uiUtils.debounce(filtrar, 500));

    currencyFormatter = new Intl.NumberFormat([], {
        style: 'currency',
        currency: 'BRL'
      });

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

            let idCol = row.insertCell()
            idCol.innerHTML = registro.id;
            idCol.addEventListener("click", carregarFormEdicao);

            let descCol = row.insertCell()
            descCol.innerHTML = registro.descricao;
            descCol.addEventListener("click", carregarFormEdicao);

            let qtdeEstoqueCol = row.insertCell()
            qtdeEstoqueCol.innerHTML = registro.qtde ? registro.qtde : '0';
            qtdeEstoqueCol.style = 'text-align: right;';
            qtdeEstoqueCol.addEventListener("click", carregarFormEdicao);

            let precoMedioCol = row.insertCell()
            precoMedioCol.innerHTML = registro.preco_medio ? currencyFormatter.format(registro.preco_medio) : currencyFormatter.format(0);
            precoMedioCol.style = 'text-align: right;';
            precoMedioCol.addEventListener("click", carregarFormEdicao);

            var comprarCol = row.insertCell();
            comprarCol.innerHTML = `<i class="fas fa-cart-plus"></i>`;
            comprarCol.style = 'text-align: center;';
            comprarCol.addEventListener("click", comprarInsumo);

            var deleteCol = row.insertCell();
            deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;
            deleteCol.style = 'text-align: center;';
            deleteCol.addEventListener("click", apagar);

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
    inputId.value = '';

    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Novo insumo';
    formShield.style.display = 'block';
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
    formShield.style.display = 'block';
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

        formShield.style.display = 'none';
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

        formShield.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    });
}

function actionclick() {
    if (toggleFormEstoque) {
        // Salvar compra de insumo
        if (validarFormEstoque()) {
            let compraInsumo = new CompraInsumo(null, inputEstoqueInsumoId.value, inputEstoqueQtde.value, 
                uiUtils.converterMoedaParaNumber(inputEstoqueValor.value), uiUtils.converterMoedaParaNumber(inputEstoqueFrete.value), 
                inputEstoqueParcelas.value, inputEstoqueDataCompra.value, inputEstoqueDataDebito.value, inputEstoqueDataEntrega.value);
            
            insumoDao.salvarCompraInsumo(compraInsumo, (id, err) => {
                if (err) {
                    let msgErro = `Ocorreu um erro ao salvar a compra do insumo: ${err}`;
                    console.error(msgErro);
                    M.toast({html: msgErro,  classes: 'rounded toastErro'});
                }
                else {
                    console.debug(`Nova compra inserida com id ${id}`);
                    atualizarTela();
                }

                formEstoqueShield.style.display = 'none';
                actionButton.innerHTML = '<i class="fas fa-plus"></i>';
                return;
            });
        }
        return;
    }

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

function validarFormEstoque() {
    let formValid = true;
    formValid = uiUtils.validarCampo(inputEstoqueQtde, true) && formValid;
    formValid = uiUtils.validarCampo(inputEstoqueValor, true) && formValid;
    formValid = uiUtils.validarCampo(inputEstoqueFrete, false) && formValid;
    formValid = uiUtils.validarCampo(inputEstoqueParcelas, false) && formValid;
    formValid = uiUtils.validarCampo(inputEstoqueDataCompra, true) && formValid;
    formValid = uiUtils.validarCampo(inputEstoqueDataDebito, false) && formValid;
    formValid = uiUtils.validarCampo(inputEstoqueDataEntrega, false) && formValid;
    formValid = uiUtils.validarCampo(inputEstoqueFornecedor, false) && formValid;
    
    if (!formValid) {
        M.toast({html: 'Corrija os campos destacados em vermelho!',  classes: 'rounded toastErro'});
        return false;
    }

    return formValid;
}

function fecharFormClick(event) {
    if (event.target.id == this.id) {
        formShield.style.display = 'none';
        formEstoqueShield.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        toggleForm = false;
        toggleFormEstoque = false;
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

    inputEstoqueInsumoId.value = id;

    // Recarregando as opções de fornecedor
    while (inputEstoqueFornecedor.length > 1) {
        inputEstoqueFornecedor.remove(1);
    }

    fornecedorDao.carregarFornecedores(null, null, null, (registro, err) => {
        if (registro) {
            let option = document.createElement("option");
            option.id = registro.id;
            option.text = registro.nome;
            inputEstoqueFornecedor.add(option);
            M.FormSelect.init(inputEstoqueFornecedor, {});
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os fornecedores: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });
    inputEstoqueQtde.focus();
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
    } 

    toggleFormEstoque = !toggleFormEstoque;


    
}