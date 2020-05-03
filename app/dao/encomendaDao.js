const dbDao = require('./dbDao');
const Encomenda = require('../model/encomenda');

exports.salvar = function(encomenda, cb) {
    dbDao.execute(`INSERT INTO encomenda(descricao, tipo_produto, qtde, cores, observacoes, data_encomenda, data_entrega, horas_producao, 
        prazo_envio, data_envio, codigo_rastreamento, nome_cliente, telefone_cliente, email_cliente, cep_endereco_cliente, 
        logradouro_endereco_cliente, numero_endereco_cliente, bairro_endereco_cliente, complemento_endereco_cliente, estado_endereco_cliente, 
        cidade_endereco_cliente, forma_pgto, valor_entrada_venda, valor_entrega_venda, data_pgto, status) 
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, 
        [encomenda.desc, encomenda.tipoProduto, encomenda.qtde, encomenda.cores, encomenda.obs, encomenda.dataEncomenda, 
            encomenda.dataEntrega, encomenda.horasProd, encomenda.prazoEnvio, encomenda.dataEnvio, encomenda.codRastreamento, 
            encomenda.nomeCliente, encomenda.telCliente, encomenda.emailCliente, encomenda.cepEndCliente, encomenda.logEndCliente, 
            encomenda.numEndCliente, encomenda.bairroEndCliente, encomenda.compEndCliente, encomenda.ufEndCliente, encomenda.cidEndCliente, 
            encomenda.formaPgto, encomenda.entradaPgto, encomenda.valorPgto, encomenda.dataPgto, encomenda.statusPgto], cb);
}

exports.atualizar = function(encomenda, cb) {
    dbDao.execute(`UPDATE encomenda SET descricao = ?, tipo_produto = ?, qtde = ?, cores = ?, observacoes = ?, data_encomenda = ?, 
        data_entrega = ?, horas_producao = ?, prazo_envio = ?, data_envio = ?, codigo_rastreamento = ?, nome_cliente = ?, 
        telefone_cliente = ?, email_cliente = ?, cep_endereco_cliente = ?, logradouro_endereco_cliente = ?, numero_endereco_cliente = ?, 
        bairro_endereco_cliente = ?, complemento_endereco_cliente = ?, estado_endereco_cliente = ?, cidade_endereco_cliente = ?, 
        forma_pgto = ?, valor_entrada_venda = ?, valor_entrega_venda = ?, data_pgto = ?, status = ? WHERE id = ?`, 
        [encomenda.desc, encomenda.tipoProduto, encomenda.qtde, encomenda.cores, encomenda.obs, encomenda.dataEncomenda, 
            encomenda.dataEntrega, encomenda.horasProd, encomenda.prazoEnvio, encomenda.dataEnvio, encomenda.codRastreamento, 
            encomenda.nomeCliente, encomenda.telCliente, encomenda.emailCliente, encomenda.cepEndCliente, encomenda.logEndCliente, 
            encomenda.numEndCliente, encomenda.bairroEndCliente, encomenda.compEndCliente, encomenda.ufEndCliente, encomenda.cidEndCliente, 
            encomenda.formaPgto, encomenda.entradaPgto, encomenda.valorPgto, encomenda.dataPgto, encomenda.statusPgto, encomenda.id], cb);
}

exports.remover = function(id, cb) {
    dbDao.execute('UPDATE encomenda SET ativo = 0 WHERE id = ?', [id], cb);
}

exports.consultar = function(id, cb) {
    dbDao.selectFirst('SELECT * FROM encomenda WHERE id = ?', [id], (registro, err) => {
        cb(new Encomenda(registro.id, registro.descricao, registro.tipo_produto, registro.qtde, registro.cores, registro.observacoes, 
            registro.data_encomenda, registro.data_entrega, registro.horas_producao, registro.prazo_envio, registro.data_envio,
            registro.codigo_rastreamento, registro.nome_cliente, registro.telefone_cliente, registro.email_cliente, registro.cep_endereco_cliente, 
            registro.logradouro_endereco_cliente, registro.numero_endereco_cliente, registro.bairro_endereco_cliente, registro.complemento_endereco_cliente, 
            registro.estado_endereco_cliente, registro.cidade_endereco_cliente, registro.forma_pgto, registro.valor_entrada_venda, 
            registro.valor_entrega_venda, registro.data_pgto, registro.status));
    });
}

exports.carregarEncomendas = function(filtro, pagina, tamPagina, cb) {
    let query = 'SELECT * FROM encomenda WHERE ativo = 1 ';

    // Assegurando que string vazia não filtrará resultados
    filtro = filtro && filtro.trim() != '' ? filtro : null;
    
    if (filtro) {
        query += `
            AND (
                id = ?
                OR descricao LIKE '%' || ? || '%'
                OR nome_cliente LIKE '%' || ? || '%'
                OR tipo_produto LIKE '%' || ? || '%'
                OR data_encomenda LIKE '%' || ? || '%'
                OR data_entrega LIKE '%' || ? || '%'
            ) `;
    }

    if (pagina != null && tamPagina != null) {
        query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
    }
    
    dbDao.selectEach(query, filtro ? [filtro, filtro, filtro] : [], cb);
}