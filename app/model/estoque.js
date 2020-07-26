class Estoque {
    constructor(id, descricao, tamanho, valor, local, imagem, insumos) {
      this.id = id;
      this.descricao = descricao;
      this.tamanho = tamanho;
      this.valor = valor;
      this.local = local;
      this.imagem = imagem;
      this.insumos = insumos;
    }
}

module.exports = Estoque;