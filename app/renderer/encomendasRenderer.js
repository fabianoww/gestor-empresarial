const Encomenda = require('../model/encomenda');
const encomendaDao = require('../dao/encomendaDao');
const insumoDao = require('../dao/insumoDao');
const uiUtils = require('../utils/uiUtils');
const maskInput = require('mask-input');
const EasySoap = require('easysoap');
const soap = require('soap');

let encomendasTable = null;
let actionButton = null;
let descartarButton = null;
let formPanel = null;
let formTitle = null;
let form = null;
let inputId = null;

let inputDesc = null;
let inputTipoProduto = null;
let inputQtde = null;
let inputCores = null;
let inputObs = null;
let inputDataEncomenda = null;
let inputDataEntrega = null;
let inputHorasProducao = null;
let inputPrazoEnvio = null;
let inputDataEnvio = null;
let inputCodRastreamento = null;
let inputNomeCliente = null;
let inputTelCliente = null;
let inputEmail = null;
let cepEnderecoCliente = null;
let logradouroEnderecoCliente = null;
let numeroEnderecoCliente = null;
let bairroEnderecoCliente = null;
let complEnderecoCliente = null;
let cidadeEnderecoCliente = null;
let estadoEnderecoCliente = null;
let inputInsumo = null;
let inputQtdeInsumo = null;
let btnAddInsumo = null;
let tableInsumo = null;
let lblCustoTotal = null;
let inputFormaPgto = null;
let inputValorEntrada = null;
let inputValor = null;
let inputDataPgto = null;
let inputStatus = null;
let toggleForm = false;
let filtro = null;
let custoEncomenda;

let telefoneMask = null;
let cepMask = null

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

    encomendasTable = document.querySelector('#encomendas-table');
    actionButton = document.querySelector('#action-encomenda-btn');
    descartarButton = document.querySelector('#descartar-form-btn');
    formPanel = document.querySelector('#encomenda-crud-shield');
    formTitle = document.querySelector('#titulo-form');
    form = document.querySelector('#encomenda-form');
    inputId = document.querySelector('#encomenda-id');
    inputDesc = document.querySelector('#desc');
    inputTipoProduto = document.querySelector('#tipo-produto');
    inputQtde = document.querySelector('#qtde');
    inputCores = document.querySelector('#cores');
    inputObs = document.querySelector('#obs');
    inputDataEncomenda = document.querySelector('#data-encomenda');
    inputDataEntrega = document.querySelector('#data-entrega');
    inputHorasProducao = document.querySelector('#horas-producao');
    inputPrazoEnvio = document.querySelector('#prazo-envio');
    inputDataEnvio = document.querySelector('#data-envio');
    inputCodRastreamento = document.querySelector('#cod-rastreamento');
    inputNomeCliente = document.querySelector('#nome-cliente');
    inputTelCliente = document.querySelector('#telefone-cliente');
    inputEmail = document.querySelector('#email-cliente');
    cepEnderecoCliente = document.querySelector('#cep-end-cliente');
    logradouroEnderecoCliente = document.querySelector('#log-end-cliente');
    numeroEnderecoCliente = document.querySelector('#numero-end-cliente');
    bairroEnderecoCliente = document.querySelector('#bairro-end-cliente');
    complEnderecoCliente = document.querySelector('#compl-end-cliente');
    cidadeEnderecoCliente = document.querySelector('#cidade-end-cliente');
    estadoEnderecoCliente = document.querySelector('#estado-end-cliente');
    inputInsumo = document.querySelector('#insumo');
    inputQtdeInsumo = document.querySelector('#qtde-insumo');
    btnAddInsumo = document.querySelector('#btn-add-insumo-encomenda');
    tableInsumo = document.querySelector('#insumos-table');
    lblCustoTotal = document.querySelector('#total-custo-encomenda');
	inputFormaPgto = document.querySelector('#forma-pagamento');
	inputValorEntrada = document.querySelector('#valor-entrada');
	inputValor = document.querySelector('#valor');
	inputDataPgto = document.querySelector('#data-pagamento');
	inputStatus = document.querySelector('#status');

    filtro = document.querySelector('#filtro');
    toggleForm = false;

    // Adicionando listeners para elementos da tela
    formPanel.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
    descartarButton.addEventListener('click', descartarclick);
    filtro.addEventListener('input', uiUtils.debounce(filtrar, 500));
    inputFormaPgto.addEventListener('change', toggleInputEntrada);
    btnAddInsumo.addEventListener('click', addInsumoClick);
    btnAddInsumo.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) { // Enter
          event.preventDefault();
          btnAddInsumo.click();
        }
    }); 

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

    // Carregando lista de insumos
    insumoDao.carregarInsumos(null, null, null, (result, err) => {

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os insumos: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
            return;
        }

        result.registros.forEach(registro => {
            let option = document.createElement("option");
            option.value = registro.id;
            option.text = registro.descricao;
            inputInsumo.add(option);
            M.FormSelect.init(inputInsumo, {});
        });
    });

    // Inicializando campos de telefone
    telefoneMask = new maskInput.default(document.querySelector('#telefone-cliente'), {
        mask: '(00) 00000-0000',
        alwaysShowMask: true,
        maskChar: '0',
    });

    // Inicializando campos de cep
    cepMask = new maskInput.default(document.querySelector('#cep-end-cliente'), {
        mask: '00000-000',
        alwaysShowMask: true,
        maskChar: '0',
    });

    // Inicializando campos de data
    uiUtils.initDatePicker('.datepicker');

    // Inicializando campos numéricos
    let elemsNumericos = document.querySelectorAll('.numerico');
    elemsNumericos.forEach(element => element.addEventListener('keypress', uiUtils.apenasDigitos));

    // Inicializando campos monetários
    let elemsCurrency = document.querySelectorAll('.monetario');
    elemsCurrency.forEach(element => {
        element.addEventListener('keypress', uiUtils.apenasDigitos);
        element.addEventListener('keyup', uiUtils.formatarMonetario);
    });
    
    // Inicializando os campos select
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, {});

    cepEnderecoCliente.addEventListener('blur', consultarCep);

    atualizarTela();
}

