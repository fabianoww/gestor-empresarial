const Estoque = require('../model/estoque');
const estoqueDao = require('../dao/estoqueDao');
const insumoDao = require('../dao/insumoDao');
const uiUtils = require('../utils/uiUtils');

let estoqueTable = null;
let actionButton = null;
let form = null;
let formShield = null;
let formTitle = null;
let inputId = null;
let inputDesc = null;
let inputTamanho = null;
let inputValor = null;
let inputLocal = null;
let inputImagem = null;
let displayImagem = null;
let previewVazio = null
let inputInsumo = null;
let inputQtdeInsumo = null;
let btnAddInsumo = null;
let tableInsumo = null;
let lblCustoTotal = null;
let toggleForm = false;
let possuiImagem = false;
let filtro = null;

let custoItem;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {
    estoqueTable = document.querySelector('#estoque-table');
    actionButton = document.querySelector('#action-btn');
    form = document.querySelector('#estoque-form');
    formShield = document.querySelector('#estoque-crud-shield');
    formTitle = document.querySelector('#titulo-form');
    inputId = document.querySelector('#estoque-id');
    inputDesc = document.querySelector('#desc');
    inputTamanho = document.querySelector('#tamanho');
    inputValor = document.querySelector('#valor');
    inputLocal = document.querySelector('#local');
    inputImagem = document.querySelector('#imagem-upload');
    displayImagem = document.querySelector('#imagem');
    previewVazio = document.querySelector('#image-preview-vazio');
    inputInsumo = document.querySelector('#insumo');
    inputQtdeInsumo = document.querySelector('#qtde-insumo');
    btnAddInsumo = document.querySelector('#btn-add-insumo-encomenda');
    tableInsumo = document.querySelector('#insumos-table');
    lblCustoTotal = document.querySelector('#total-custo-encomenda');
    filtro = document.querySelector('#filtro');
    toggleForm = false;

    // Adicionando listeners para elementos da tela
    formShield.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
    filtro.addEventListener('input', uiUtils.debounce(filtrar, 500));
    btnAddInsumo.addEventListener('click', addInsumoClick);
    btnAddInsumo.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) { // Enter
          event.preventDefault();
          btnAddInsumo.click();
        }
    }); 

    // Inicializando campos monetários
    let elemsCurrency = document.querySelectorAll('.monetario');
    elemsCurrency.forEach(element => {
        element.addEventListener('keypress', uiUtils.apenasDigitos);
        element.addEventListener('keyup', uiUtils.formatarMonetario);
    });

    // Configurando onChange no inputFile
    inputImagem.addEventListener('change', (e) => {
        var reader = new FileReader();
        reader.addEventListener('load', () => {
            displayImagem.src = reader.result;
            possuiImagem = true;
            displayImagem.parentElement.style.display = possuiImagem ? 'block' : 'none';
            previewVazio.style.display = !possuiImagem ? 'block' : 'none';
        });
        reader.readAsDataURL(e.target.files[0]);
    });

    // Configurando botão de remover preview
    document.querySelector('#btn-remover-preview').addEventListener('click', (e) => {
        displayImagem.src = '';
        possuiImagem = false;
        displayImagem.parentElement.style.display = possuiImagem ? 'block' : 'none';
        previewVazio.style.display = !possuiImagem ? 'block' : 'none';
    });

    // Carregando lista de insumos
    insumoDao.carregarInsumos(null, null, null, (registro, err) => {
        if (registro) {
            let option = document.createElement("option");
            option.value = registro.id;
            option.text = registro.descricao;
            inputInsumo.add(option);
            M.FormSelect.init(inputInsumo, {});
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os insumos: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });

    atualizarTela();
}

