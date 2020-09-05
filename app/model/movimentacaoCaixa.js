class MovimentacaoCaixa {
    constructor(id, descricao, categoria, data, valor) {
      this.id = id;
      this.descricao = descricao;
      this.categoria = categoria;
      this.data = data;
      this.valor = valor;
    }

    obterTipo() {
      switch(this.categoria) {
        case 'Compra de insumo':
        case 'Despesa fixa':
        case 'Despesa variável':
        case 'Investimento':
          return 'D';

        case 'Recebimento':
        case 'Aporte financeiro':
          return 'C'
      }
    }
}

module.exports = MovimentacaoCaixa;