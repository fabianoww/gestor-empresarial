const uiUtils = require('../utils/uiUtils');
const dashboardDao = require('../dao/dashboardDao');
const Chart = require('chart.js');

let saldoAtualPanel = null;
let gastosFuturosTable = null;
let proximasEncomendasTable = null;
let alertasEstoqueTable = null;
let historicoBalancosCanvas = null;

// Inicialização da tela
exports.initTela = initTela;

function initTela() {

    saldoAtualPanel = document.querySelector('#saldo-panel');
    gastosFuturosTable = document.querySelector('#gastos-futuros-table');
    proximasEncomendasTable = document.querySelector('#proximas-encomendas-table');
    alertasEstoqueTable = document.querySelector('#alertas-estoque-table');
    historicoBalancosCanvas = document.querySelector('#historico-balancos-panel');

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

    dashboardDao.carregarHistoricoBalancos((registros, err) => {
        
        if (registros) {
            let data = {};
            for (let i = 0; i < registros.length; i++) {
                const item = registros[i];
                let periodo = item.periodo.substring(4) + '/' + item.periodo.substring(0, 4)
                if (!data[periodo]) {
                    data[periodo] = {
                        receita: 0.0,
                        despesa: 0.0
                    }
                }

                if (item.tipo == 'C') {
                    data[periodo].receita = item.valor;
                } else {
                    data[periodo].despesa = item.valor;
                }
            }

            let dataReceita = [];
            let dataDespesa = [];
            let colorReceita = [];
            let colorDespesa = [];
            for (let i = 0; i < Object.keys(data).length; i++) {
                const key = Object.keys(data)[i];
                dataReceita[dataReceita.length] = data[key].receita;
                dataDespesa[dataDespesa.length] = data[key].despesa;
                colorReceita[colorReceita.length] = 'rgba(76, 175, 80, 0.5)';
                colorDespesa[colorDespesa.length] = 'rgba(244, 67, 64, 0.5)';
            }

            var myChart = new Chart(historicoBalancosCanvas, {
                type: 'bar',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label: 'Receitas',
                        data: dataReceita,
                        backgroundColor: colorReceita,
                        borderWidth: 0
                    },{
                        label: 'Despesas',
                        data: dataDespesa,
                        backgroundColor: colorDespesa,
                        borderWidth: 0
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }

        if (err) {
            let msgErro = `Ocorreu um erro ao carregar o histórico de balanços: ${err}`;
            console.error(msgErro);
            M.toast({html: msgErro,  classes: 'rounded toastErro'});
        }
    });
}

function drawChart() {
    console.log('charrrrr');
    // Standard google charts functionality is available as GoogleCharts.api after load
    const data = GoogleCharts.api.visualization.arrayToDataTable([
        ['Chart thing', 'Chart amount'],
        ['Lorem ipsum', 60],
        ['Dolor sit', 22],
        ['Sit amet', 18]
    ]);
    const pie_1_chart = new GoogleCharts.api.visualization.PieChart(document.getElementById('historico-balancos-panel'));
    pie_1_chart.draw(data);
}