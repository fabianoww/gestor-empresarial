class Fornecedor {
    constructor(id, nome, tipo, online, telefoneFixo, telefoneCelular, email, site) {
      this.id = id;
      this.nome = nome;
      this.tipo = tipo;
      this.online = online;
      this.telefoneFixo = telefoneFixo;
      this.telefoneCelular = telefoneCelular;
      this.email = email;
      this.site = site;
    }
}

module.exports = Fornecedor;