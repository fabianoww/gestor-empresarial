let actionButton = document.querySelector('#action-caixa-btn');
let filterButton = document.querySelector('#filter-caixa-btn');
let formPanel = document.querySelector('#fluxo-caixa-form-panel');
let formTitle = document.querySelector('#titulo-form');
let inputValor = document.querySelector('#valor');
let toggleForm = false;

var elems = document.querySelectorAll('.datepicker');
var instances = M.Datepicker.init(elems, {
        format: 'dd/mm/yyyy', 
        defaultDate: new Date(), 
        setDefaultDate: true, 
        autoClose: true,
        i18n: {
            cancel: 'Cancelar',
            clear: 'Limpar',
            done: 'Ok',
            months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
            monthsShort: ["Jan", "Feb", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dec"],
            weekdays: ["Domingo","Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
            weekdaysShort: ["Dom","Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
            weekdaysAbbrev: ["D","S", "T", "Q", "Q", "S", "S"]
        }
    });

actionButton.addEventListener('click' ,function () {
    if (!toggleForm) {
        // Exibir formulário de cadastro
        formTitle.innerHTML = 'Novo fluxo de caixa';
        formPanel.style.display = 'block';
        actionButton.innerHTML = '<i class="fas fa-save"></i>';
        inputValor.focus();
    } else {
        // Salvar
        formPanel.style.display = 'none';
        actionButton.innerHTML = '<i class="fas fa-plus"></i>';
    }

    toggleForm = !toggleForm;
});

filterButton.addEventListener('click' ,function () {
    alert('filtro clicado');
});

inputValor.addEventListener('keypress' ,function (event) {
    if (event.keyCode < 48 || event.keyCode > 57) {
        event.preventDefault();
    }
});

inputValor.addEventListener('keyup' ,function (event) {
    let valor = event.target.value.replace(/\D/g,'');

    while (valor.length < 3) {
        valor = '0' + valor;
    }

    valor = Number(valor.slice(0, valor.length -2) + '.' + valor.slice(valor.length -2, valor.length));
    event.target.value = valor.toLocaleString('pt-BR', {minimumFractionDigits: 2});
});