function atualizarTela() {
    // Limpando tabela
    while(estoqueTable.rows.length > 1) {
        estoqueTable.deleteRow(1);
    }
    estoqueDao.carregarEstoque(filtro.value, 0, 10, (registro, err) => {
        if (registro) {
            let row = estoqueTable.insertRow();
            row.insertCell().innerHTML = registro.id;
            row.insertCell().innerHTML = registro.descricao;
            row.insertCell().innerHTML = registro.tamanho;
            row.insertCell().innerHTML = registro.local;

            let valorCol = row.insertCell()
            valorCol.innerHTML = uiUtils.converterNumberParaMoeda(registro.valor);
            valorCol.style = 'text-align: right;';
            
            let imagemCol = row.insertCell();
            imagemCol.style = 'text-align: center;';
            if (registro.tem_imagem) {
                imagemCol.innerHTML = `<i class="fas fa-camera"></i>`;
                imagemCol.addEventListener("click", exibirImagemPopup);
            }
            
            let deleteCol = row.insertCell();
            deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;
            deleteCol.style = 'text-align: center;';
            deleteCol.addEventListener("click", apagar);

            row.addEventListener("click", carregarFormEdicao);
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os itens do estoque: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });
}

function exibirImagemPopup(event) {
    let id = event.target.parentElement.parentElement.children[0].textContent;
    estoqueDao.carregarImagem(id, (result) => {
        let elemShield = document.createElement("DIV");
        elemShield.classList.add("popup-shield");
        elemShield.addEventListener("click", (event) => {
            if (event.target.classList == 'popup-shield') {
                event.target.remove();
            }
        });
    
        let elemPopup = document.createElement("DIV");
        elemPopup.classList.add("popup_img");
        elemPopup.innerHTML = `<img src="${result.imagem}" style="max-width: 100%; max-height: 100%;"></img>`;
        
        elemShield.appendChild(elemPopup);
        document.body.appendChild(elemShield); 

    });
}

function exibirFormularioNovo() {
    // Limpando form
    form.reset();
    inputId.value = null;
    custoItem = 0;
    
    // Limpando tabela de insumos
    while(tableInsumo.rows.length > 1) {
        tableInsumo.deleteRow(1);
    }

    // Resetando o display da imagem
    displayImagem.parentElement.style.display = 'none';
    displayImagem.src = '';
    previewVazio.style.display = 'block';
    possuiImagem = false;

    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Novo item de estoque';
    formShield.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputDesc.focus();
}

function carregarFormEdicao(event) {
    let element = event.target;
    // Limpando form
    form.reset();
    custoItem = 0;
    
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

    // Setando campos
    inputId.value = element.children[0].textContent;
    inputDesc.value = element.children[1].textContent;
    inputTamanho.value = element.children[2].textContent;
    inputLocal.value = element.children[3].textContent;
    inputValor.value = element.children[4].textContent;
    M.updateTextFields();
    
    // Carregando imagem
    estoqueDao.carregarImagem(element.children[0].textContent, (result) => {
        if (result.imagem) {
            displayImagem.src = result.imagem;
            possuiImagem = true;
        } else {
            displayImagem.src = '';
            possuiImagem = false;
        }

        displayImagem.parentElement.style.display = possuiImagem ? 'block' : 'none';
        previewVazio.style.display = !possuiImagem ? 'block' : 'none';
    });

    // Carregando insumos
    estoqueDao.carregarInsumos(element.children[0].textContent, (registro, err) => {
        if (err) {
            console.error(err);
            return;
        }
        
        var row = tableInsumo.insertRow();
        row.insertCell().innerHTML = registro.id;
        row.insertCell().innerHTML = registro.descricao;
        row.insertCell().innerHTML = registro.qtde;
        
        custoItem = custoItem + registro.custo;
        let precoMedioCol = row.insertCell();
        precoMedioCol.innerHTML = uiUtils.converterNumberParaMoeda(registro.custo);
        precoMedioCol.style = 'text-align: right;';

        let deleteCol = row.insertCell();
        deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;
        deleteCol.style = 'text-align: center;';
        deleteCol.addEventListener("click", apagarInsumo);

        lblCustoTotal.innerHTML = `Custo do material: ${uiUtils.converterNumberParaMoeda(custoItem)}`;
    });
    
    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Editar item de estoque';
    formShield.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputDesc.focus();
    toggleForm = !toggleForm;
}

function inserir(itemEstoque) {
    estoqueDao.salvar(itemEstoque, (err) => {
        console.log(err);
        if (err) {
            let msgErro = `Ocorreu um erro ao inserir um novo item de estoque: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        } else {
            console.debug('Novo item de estoque inserido com sucesso!');
            atualizarTela();
        }

        formShield.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    });
}

function atualizar(itemEstoque) {
    estoqueDao.atualizar(itemEstoque, (ie, err) => {
        if (err) {
            let msgErro = `Ocorreu um erro ao atualizar o item de estoque: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
        else {
            console.debug(`Item de estoque atualizado`);
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
            let novoItemEstoque = inputId.value == null || inputId.value.trim() == '';
            let imagem = possuiImagem ? displayImagem.src.trim() : null;

            if (novoItemEstoque) {
                // Salvar
                inserir(new Estoque(null, inputDesc.value, inputTamanho.value, uiUtils.converterMoedaParaNumber(inputValor.value), 
                inputLocal.value, imagem, montarInsumos()));
            }
            else {
                // Atualizar
                atualizar(new Estoque(inputId.value, inputDesc.value, inputTamanho.value, uiUtils.converterMoedaParaNumber(inputValor.value), 
                inputLocal.value, imagem, montarInsumos()));
            }
            toggleForm = !toggleForm;
            
        }
    }

}

function validarForm() {
    let formValid = true;
    formValid = uiUtils.validarCampo(inputDesc, true) && formValid;
    formValid = uiUtils.validarCampo(inputTamanho, false) && formValid;
    formValid = uiUtils.validarCampo(inputValor, true) && formValid;
    formValid = uiUtils.validarCampo(inputLocal, false) && formValid;
    formValid = uiUtils.validarCampo(inputImagem, false) && formValid;
    
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
    
    uiUtils.showPopup('Atenção!', `Deseja realmente apagar o item de estoque "${desc}"?`, '200px', '300px', 
        [
            {label: 'Sim', cb: (event) => {
                estoqueDao.remover(id, (id, err) => {
                    if (err) {
                        let msgErro = `Ocorreu um erro ao remover o item de estoque: ${err}`;
                        console.error(msgErro);
                        M.toast({html: msgErro,  classes: 'rounded toastErro'});
                    }
                    else {
                        console.debug(`Item de estoque removido`);
                        atualizarTela();
                    }
                    return;
                });
                uiUtils.closePopup(event);
            }},
            {label: 'Não', cor:'#bfbfbf', cb: uiUtils.closePopup}
        ]);
}

function addInsumoClick() {
    if (validarFormInsumo()) {
        insumoDao.consultar(inputInsumo.value, (registro, err) => {
            var row = tableInsumo.insertRow();
            row.insertCell().innerHTML = registro.id;
            row.insertCell().innerHTML = registro.descricao;
            row.insertCell().innerHTML = inputQtdeInsumo.value;
            
            let custoInsumo = registro.preco_medio * inputQtdeInsumo.value;
            console.log(custoItem);
            custoItem = custoItem + custoInsumo;
            let precoMedioCol = row.insertCell();
            precoMedioCol.innerHTML = uiUtils.converterNumberParaMoeda(custoInsumo);
            precoMedioCol.style = 'text-align: right;';

            let deleteCol = row.insertCell();
            deleteCol.innerHTML = `<i class="fas fa-trash-alt"></i>`;
            deleteCol.style = 'text-align: center;';
            deleteCol.addEventListener("click", apagarInsumo);


            lblCustoTotal.innerHTML = `Custo do material: ${uiUtils.converterNumberParaMoeda(custoItem)}`;

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
    custoItem = custoItem - custo;
    lblCustoTotal.innerHTML = `Custo do material: ${uiUtils.converterNumberParaMoeda(custoItem)}`;
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