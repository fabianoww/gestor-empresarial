const MovimentacaoCaixa = require('../model/movimentacaoCaixa');
const movimentacaoCaixaDao = require('../dao/movimentacaoCaixaDao');
const uiUtils = require('../utils/uiUtils');

let fluxoCaixaTable = null;
let actionButton = null;
let descartarButton = null;
let form = null;
let formShield = null;
let formTitle = null;
let inputId = null;
let inputDesc = null;
let inputCategoria = null;
let inputData = null;
let inputValor = null;
let toggleForm = false;
let filtro = null;

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
    fluxoCaixaTable = document.querySelector('#fluxo-caixa-table');
    actionButton = document.querySelector('#action-btn');
    descartarButton = document.querySelector('#descartar-form-btn');
    form = document.querySelector('#fluxo-caixa-form');
    formShield = document.querySelector('#fluxo-caixa-crud-shield');
    formTitle = document.querySelector('#titulo-form');
    inputId = document.querySelector('#fluxo-caixa-id');
    inputDesc = document.querySelector('#desc');
    inputCategoria = document.querySelector('#categoria');
    inputData = document.querySelector('#data');
    inputValor = document.querySelector('#valor');
    filtro = document.querySelector('#filtro');
    toggleForm = false;

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

    // Adicionando listeners para elementos da tela
    formShield.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
    descartarButton.addEventListener('click', descartarclick);
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
    
    // Inicializando os campos select
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, {});

    atualizarTela();
}

function atualizarTela() {
    // Limpando tabela
    while(fluxoCaixaTable.rows.length > 1) {
        fluxoCaixaTable.deleteRow(1);
    }

    movimentacaoCaixaDao.carregarMovimentacoes(filtro.value, paginaAtual-1, tamanhoPagina, (result, err) => {

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar as movimentações de caixa: ${err}`;
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
                deleteCol.addEventListener("click", apagarClick);
    
                row.addEventListener("click", carregarFormEdicao);
            });
        }
    });
}

function limparForm() {
    form.reset();
    inputId.value = null;
}

function exibirFormularioNovo() {

    if (inputId.value) {
        console.log('Há registros em edição no form. Resetando form...');
        limparForm();
    }

    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Nova movimentação de caixa';
    formShield.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputDesc.focus();
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

    // Setando campos
    inputId.value = element.children[0].textContent;
    inputDesc.value = element.children[1].textContent;
    //uiUtils.setRadioValue(inputTipo, element.children[2].textContent)
    inputCategoria.value = element.children[3].textContent;
    inputData.value = element.children[4].textContent;
    inputValor.value = element.children[5].textContent;
    M.updateTextFields();
    
    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Editar movimentação de caixa';
    formShield.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputDesc.focus();
    toggleForm = !toggleForm;
}

function inserir(movimentacaoCaixa) {
    
    movimentacaoCaixaDao.salvar(movimentacaoCaixa, (id, err) => {
        if (id) {
            M.toast({html: 'Movimentação de caixa inserida com sucesso!',  classes: 'rounded toastSucesso'});
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
            M.toast({html: 'Movimentação de caixa atualizada com sucesso!',  classes: 'rounded toastSucesso'});
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
                inserir(new MovimentacaoCaixa(null, inputDesc.value, 
                    inputCategoria.value, inputData.value, uiUtils.converterMoedaParaNumber(inputValor.value)));
            }
            else {
                // Atualizar
                atualizar(new MovimentacaoCaixa(inputId.value, inputDesc.value, 
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
        fecharForm();
    }
}

function fecharForm() {
    formShield.style.display = 'none';
    actionButton.innerHTML = '<i class="fas fa-plus"></i>';
    toggleForm = !toggleForm;
}

function filtrar() {
    paginaAtual = 1;
    atualizarTela();
}

function apagarClick(event) {
    let id = event.target.parentElement.parentElement.children[0].textContent;
    let desc = event.target.parentElement.parentElement.children[1].textContent;
    apagar(id, desc, atualizarTela);
}

function apagar(id, desc, cb) {    
    uiUtils.showPopup('Atenção!', `Deseja realmente apagar a movimentação de caixa "${desc}"?`, '200px', '300px', 
        [
            {label: 'Sim', cb: (event) => {
                movimentacaoCaixaDao.remover(id, (id, err) => {
                    if (err) {
                        let msgErro = `Ocorreu um erro ao remover a movimentação de caixa: ${err}`;
                        console.error(msgErro);
                        M.toast({html: msgErro,  classes: 'rounded toastErro'});
                    }
                    else {
                        M.toast({html: 'Movimentação de caixa removida com sucesso!',  classes: 'rounded toastSucesso'});
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
        apagar(inputId.value, inputDesc.value, () => {
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