function atualizarTela() {
    // Limpando tabela

    while(encomendasTable.rows.length > 1) {
        encomendasTable.deleteRow(1);
    }

    encomendaDao.carregarEncomendas(filtro.value, paginaAtual-1, tamanhoPagina, (result, err) => {
        if (err) {
            let msgErro = `Ocorreu um erro ao carregar as encomendas: ${err}`;
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
                        
                if (registro) {
                    var row = encomendasTable.insertRow();
                    row.insertCell().innerHTML = registro.id;
                    row.insertCell().innerHTML = registro.qtde;
                    row.insertCell().innerHTML = registro.descricao;
                    row.insertCell().innerHTML = registro.nome_cliente;
                    row.insertCell().innerHTML = registro.data_entrega;
                    
                    let horasProducaoCol = row.insertCell();
                    horasProducaoCol.innerHTML = registro.horas_producao;
                    horasProducaoCol.style = 'text-align: right;';

                    let deleteCol = row.insertCell();
                    deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                    deleteCol.style = 'text-align: center;';
                    deleteCol.addEventListener("click", apagarClick);

                    row.addEventListener("click", carregarFormEdicao);
                }

                if (err) {
                    let msgErro = `Ocorreu um erro ao carregar as encomendas: ${err}`;
                    console.error(msgErro);
                    M.toast({html: msgErro,  classes: 'rounded toastErro'});
                }
            });
        }
    });
}

function limparForm() {
    form.reset();
    inputId.value = null;
    custoEncomenda = 0;
    lblCustoTotal.innerHTML = `Custo do material: ${uiUtils.converterNumberParaMoeda(custoEncomenda)}`;
    
    telefoneMask.input._value = '(00) 00000-0000';
    cepMask.input._value = '00000-000';
}

function exibirFormularioNovo() {

    if (inputId.value) {
        limparForm();
    }
    
    // Limpando tabela de insumos
    while(tableInsumo.rows.length > 1) {
        tableInsumo.deleteRow(1);
    }

    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Nova encomenda';
    formPanel.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputDesc.focus();
}

