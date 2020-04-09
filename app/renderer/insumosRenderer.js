const Insumo  = require('../model/insumo');
const insumoDao = require('../dao/insumoDao');
const uiUtils = require('../utils/uiUtils');

let insumosTable = document.querySelector('#insumos-table');
let actionButton = document.querySelector('#action-insumo-btn');
let filterButton = document.querySelector('#filter-insumo-btn');
let formPanel = document.querySelector('#insumo-form-panel');
let formTitle = document.querySelector('#titulo-form');
let inputDesc = document.querySelector('#desc');
let inputId = document.querySelector('#insumo-id');
let toggleForm = false;

// Carregamento inicial da tela
atualizarTabela();

// Adicionando listener para fechar o formulário ao clicar fora
formPanel.addEventListener('click' ,function (event) {
    if (event.target.id == this.id) {
        formPanel.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
        toggleForm = !toggleForm;
    }
});

function atualizarTabela() {
    // Limpando tabela
    while(insumosTable.rows.length > 1) {
        insumosTable.deleteRow(1);
    }

    insumoDao.carregarInsumos(null, 0, 10, (row, err) => {
        if (row) {
            let id = row.id;
            let desc = row.descricao;
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

actionButton.addEventListener('click' ,function () {
    if (!toggleForm) {
        // Limpando campos
        inputId.value = '';
        inputDesc.value = '';

        // Exibir formulário de cadastro
        formTitle.innerHTML = 'Novo insumo';
        formPanel.style.display = 'block';
        actionButton.innerHTML = '<i class="fas fa-save"></i>';
        inputDesc.focus();
    } else {
        // Verificar validade dos campos
        if (inputDesc.checkValidity()) {
            let novoInsumo = inputId.value == null || inputId.value.trim() == '';

            if (novoInsumo) {
                // Salvar
                let novoInsumo = new Insumo(null, inputDesc.value);
                insumoDao.salvar(novoInsumo, (id, err) => {
                    if (id) {
                        console.debug(`Novo insumo inserido com id ${id}`);
                        atualizarTabela();
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
            else {
                // Atualizar
                let insumo = new Insumo(inputId.value, inputDesc.value);
                insumoDao.atualizar(insumo, (ie, err) => {
                    if (err) {
                        let msgErro = `Ocorreu um erro ao atualizar um insumo: ${err}`;
                        console.error(msgErro);
                        M.toast({html: msgErro,  classes: 'rounded toastErro'});
                    }
                    else {
                        console.debug(`Insumo atualizado`);
                        atualizarTabela();
                    }

                    formPanel.style.display = 'none';
                    actionButton.innerHTML = '<i class="fas fa-plus"></i>';
                    return;
                });
            }
        }
        else {
            M.toast({html: 'Corrija os campos destacados em vermelho!',  classes: 'rounded toastErro'});
            return;
        }
    }

    toggleForm = !toggleForm;
});

filterButton.addEventListener('click' ,function () {
    alert('filtro clicado');
});

function carregarFormEdicao(event) {
    let element = event.target;

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
                        atualizarTabela();
                    }
                    return;
                });
                uiUtils.closePopup(event);
            }},
            {label: 'Não', cor:'#bfbfbf', cb: uiUtils.closePopup}
        ]);
}