let actionButton = document.querySelector('#action-caixa-btn');
let filterButton = document.querySelector('#filter-caixa-btn');
let formPanel = document.querySelector('#fluxo-caixa-form-panel');
let formTitle = document.querySelector('#titulo-form');
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
    } else {
        // Salvar
    }

    formPanel.style.display = toggleForm ? 'none' : 'block';
    actionButton.innerHTML = toggleForm ? '<i class="fas fa-plus"></i>' : '<i class="fas fa-save"></i>';
    toggleForm = !toggleForm;
});

filterButton.addEventListener('click' ,function () {
    alert('filtro clicado');
});