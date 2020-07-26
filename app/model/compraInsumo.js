class CompraInsumo {
    constructor(id, idInsumo, qtde, valor, frete, qtdeParcelas, dataCompra, dataDebito, dataEntrega, idFornecedor) {
      this.id = id;
      this.idInsumo = idInsumo;
      this.qtde = qtde;
      this.valor = valor;
      this.frete = frete;
      this.qtdeParcelas = qtdeParcelas;
      this.dataCompra = dataCompra;
      this.dataDebito = dataDebito;
      this.dataEntrega = dataEntrega;
      this.idFornecedor = idFornecedor;
    }
}

module.exports = CompraInsumo;