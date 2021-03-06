const Fornecedor = require('../model/fornecedor');
const fornecedorDao = require('../dao/fornecedorDao');
const uiUtils = require('../utils/uiUtils');
const maskInput = require('mask-input');

let fornecedoresTable = null;
let actionButton = null;
let descartarButton = null;
let formPanel = null;
let formTitle = null;
let inputId = null;
let inputNome = null;
let inputTipo = null;
let inputOnline = null;
let inputTelefoneFixo = null;
let inputTelefoneCelular = null;
let inputEmail = null;
let inputSite = null;
let inputObservacao = null;
let toggleForm = false;
let fornecedorForm = null;
let filtro = null;

let telefoneFixoMask = null;
let telefoneCelularMask = null;

// Campos paginação
let tamanhoPagina = 15;
let paginaAtual = 1;
let qtdePaginas = 0;
let btnPagPrimeira = null;
let btnPagAnterior = null;
let btnPagProxima = null;
let btnPagUltima = null;
let lblTextoPaginacao = null;
let paginacaoPanel = null;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {
    fornecedoresTable = document.querySelector('#fornecedores-table');
    actionButton = document.querySelector('#action-fornecedor-btn');
    descartarButton = document.querySelector('#descartar-form-btn');
    formPanel = document.querySelector('#fornecedor-crud-shield');
    formTitle = document.querySelector('#titulo-form');
    inputId = document.querySelector('#fornecedor-id');
    inputNome = document.querySelector('#nome');
    inputTipo = document.querySelector('#tipo');
    inputOnline = document.getElementsByName('tipoFornecedor');
    inputTelefoneFixo = document.querySelector('#telefone-fixo');
    inputTelefoneCelular = document.querySelector('#telefone-celular');
    inputEmail = document.querySelector('#email');
    inputSite = document.querySelector('#site');
    inputObservacao = document.querySelector('#observacao');
    fornecedorForm = document.querySelector('#fornecedor-form');
    filtro = document.querySelector('#filtro');
    toggleForm = false;

    // Adicionando listeners para elementos da tela
    formPanel.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
    descartarButton.addEventListener('click', descartarclick);
    filtro.addEventListener('input', uiUtils.debounce(filtrar, 500));

    // Campos de paginação
    lblTextoPaginacao = document.querySelector('#pag-texto');
    btnPagPrimeira = document.querySelector('#btn-pag-primeira');
    btnPagPrimeira.addEventListener('click', navegarPrimeiraPagina);
    btnPagAnterior = document.querySelector('#btn-pag-anterior');
    btnPagAnterior.addEventListener('click', navegarPaginaAnterior);
    btnPagProxima = document.querySelector('#btn-pag-proxima');
    btnPagProxima.addEventListener('click', navegarProximaPagina);
    btnPagUltima = document.querySelector('#btn-pag-ultima');
    btnPagUltima.addEventListener('click', navegarUltimaPagina);
    paginacaoPanel = document.querySelector('#paginacao-panel');

    // Inicializando campos campos
    telefoneFixoMask = new maskInput.default(document.querySelector('#telefone-fixo'), {
        mask: '(00) 0000-0000',
        alwaysShowMask: true,
        maskChar: '0',
    });
    
    telefoneCelularMask = new maskInput.default(document.querySelector('#telefone-celular'), {
        mask: '(00) 00000-0000',
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

    fornecedorDao.carregarFornecedores(filtro.value, paginaAtual-1, tamanhoPagina, (result, err) => {
        
        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os fornecedores: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
            return;
        }

        qtdePaginas = Math.ceil(result.total / tamanhoPagina);
        
        paginacaoPanel.style.visibility = qtdePaginas <= 1 ? 'hidden' : 'visible';
        btnPagPrimeira.style.visibility = qtdePaginas <= 1 || paginaAtual == 1 ? 'hidden' : 'visible';
        btnPagAnterior.style.visibility = qtdePaginas <= 1 || paginaAtual == 1 ? 'hidden' : 'visible';
        btnPagProxima.style.visibility = qtdePaginas <= 1 || paginaAtual == qtdePaginas ? 'hidden' : 'visible';
        btnPagUltima.style.visibility = qtdePaginas <= 1 || paginaAtual == qtdePaginas ? 'hidden' : 'visible';

        lblTextoPaginacao.innerHTML = `Página ${paginaAtual} de ${qtdePaginas}`;
        
        if (result) {
            result.registros.forEach(registro => {
                let row = fornecedoresTable.insertRow();
                row.insertCell().innerHTML = registro.id;
                row.insertCell().innerHTML = registro.nome;
                row.insertCell().innerHTML = registro.tipo;
                
                let deleteCol = row.insertCell();
                deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                deleteCol.style = 'text-align: center;';
                deleteCol.addEventListener("click", apagarClick);

                row.addEventListener("click", carregarFormEdicao);
            });
        }
    });
}

function limparForm() {
    fornecedorForm.reset();
    inputId.value = null;

    telefoneFixoMask.input._value = '(00) 0000-0000';
    telefoneCelularMask.input._value = '(00) 00000-0000';
}

function exibirFormularioNovo() {

    if (inputId.value) {
        console.log('Há registros em edição no form. Resetando form...');
        limparForm();
    }

    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Novo fornecedor';
    formPanel.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputNome.focus();
}

function carregarFormEdicao(event) {
    let element = event.target;

    if (element.nodeName == 'I') {
        // No click da lixeira, ignorar a abertura do formulario
        return;
    }
    else if (element.nodeName == 'TD') {
        element = element.parentElement;
    }

    limparForm();
    let id = element.children[0].textContent;
    fornecedorDao.consultar(id, (fornecedor) => {

        // Setando campos
        inputId.value = fornecedor.id;
        inputNome.value = fornecedor.nome;
        inputTipo.value = fornecedor.tipo;
        uiUtils.setRadioValue(inputOnline, fornecedor.online);
        inputTelefoneFixo.value = fornecedor.telefoneFixo;
        telefoneFixoMask.input._value = fornecedor.telefoneFixo ? fornecedor.telefoneFixo : '(00) 0000-0000';
        inputTelefoneCelular.value = fornecedor.telefoneCelular;
        telefoneCelularMask.input._value = fornecedor.telefoneCelular ? fornecedor.telefoneCelular : '(00) 00000-0000';
        inputEmail.value = fornecedor.email;
        inputSite.value = fornecedor.site;
        inputObservacao.value = fornecedor.observacao;
        M.updateTextFields();
        
        // Exibir formulário de cadastro
        formTitle.innerHTML = 'Editar fornecedor';
        formPanel.style.display = 'block';
        actionButton.innerHTML = '<i class="fas fa-save"></i>';
        inputNome.focus();
        toggleForm = !toggleForm;
    });
}

function inserir(novoFornecedor) {
    
    fornecedorDao.salvar(novoFornecedor, (id, err) => {
        if (id) {
            M.toast({html: 'Fornecedor inserido com sucesso!',  classes: 'rounded toastSucesso'});
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
            M.toast({html: 'Fornecedor atualizado com sucesso!',  classes: 'rounded toastSucesso'});
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
        toggleForm = !toggleForm;
    } else {
        // Verificar validade dos campos
        if (validarForm()) {
            let novoFornecedor = inputId.value == null || inputId.value.trim() == '';

            if (novoFornecedor) {
                // Salvar
                inserir(new Fornecedor(null, inputNome.value, inputTipo.value, uiUtils.getRadioValue(inputOnline), inputTelefoneFixo.value, inputTelefoneCelular.value, inputEmail.value, inputSite.value, inputObservacao.value));
            }
            else {
                // Atualizar
                atualizar(new Fornecedor(inputId.value, inputNome.value, inputTipo.value, uiUtils.getRadioValue(inputOnline), inputTelefoneFixo.value, inputTelefoneCelular.value, inputEmail.value, inputSite.value, inputObservacao.value));
            }
            toggleForm = !toggleForm;
        }
    }
}

function validarForm() {
    let formValid = true;
    formValid = uiUtils.validarCampo(inputNome, true) && formValid;
    formValid = uiUtils.validarCampo(inputTipo, true) && formValid;
    formValid = uiUtils.validarCampo(inputTelefoneFixo, false) && formValid;
    formValid = uiUtils.validarCampo(inputTelefoneCelular, false) && formValid;
    formValid = uiUtils.validarCampo(inputEmail, false) && formValid;
    formValid = uiUtils.validarCampo(inputSite, false) && formValid;
    formValid = uiUtils.validarCampo(inputObservacao, false) && formValid;
    
    if (!formValid) {
        M.toast({html: 'Corrija os campos destacados em vermelho!',  classes: 'rounded toastErro'});
        return false;
    }

    return formValid;
}

function fecharFormClick(event) {
    if (event.target.id == this.id) {
        fecharForm();
    }
}

function fecharForm() {
    formPanel.style.display = 'none';
    actionButton.innerHTML = '<i class="fas fa-plus"></i>';
    toggleForm = !toggleForm;
}

function filtrar() {
    paginaAtual = 1;
    atualizarTela();
}

function apagarClick(event) {
    let id = event.target.parentElement.parentElement.children[0].textContent;
    let nome = event.target.parentElement.parentElement.children[1].textContent;
    apagar(id, nome, atualizarTela);
}

function apagar(id, nome, cb) {
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
                        M.toast({html: 'Fornecedor removido com sucesso!',  classes: 'rounded toastSucesso'});
                        cb();
                    }
                    return;
                });
                uiUtils.closePopup(event);
            }},
            {label: 'Não', cor:'#bfbfbf', cb: uiUtils.closePopup}
        ]);

}

function descartarclick() {
    if (inputId.value) {
        // Edição
        apagar(inputId.value, inputNome.value, () => {
            limparForm();
            fecharForm();
            atualizarTela();
        });
    } else {
        // Inserção
        limparForm();
        fecharForm();
    }
}

function navegarPrimeiraPagina() {
    paginaAtual = 1;
    atualizarTela();
}

function navegarProximaPagina() {
    paginaAtual += 1;
    atualizarTela();
}

function navegarPaginaAnterior() {
    paginaAtual -= 1;
    atualizarTela();
}

function navegarUltimaPagina() {
    paginaAtual = qtdePaginas;
    atualizarTela();
}