const Insumo  = require('../model/insumo');
const insumoDao = require('../dao/insumoDao');

let insumosTable = document.querySelector('#insumos-table');
let actionButton = document.querySelector('#action-insumo-btn');
let filterButton = document.querySelector('#filter-insumo-btn');
let formPanel = document.querySelector('#insumo-form-panel');
let formTitle = document.querySelector('#titulo-form');
let inputDesc = document.querySelector('#desc');
let toggleForm = false;

// Carregamento inicial da tela
atualizarTabela();


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
        }

        if (err) {
            console.error(err);
        }
    });
}

actionButton.addEventListener('click' ,function () {
    if (!toggleForm) {
        // Exibir formulário de cadastro
        formTitle.innerHTML = 'Novo insumo';
        formPanel.style.display = 'block';
        actionButton.innerHTML = '<i class="fas fa-save"></i>';
        inputDesc.focus();
    } else {
        // Verificar validade dos campos
        if (inputDesc.checkValidity()) {
            // Salvar
            let novoInsumo = new Insumo(inputDesc.value);
            insumoDao.salvar(novoInsumo, (id, err) => {
                if (id) {
                    console.debug(`Novo insumo inserido com id ${id}`);
                    atualizarTabela();
                }
                else {
                    console.error(`Ocorreu um erro ao inserir um novo insumo: ${err}`);
                    M.toast({html: err,  classes: 'rounded toastErro'});
                }

                formPanel.style.display = 'none';
                actionButton.innerHTML = '<i class="fas fa-plus"></i>';
                return;
            });
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