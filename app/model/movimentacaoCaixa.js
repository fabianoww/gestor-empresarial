class MovimentacaoCaixa {
    constructor(id, descricao, tipo, categoria, data, valor) {
      this.id = id;
      this.descricao = descricao;
      this.tipo = tipo;
      this.categoria = categoria;
      this.data = data;
      this.valor = valor;
    }
}

module.exports = MovimentacaoCaixa;