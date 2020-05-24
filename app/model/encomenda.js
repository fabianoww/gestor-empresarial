class Encomenda {
    constructor(id, desc, tipoProduto, qtde, cores, obs, dataEncomenda, dataEntrega, horasProd, prazoEnvio, dataEnvio,
        codRastreamento, nomeCliente, telCliente, emailCliente, cepEndCliente, logEndCliente, numEndCliente, bairroEndCliente,
        compEndCliente, ufEndCliente, cidEndCliente, formaPgto, entradaPgto, valorPgto, dataPgto, statusPgto, insumos) {
      this.id = id;
      this.desc = desc;
      this.tipoProduto = tipoProduto;
      this.qtde = qtde;
      this.cores = cores;
      this.obs = obs;
      this.dataEncomenda = dataEncomenda;
      this.dataEntrega = dataEntrega;
      this.horasProd = horasProd;
      this.prazoEnvio = prazoEnvio;
      this.dataEnvio = dataEnvio;
      this.codRastreamento = codRastreamento;
      this.nomeCliente = nomeCliente;
      this.telCliente = telCliente;
      this.emailCliente = emailCliente;
      this.cepEndCliente = cepEndCliente;
      this.logEndCliente = logEndCliente;
      this.numEndCliente = numEndCliente;
      this.bairroEndCliente = bairroEndCliente;
      this.compEndCliente = compEndCliente;
      this.ufEndCliente = ufEndCliente;
      this.cidEndCliente = cidEndCliente;
      this.formaPgto = formaPgto;
      this.entradaPgto = entradaPgto;
      this.valorPgto = valorPgto;
      this.dataPgto = dataPgto;
      this.statusPgto = statusPgto;
      this.insumos = insumos;
    }
}

module.exports = Encomenda;