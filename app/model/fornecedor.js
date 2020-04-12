class Fornecedor {
    constructor(id, nome, tipo, online, telefone, email, site) {
      this.id = id;
      this.nome = nome;
      this.tipo = tipo;
      this.online = online;
      this.telefone = telefone;
      this.email = email;
      this.site = site;
    }
}

module.exports = Fornecedor;