function carregarFormEdicao(event) {
    let element = event.target;
    
    // Limpando tabela de insumos
    while(tableInsumo.rows.length > 1) {
        tableInsumo.deleteRow(1);
    }

    if (element.nodeName == 'I') {
        // No click da lixeira, ignorar a abertura do formulario
        return;
    }
    else if (element.nodeName == 'TD') {
        element = element.parentElement;
    }

    limparForm();

    // Setando campos
    let encomenda = encomendaDao.consultar(element.children[0].textContent, (encomenda) => {
        inputId.value = encomenda.id;
        inputDesc.value = encomenda.desc;
        inputTipoProduto.value = encomenda.tipoProduto;
        inputQtde.value = encomenda.qtde;
        inputCores.value = encomenda.cores;
        inputObs.value = encomenda.obs;
        inputDataEncomenda.value = encomenda.dataEncomenda;
        inputDataEntrega.value = encomenda.dataEntrega;
        inputHorasProducao.value = encomenda.horasProd;
        inputPrazoEnvio.value = encomenda.prazoEnvio;
        inputDataEnvio.value = encomenda.dataEnvio;
        inputCodRastreamento.value = encomenda.codRastreamento;
        inputNomeCliente.value = encomenda.nomeCliente;
        inputTelCliente.value = encomenda.telCliente;
        telefoneMask.input._value = encomenda.telCliente ? encomenda.telCliente : '(00) 00000-0000';
        inputEmail.value = encomenda.emailCliente;
        cepEnderecoCliente.value = encomenda.cepEndCliente;
        cepMask.input._value = encomenda.cepEndCliente ? encomenda.cepEndCliente : '00000-000';
        logradouroEnderecoCliente.value = encomenda.logEndCliente;
        numeroEnderecoCliente.value = encomenda.numEndCliente;
        bairroEnderecoCliente.value = encomenda.bairroEndCliente;
        complEnderecoCliente.value = encomenda.compEndCliente;
        estadoEnderecoCliente.value = encomenda.ufEndCliente;
        cidadeEnderecoCliente.value = encomenda.cidEndCliente;
        inputFormaPgto.value = encomenda.formaPgto;
        inputValorEntrada.value = uiUtils.converterNumberParaMoeda(encomenda.entradaPgto);
        inputValor.value = uiUtils.converterNumberParaMoeda(encomenda.valorPgto);
        inputDataPgto.value = encomenda.dataPgto;
        inputStatus.value = encomenda.statusPgto;

        // Setando a visibilidade do campo "valor entrada" com base na forma de pagamento selecionado
        inputValorEntrada.parentElement.style.display = inputFormaPgto.value == 'ENT+1' ? 'inline-block' : 'none';

        // Reinicializando campos selects 
        var elems = document.querySelectorAll('select');
        var instances = M.FormSelect.init(elems, {});

        // reinicializando campos texto
        M.updateTextFields();
        
        // Exibir formulário de cadastro
        formTitle.innerHTML = 'Editar encomenda';
        formPanel.style.display = 'block';
        actionButton.innerHTML = '<i class="fas fa-save"></i>';
        inputDesc.focus();
        toggleForm = !toggleForm;

        encomendaDao.carregarInsumos(encomenda.id, (registro, err) => {
            if (err) {
                console.error(err);
                return;
            }
            
            var row = tableInsumo.insertRow();
            row.insertCell().innerHTML = registro.id;
            row.insertCell().innerHTML = registro.descricao;
            row.insertCell().innerHTML = registro.qtde;
            
            custoEncomenda = custoEncomenda + registro.custo;
            let precoMedioCol = row.insertCell();
            precoMedioCol.innerHTML = uiUtils.converterNumberParaMoeda(registro.custo);
            precoMedioCol.style = 'text-align: right;';

            let deleteCol = row.insertCell();
            deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;
            deleteCol.style = 'text-align: center;';
            deleteCol.addEventListener("click", apagarInsumo);

            lblCustoTotal.innerHTML = `Custo do material: ${uiUtils.converterNumberParaMoeda(custoEncomenda)}`;
        });

    });
}

function actionclick() {
    
    if (!toggleForm) {
        exibirFormularioNovo();
        toggleForm = !toggleForm;
    } else {
        // Verificar validade dos campos
        if (validarForm()) {

            let novaEncomenda = inputId.value == null || inputId.value.trim() == '';
            if (novaEncomenda) {
                // Salvar
                inserir(new Encomenda(null, inputDesc.value, inputTipoProduto.value, inputQtde.value, inputCores.value, inputObs.value, 
                    inputDataEncomenda.value, inputDataEntrega.value, inputHorasProducao.value, inputPrazoEnvio.value, inputDataEnvio.value,
                    inputCodRastreamento.value, inputNomeCliente.value, inputTelCliente.value, inputEmail.value, cepEnderecoCliente.value, 
                    logradouroEnderecoCliente.value, numeroEnderecoCliente.value, bairroEnderecoCliente.value, complEnderecoCliente.value, 
                    estadoEnderecoCliente.value, cidadeEnderecoCliente.value, inputFormaPgto.value, uiUtils.converterMoedaParaNumber(inputValorEntrada.value), 
                    uiUtils.converterMoedaParaNumber(inputValor.value), inputDataPgto.value, inputStatus.value, montarInsumos()));
            }
            else {
                // Atualizar
                atualizar(new Encomenda(inputId.value, inputDesc.value, inputTipoProduto.value, inputQtde.value, inputCores.value, inputObs.value, 
                    inputDataEncomenda.value, inputDataEntrega.value, inputHorasProducao.value, inputPrazoEnvio.value, inputDataEnvio.value,
                    inputCodRastreamento.value, inputNomeCliente.value, inputTelCliente.value, inputEmail.value, cepEnderecoCliente.value, 
                    logradouroEnderecoCliente.value, numeroEnderecoCliente.value, bairroEnderecoCliente.value, complEnderecoCliente.value, 
                    estadoEnderecoCliente.value, cidadeEnderecoCliente.value, inputFormaPgto.value, uiUtils.converterMoedaParaNumber(inputValorEntrada.value), 
                    uiUtils.converterMoedaParaNumber(inputValor.value), inputDataPgto.value, inputStatus.value, montarInsumos()));
            }
            
            formPanel.style.display = 'none';
            actionButton.innerHTML = '<i class="fas fa-plus"></i>';
            toggleForm = !toggleForm;
        }
    }
}

