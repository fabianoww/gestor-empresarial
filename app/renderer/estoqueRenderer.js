const Estoque = require('../model/estoque');
const estoqueDao = require('../dao/estoqueDao');
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
let toggleForm = false;
let filtro = null;

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
    inputImagem = document.querySelector('#imagem');
    filtro = document.querySelector('#filtro');
    toggleForm = false;

    // Adicionando listeners para elementos da tela
    formShield.addEventListener('click', fecharFormClick);
    actionButton.addEventListener('click', actionclick);
    filtro.addEventListener('input', uiUtils.debounce(filtrar, 500));


    // Inicializando campos monetários
    let elemsCurrency = document.querySelectorAll('.monetario');
    elemsCurrency.forEach(element => {
        element.addEventListener('keypress', uiUtils.apenasDigitos);
        element.addEventListener('keyup', uiUtils.formatarMonetario);
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
                imagemCol.addEventListener("click", exibirImagem);
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

function exibirImagem(event) {
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
    
    // Exibir formulário de cadastro
    formTitle.innerHTML = 'Editar item de estoque';
    formShield.style.display = 'block';
    actionButton.innerHTML = '<i class="fas fa-save"></i>';
    inputDesc.focus();
    toggleForm = !toggleForm;
}

function inserir(itemEstoque) {
    estoqueDao.salvar(itemEstoque, (id, err) => {
        if (id) {
            console.debug(`Novo item de estoque inserido com id ${id}`);
            atualizarTela();
        }
        else {
            let msgErro = `Ocorreu um erro ao inserir um novo item de estoque: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
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

            if (novoItemEstoque) {
                // Salvar
                var reader = new FileReader();
                reader.addEventListener('load', () => {
                    inserir(new Estoque(null, inputDesc.value, inputTamanho.value, uiUtils.converterMoedaParaNumber(inputValor.value), 
                        inputLocal.value, reader.result));

                });
                reader.readAsDataURL(inputImagem.files[0]);
            }
            else {
                // Atualizar
                var reader = new FileReader();
                reader.addEventListener('load', () => {
                    atualizar(new Estoque(inputId.value, inputDesc.value, inputTamanho.value, uiUtils.converterMoedaParaNumber(inputValor.value), 
                    inputLocal.value, reader.result));
                });
                reader.readAsDataURL(inputImagem.files[0]);
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