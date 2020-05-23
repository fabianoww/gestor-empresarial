const uiUtils = require('../utils/uiUtils');
const dashboardDao = require('../dao/dashboardDao');

let saldoAtualPanel = null;
let gastosFuturosTable = null;
let proximasEncomendasTable = null;
let alertasEstoqueTable = null;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {

    saldoAtualPanel = document.querySelector('#saldo-panel');
    gastosFuturosTable = document.querySelector('#gastos-futuros-table');
    proximasEncomendasTable = document.querySelector('#proximas-encomendas-table');
    alertasEstoqueTable = document.querySelector('#alertas-estoque-table');

    dashboardDao.carregarSaldoAtual((saldo) => {
        saldoAtualPanel.classList.remove("saldo-positivo");
        saldoAtualPanel.classList.remove("saldo-negativo");

        if (saldo > 0) {
            saldoAtualPanel.classList.add("saldo-positivo");
        }

        if (saldo < 0) {
            saldoAtualPanel.classList.add("saldo-negativo");
        }

        saldoAtualPanel.innerHTML = uiUtils.converterNumberParaMoeda(saldo);
    });

    dashboardDao.carregarGastosFuturos((registro, err) => {
        if (registro) {
            var row = gastosFuturosTable.insertRow();
            row.insertCell().innerHTML = registro.descricao;
            row.insertCell().innerHTML = registro.data;
            
            let valorCol = row.insertCell()
            valorCol.innerHTML = uiUtils.converterNumberParaMoeda(registro.valor);
            valorCol.style = 'text-align: right;';
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os gastos futuros: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }

    });

    dashboardDao.carregarProximasEncomendas((registro, err) => {
        if (registro) {
            var row = proximasEncomendasTable.insertRow();
            row.insertCell().innerHTML = registro.descricao;
            row.insertCell().innerHTML = registro.nome_cliente;
            row.insertCell().innerHTML = registro.data_entrega;
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar as próximas encomendas: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });

    dashboardDao.carregarAlertasEstoque((registro, err) => {
        if (registro) {
            var row = alertasEstoqueTable.insertRow();
            row.insertCell().innerHTML = registro.descricao;
            row.insertCell().innerHTML = registro.estoque;
            row.insertCell().innerHTML = registro.qtde_minima;
            row.insertCell().innerHTML = registro.deficit;
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar os alertas de estoque: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });
}