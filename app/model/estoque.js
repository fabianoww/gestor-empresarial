class Estoque {
    constructor(id, descricao, tamanho, valor, local, imagem) {
      this.id = id;
      this.descricao = descricao;
      this.tamanho = tamanho;
      this.valor = valor;
      this.local = local;
      this.imagem = imagem;
    }
}

module.exports = Estoque;