function validarForm() {
    let formValid = true;
    formValid = uiUtils.validarCampo(inputDesc, true) && formValid;
    formValid = uiUtils.validarCampo(inputTipoProduto, true) && formValid;
    formValid = uiUtils.validarCampo(inputQtde, true) && formValid;
    formValid = uiUtils.validarCampo(inputCores, false) && formValid;
    formValid = uiUtils.validarCampo(inputObs, false) && formValid;
    formValid = uiUtils.validarCampo(inputDataEncomenda, true) && formValid;
    formValid = uiUtils.validarCampo(inputDataEntrega, false) && formValid;
    formValid = uiUtils.validarCampo(inputHorasProducao, false) && formValid;
    formValid = uiUtils.validarCampo(inputPrazoEnvio, false) && formValid;
    formValid = uiUtils.validarCampo(inputDataEnvio, false) && formValid;
    formValid = uiUtils.validarCampo(inputCodRastreamento, false) && formValid;
    formValid = uiUtils.validarCampo(inputNomeCliente, true) && formValid;
    formValid = uiUtils.validarCampo(inputTelCliente, false) && formValid;
    formValid = uiUtils.validarCampo(inputEmail, false) && formValid;
    formValid = uiUtils.validarCampo(cepEnderecoCliente, false) && formValid;
    formValid = uiUtils.validarCampo(logradouroEnderecoCliente, false) && formValid;
    formValid = uiUtils.validarCampo(numeroEnderecoCliente, false) && formValid;
    formValid = uiUtils.validarCampo(bairroEnderecoCliente, false) && formValid;
    formValid = uiUtils.validarCampo(complEnderecoCliente, false) && formValid;
    formValid = uiUtils.validarCampo(cidadeEnderecoCliente, false) && formValid;
    formValid = uiUtils.validarCampo(estadoEnderecoCliente, false) && formValid;
    formValid = uiUtils.validarCampo(inputFormaPgto, true) && formValid;
    formValid = uiUtils.validarCampo(inputValorEntrada, inputFormaPgto.value == 'ENT+1') && formValid;
    formValid = uiUtils.validarCampo(inputValor, false) && formValid;
    formValid = uiUtils.validarCampo(inputDataPgto, false) && formValid;
    formValid = uiUtils.validarCampo(inputStatus, true) && formValid;
    
    if (!formValid) {
        M.toast({html: 'Corrija os campos destacados em vermelho!',  classes: 'rounded toastErro'});
    }

    return formValid;
}

