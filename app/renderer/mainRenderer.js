const fs = require('fs');

let dashboard = null;
let dashboardRenderer = null;
let fluxoCaixa = null;
let fluxoCaixaRenderer = null;
let estoques = null;
let estoqueRenderer = null;
let insumos = null;
let insumosRenderer = null;
let configuracoes = null;
let configuracoesRenderer = null;
let encomendas = null;
let encomendasRenderer = null;
let fornecedores = null;
let fornecedoresRenderer = null;
let menuDashboard = document.querySelector('#menu-dashboard');
let menuFluxoCaixa = document.querySelector('#menu-fluxo-caixa');
let menuestoques = document.querySelector('#menu-estoques');
let menuInsumos = document.querySelector('#menu-insumos');
let menuConfiguracoes = document.querySelector('#menu-configuracoes');
let menuEncomendas = document.querySelector('#menu-encomendas');
let menuFornecedores = document.querySelector('#menu-fornecedores');
let toggleMenu = document.querySelector('#menu-slider');

let menuExpandido = true;

window.onload = () => {
    menuDashboard.click();
}

function clearSelectedMenu() {
    let selectedItens = document.querySelector('.selected-menu');
    if (selectedItens) {
        selectedItens.className = '';
    }
}

menuDashboard.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (dashboard) {
        document.getElementById('content').innerHTML = dashboard;
        dashboardRenderer.initTela();
    } else {
        fs.readFile(`${__dirname}/../view/dashboard.html`, (err, data) => {
            dashboard = data;
            document.getElementById('content').innerHTML = dashboard;
            dashboardRenderer = require('./dashboardRenderer.js');
            dashboardRenderer.initTela();
        });
    }
    menuDashboard.className = 'selected-menu';
});

menuFluxoCaixa.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (fluxoCaixa) {
        document.getElementById('content').innerHTML = fluxoCaixa;
        fluxoCaixaRenderer.initTela();
    } else {
        fs.readFile(`${__dirname}/../view/fluxoCaixa.html`, (err, data) => {
            fluxoCaixa = data;
            document.getElementById('content').innerHTML = fluxoCaixa;
            fluxoCaixaRenderer = require('./fluxoCaixaRenderer.js');
            fluxoCaixaRenderer.initTela();
        });
    }
    menuFluxoCaixa.className = 'selected-menu';
});

menuestoques.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (estoques) {
        document.getElementById('content').innerHTML = estoques;
        estoqueRenderer.initTela();
    } else {
        fs.readFile(`${__dirname}/../view/estoques.html`, (err, data) => {
            estoques = data;
            document.getElementById('content').innerHTML = estoques;
            estoqueRenderer = require('./estoqueRenderer.js');
            estoqueRenderer.initTela();
        });
    }
    menuestoques.className = 'selected-menu';
});

menuInsumos.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (insumos) {
        document.getElementById('content').innerHTML = insumos;
        insumosRenderer.initTela();
    } else {
        fs.readFile(`${__dirname}/../view/insumos.html`, (err, data) => {
            insumos = data;
            document.getElementById('content').innerHTML = insumos;
            insumosRenderer = require('./insumosRenderer.js');
            insumosRenderer.initTela();
        });
    }
    menuInsumos.className = 'selected-menu';
});

menuConfiguracoes.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (configuracoes) {
        document.getElementById('content').innerHTML = configuracoes;
        configuracoesRenderer.initTela();
    } else {
        fs.readFile(`${__dirname}/../view/configuracoes.html`, (err, data) => {
            configuracoes = data;
            document.getElementById('content').innerHTML = configuracoes;
            configuracoesRenderer = require('./configuracoesRenderer.js');
            configuracoesRenderer.initTela();
        });
    }
    menuConfiguracoes.className = 'selected-menu';
});

menuEncomendas.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (encomendas) {
        document.getElementById('content').innerHTML = encomendas;
        encomendasRenderer.initTela();
    } else {
        fs.readFile(`${__dirname}/../view/encomendas.html`, (err, data) => {
            encomendas = data;
            document.getElementById('content').innerHTML = encomendas;
            encomendasRenderer = require('./encomendasRenderer.js');
            encomendasRenderer.initTela();
        });
    }
    menuEncomendas.className = 'selected-menu';
});

menuFornecedores.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (fornecedores) {
        document.getElementById('content').innerHTML = fornecedores;
        fornecedoresRenderer.initTela();
    } else {
        fs.readFile(`${__dirname}/../view/fornecedores.html`, (err, data) => {
            fornecedores = data;
            document.getElementById('content').innerHTML = fornecedores;
            fornecedoresRenderer = require('./fornecedoresRenderer.js');
            fornecedoresRenderer.initTela();
        });
    }
    menuFornecedores.className = 'selected-menu';
});

toggleMenu.addEventListener('click' ,function () {
    let labels = document.querySelectorAll('.menu-label');
    labels.forEach(label => {
        label.style.display = menuExpandido ? "none" : "inline-block"; 
    });

    let spacers = document.querySelectorAll('#menu-items hr');
    spacers.forEach(spacer => {
        spacer.style.width = menuExpandido ? "60px" : "";
    });

    document.querySelector('#vertical-menu').style.width = menuExpandido ? "70px" : "";
    document.querySelector('#menu-slider-left').style.display = menuExpandido ? 'none' : 'block';
    document.querySelector('#menu-slider-right').style.display = menuExpandido ? 'block' : 'none';

    menuExpandido = !menuExpandido;
});