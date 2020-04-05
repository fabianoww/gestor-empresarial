const fs = require('fs');

let dashboard = null;
let despesas = null;
let produtos = null;
let insumos = null;
let configuracoes = null;
let encomendas = null;
let fornecedores = null;
let menuDashboard = document.querySelector('#menu-dashboard');
let menuFluxoCaixa = document.querySelector('#menu-fluxo-caixa');
let menuProdutos = document.querySelector('#menu-produtos');
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
    } else {
        fs.readFile(`${__dirname}/../view/dashboard.html`, (err, data) => {
            dashboard = data;
            document.getElementById('content').innerHTML = dashboard;
        });
    }
    menuDashboard.className = 'selected-menu';
});

menuFluxoCaixa.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (despesas) {
        document.getElementById('content').innerHTML = despesas;
    } else {
        fs.readFile(`${__dirname}/../view/fluxoCaixa.html`, (err, data) => {
            despesas = data;
            document.getElementById('content').innerHTML = despesas;
            require('./fluxoCaixaRenderer.js');
        });
    }
    menuFluxoCaixa.className = 'selected-menu';
});

menuProdutos.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (produtos) {
        document.getElementById('content').innerHTML = produtos;
    } else {
        fs.readFile(`${__dirname}/../view/produtos.html`, (err, data) => {
            produtos = data;
            document.getElementById('content').innerHTML = produtos;
        });
    }
    menuProdutos.className = 'selected-menu';
});

menuInsumos.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (insumos) {
        document.getElementById('content').innerHTML = insumos;
    } else {
        fs.readFile(`${__dirname}/../view/insumos.html`, (err, data) => {
            insumos = data;
            document.getElementById('content').innerHTML = insumos;
        });
    }
    menuInsumos.className = 'selected-menu';
});

menuConfiguracoes.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (configuracoes) {
        document.getElementById('content').innerHTML = configuracoes;
    } else {
        fs.readFile(`${__dirname}/../view/configuracoes.html`, (err, data) => {
            configuracoes = data;
            document.getElementById('content').innerHTML = configuracoes;
        });
    }
    menuConfiguracoes.className = 'selected-menu';
});

menuEncomendas.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (encomendas) {
        document.getElementById('content').innerHTML = encomendas;
    } else {
        fs.readFile(`${__dirname}/../view/encomendas.html`, (err, data) => {
            encomendas = data;
            document.getElementById('content').innerHTML = encomendas;
        });
    }
    menuEncomendas.className = 'selected-menu';
});

menuFornecedores.addEventListener('click' ,function () {
    clearSelectedMenu();
    if (fornecedores) {
        document.getElementById('content').innerHTML = fornecedores;
    } else {
        fs.readFile(`${__dirname}/../view/fornecedores.html`, (err, data) => {
            fornecedores = data;
            document.getElementById('content').innerHTML = fornecedores;
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