function inserir(novaEncomenda) {
    
    encomendaDao.salvar(novaEncomenda, (err) => {
        if (err) {
            let msgErro = `Ocorreu um erro ao inserir uma nova encomenda: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }

        M.toast({html: 'Encomenda inserida com sucesso!',  classes: 'rounded toastSucesso'});
        atualizarTela();
        formPanel.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    });
    
}

function atualizar(encomenda) {
    
    encomendaDao.atualizar(encomenda, (err) => {
        if (err) {
            let msgErro = `Ocorreu um erro ao atualizar a encomenda: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
        else {
            M.toast({html: 'Encomenda atualizada com sucesso!',  classes: 'rounded toastSucesso'});
            atualizarTela();
        }

        formPanel.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    });
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

function toggleInputEntrada(e) {
    inputValorEntrada.parentElement.style.display = e.target.value == 'ENT+1' ? 'inline-block' : 'none';
}

function filtrar() {
    paginaAtual = 1;
    atualizarTela();
}

function apagarClick(event) {
    let id = event.target.parentElement.parentElement.children[0].textContent;
    let desc = event.target.parentElement.parentElement.children[2].textContent;
    apagar(id, desc, atualizarTela);
}

function apagar(id, desc, cb) {
    uiUtils.showPopup('Atenção!', `Deseja realmente apagar a encomenda ${desc}?`, '200px', '300px', 
        [
            {label: 'Sim', cb: (event) => {
                encomendaDao.remover(id, (id, err) => {
                    if (err) {
                        let msgErro = `Ocorreu um erro ao remover a encomenda: ${err}`;
                        console.error(msgErro);
                        M.toast({html: msgErro,  classes: 'rounded toastErro'});
                    }
                    else {
                        M.toast({html: 'Encomenda removida com sucesso!',  classes: 'rounded toastSucesso'});
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

function consultarCep(event) {

    soap.createClient('https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente?wsdl', function(err, client){
        if (err) {
            M.toast({html: 'Ocorreu um erro ao acessar o serviço de consulta de CEP! Preencha os dados manualmente.',  classes: 'rounded toastErro'});
        }
        else if (client){
            client.consultaCEP({
                cep: event.target.value
            }, (err, result) => {
                if (err) {
                    M.toast({html: 'CEP não encontrado!',  classes: 'rounded toastErro'});
                } else {
                    bairroEnderecoCliente.value = result.return.bairro;
                    cidadeEnderecoCliente.value = result.return.cidade;
                    logradouroEnderecoCliente.value = result.return.end;

                    for (let i = 0; i < estadoEnderecoCliente.options.length; i++) {
                        const option = estadoEnderecoCliente.options[i];
                        if (option.value == result.return.uf) {
                            option.selected = 'selected';
                            break;
                        }
                    }

                    // Reinicializando campos selects 
                    var elems = document.querySelectorAll('select');
                    var instances = M.FormSelect.init(elems, {});

                    // reinicializando campos texto
                    M.updateTextFields();
                }
            });
        }
   });
}

function addInsumoClick() {
    if (validarFormInsumo()) {
        insumoDao.consultar(inputInsumo.value, (registro, err) => {
            var row = tableInsumo.insertRow();
            row.insertCell().innerHTML = registro.id;
            row.insertCell().innerHTML = registro.descricao;
            row.insertCell().innerHTML = inputQtdeInsumo.value;
            
            let custoInsumo = registro.preco_medio * inputQtdeInsumo.value;
            custoEncomenda = custoEncomenda + custoInsumo;
            let precoMedioCol = row.insertCell();
            precoMedioCol.innerHTML = uiUtils.converterNumberParaMoeda(custoInsumo);
            precoMedioCol.style = 'text-align: right;';

            let deleteCol = row.insertCell();
            deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;
            deleteCol.style = 'text-align: center;';
            deleteCol.addEventListener("click", apagarInsumo);

            lblCustoTotal.innerHTML = `Custo do material: ${uiUtils.converterNumberParaMoeda(custoEncomenda)}`;

            inputInsumo.value = '';
            inputQtdeInsumo.value = '';
            M.FormSelect.init(inputInsumo, {});
        });
    }
}

function validarFormInsumo() {
    let formValid = true;
    formValid = uiUtils.validarCampo(inputInsumo, true) && formValid;
    formValid = uiUtils.validarCampo(inputQtdeInsumo, true) && formValid;
    
    if (!formValid) {
        M.toast({html: 'Corrija os campos destacados em vermelho!',  classes: 'rounded toastErro'});
    }

    return formValid;
}

function apagarInsumo(event) {
    if (event.target.nodeName != 'I') {
        // No click da lixeira, ignorar a abertura do formulario
        return;
    }

    let custo = uiUtils.converterMoedaParaNumber(event.target.parentElement.parentElement.children[3].textContent);
    tableInsumo.deleteRow(event.target.parentElement.parentElement.rowIndex);
    custoEncomenda = custoEncomenda - custo;
    lblCustoTotal.innerHTML = `Custo do material: ${uiUtils.converterNumberParaMoeda(custoEncomenda)}`;
}

function montarInsumos() {
    let insumos = [];
    for (let i = 1; i < tableInsumo.rows.length; i++){
        const row = tableInsumo.rows[i];
        insumos[insumos.length] = {
            idInsumo: row.children[0].textContent,
            qtdeInsumo: row.children[2].textContent
        };
    }

    return insumos;
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
