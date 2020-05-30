const dbDao = require('./dbDao');
const Encomenda = require('../model/encomenda');

exports.salvar = function(encomenda, cb) {
    let statements = [];
    let queryIdEntrada = null;

    if (encomenda.formaPgto && encomenda.formaPgto == 'ENT+1') {
        // Gravando movimetação do valor de entrada
        statements[statements.length] = {
            query: 'INSERT INTO movimentacao_caixa (categoria, descricao, debito_credito, data, valor) VALUES(?,?,?,?,?)', 
            params: ['Venda (encomenda)', `Entrada da venda de ${encomenda.desc}`, 'C', encomenda.dataEncomenda, encomenda.entradaPgto.valueOf()], 
            cb: (err) => {
                if (err) {
                    console.debug(`Erro ao inserir a movimentação de caixa da entrada da venda: ${err}`);
                }
            }};

        queryIdEntrada = 'SELECT id FROM movimentacao_caixa ORDER BY id DESC LIMIT 1 OFFSET 1';
    }
    else {
        queryIdEntrada = 'NULL'
    }

    // Gravando movimentação do valor principal
    statements[statements.length] = {
        query: 'INSERT INTO movimentacao_caixa (categoria, descricao, debito_credito, data, valor) VALUES(?,?,?,?,?)', 
        params: ['Venda (encomenda)', `Venda de ${encomenda.desc}`, 'C', encomenda.dataPgto, encomenda.valorPgto.valueOf()], 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao inserir a movimentação de caixa da venda: ${err}`);
            }
        }};

    // Gravando encomenda
    let entrada = encomenda.entradaPgto ? encomenda.entradaPgto.valueOf() : null;
    let valor = encomenda.valorPgto ? encomenda.valorPgto.valueOf() : null;
    statements[statements.length] = {
        query: `INSERT INTO encomenda(descricao, tipo_produto, qtde, cores, observacoes, data_encomenda, data_entrega, horas_producao, 
            prazo_envio, data_envio, codigo_rastreamento, nome_cliente, telefone_cliente, email_cliente, cep_endereco_cliente, 
            logradouro_endereco_cliente, numero_endereco_cliente, bairro_endereco_cliente, complemento_endereco_cliente, estado_endereco_cliente, 
            cidade_endereco_cliente, forma_pgto, valor_entrada_venda, valor_entrega_venda, data_pgto, status, id_movimentacao_caixa_entrada, id_movimentacao_caixa_princ) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, (${queryIdEntrada}), (SELECT id FROM movimentacao_caixa ORDER BY id DESC LIMIT 1))`, 
        params: [encomenda.desc, encomenda.tipoProduto, encomenda.qtde, encomenda.cores, encomenda.obs, encomenda.dataEncomenda, 
            encomenda.dataEntrega, encomenda.horasProd, encomenda.prazoEnvio, encomenda.dataEnvio, encomenda.codRastreamento, 
            encomenda.nomeCliente, encomenda.telCliente, encomenda.emailCliente, encomenda.cepEndCliente, encomenda.logEndCliente, 
            encomenda.numEndCliente, encomenda.bairroEndCliente, encomenda.compEndCliente, encomenda.ufEndCliente, encomenda.cidEndCliente, 
            encomenda.formaPgto, entrada, valor, encomenda.dataPgto, encomenda.statusPgto], 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao inserir a encomenda: ${err}`);
            }
        }}; 
        
    let queryInsumoProduto = 'INSERT INTO insumo_produto(qtde, id_encomenda, id_estoque_insumo) VALUES ';
    let paramsInsumoProduto = [];
    for (let i = 0; i < encomenda.insumos.length; i++) {
        const insumo = encomenda.insumos[i];

        // Gerando INSERTS para o insumo_produto
        if (i > 0) {
            queryInsumoProduto += ','
        }

        queryInsumoProduto += '(?,(SELECT id FROM encomenda ORDER BY id DESC LIMIT 1),(SELECT id FROM estoque_insumos WHERE id_insumo = ? LIMIT 1))';
        paramsInsumoProduto[paramsInsumoProduto.length] = insumo.qtdeInsumo;
        paramsInsumoProduto[paramsInsumoProduto.length] = insumo.idInsumo;

        // Atualizando a quantidade em estoque do insumo
        statements[statements.length] = {
            query: 'UPDATE estoque_insumos SET qtde = qtde - ? WHERE id_insumo = ?', 
            params: [insumo.qtdeInsumo, insumo.idInsumo], 
            cb: (err) => {
                if (err) {
                    console.debug(`Erro ao atualizar a quantidade de estoque dos insumos: ${err}`);
                }
            }};
    }
    
    // Executando o INSERT do insumo_produto
    statements[statements.length] = {
        query: queryInsumoProduto, 
        params: paramsInsumoProduto, 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao inserir os insumos utilizados pela encomenda: ${err}`);
            }
        }};
    
    dbDao.executeInTransaction(statements, cb);
}

exports.atualizar = function(encomenda, cb) {
    let statements = [];
    let queryIdEntrada = null;

    // Removendo movimentações  existentes
    statements[statements.length] = {
        query: `DELETE FROM movimentacao_caixa WHERE id = (SELECT id_movimentacao_caixa_entrada FROM encomenda WHERE id = ?)
            OR id = (SELECT id_movimentacao_caixa_princ FROM encomenda WHERE id = ?)`, 
        params: [encomenda.id, encomenda.id], 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao deletar aa movimentações de caixa da venda: ${err}`);
            }
        }};

    if (encomenda.formaPgto && encomenda.formaPgto == 'ENT+1') {
        // Gravando movimetação do valor de entrada
        statements[statements.length] = {
            query: 'INSERT INTO movimentacao_caixa (categoria, descricao, debito_credito, data, valor) VALUES(?,?,?,?,?)', 
            params: ['Venda (encomenda)', `Entrada da venda de ${encomenda.desc}`, 'C', encomenda.dataEncomenda, encomenda.entradaPgto.valueOf()], 
            cb: (err) => {
                if (err) {
                    console.debug(`Erro ao inserir a movimentação de caixa da entrada da venda: ${err}`);
                }
            }};

        queryIdEntrada = 'SELECT id FROM movimentacao_caixa ORDER BY id DESC LIMIT 1 OFFSET 1';
    }
    else {
        queryIdEntrada = 'NULL'
    }

    // Gravando movimentação do valor principal
    statements[statements.length] = {
        query: 'INSERT INTO movimentacao_caixa (categoria, descricao, debito_credito, data, valor) VALUES(?,?,?,?,?)', 
        params: ['Venda (encomenda)', `Venda de ${encomenda.desc}`, 'C', encomenda.dataPgto, encomenda.valorPgto.valueOf()], 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao inserir a movimentação de caixa da venda: ${err}`);
            }
        }};

    // Atualizando encomenda
    statements[statements.length] = {
        query: `UPDATE encomenda SET descricao = ?, tipo_produto = ?, qtde = ?, cores = ?, observacoes = ?, data_encomenda = ?, 
        data_entrega = ?, horas_producao = ?, prazo_envio = ?, data_envio = ?, codigo_rastreamento = ?, nome_cliente = ?, 
        telefone_cliente = ?, email_cliente = ?, cep_endereco_cliente = ?, logradouro_endereco_cliente = ?, numero_endereco_cliente = ?, 
        bairro_endereco_cliente = ?, complemento_endereco_cliente = ?, estado_endereco_cliente = ?, cidade_endereco_cliente = ?, 
        forma_pgto = ?, valor_entrada_venda = ?, valor_entrega_venda = ?, data_pgto = ?, status = ?, id_movimentacao_caixa_entrada = (${queryIdEntrada}), 
        id_movimentacao_caixa_princ = (SELECT id FROM movimentacao_caixa ORDER BY id DESC LIMIT 1) WHERE id = ?`, 
        params: [encomenda.desc, encomenda.tipoProduto, encomenda.qtde, encomenda.cores, encomenda.obs, encomenda.dataEncomenda, 
            encomenda.dataEntrega, encomenda.horasProd, encomenda.prazoEnvio, encomenda.dataEnvio, encomenda.codRastreamento, 
            encomenda.nomeCliente, encomenda.telCliente, encomenda.emailCliente, encomenda.cepEndCliente, encomenda.logEndCliente, 
            encomenda.numEndCliente, encomenda.bairroEndCliente, encomenda.compEndCliente, encomenda.ufEndCliente, encomenda.cidEndCliente, 
            encomenda.formaPgto, encomenda.entradaPgto.valueOf(), encomenda.valorPgto.valueOf(), encomenda.dataPgto, encomenda.statusPgto, encomenda.id], 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao atualizar a encomenda: ${err}`);
            }
        }}; 

    dbDao.selectAll('SELECT id_estoque_insumo, qtde FROM insumo_produto WHERE id_encomenda = ?', [encomenda.id], (registros, err) => {
        
        for (let i = 0; i < registros.length; i++) {
            const estoqueInsumo = registros[i];

            // Revertendo a quantidade em estoque do insumo
            statements[statements.length] = {
                query: 'UPDATE estoque_insumos SET qtde = qtde + ? WHERE id_insumo = ?', 
                params: [estoqueInsumo.qtde, estoqueInsumo.id_estoque_insumo], 
                cb: (err) => {
                    if (err) {
                        console.debug(`Erro ao reverter a quantidade de estoque dos insumos: ${err}`);
                    }
                }};            
        }
        
        // Deletando os insumos relacionados à encomenda
        statements[statements.length] = {
            query: 'DELETE FROM insumo_produto WHERE id_encomenda = ?', 
            params: [encomenda.id], 
            cb: (err) => {
                if (err) {
                    console.debug(`Erro ao deletar os insumos relacionados à encomenda: ${err}`);
                }
            }}; 

        let queryInsumoProduto = 'INSERT INTO insumo_produto(qtde, id_encomenda, id_estoque_insumo) VALUES ';
        let paramsInsumoProduto = [];
        for (let i = 0; i < encomenda.insumos.length; i++) {
            const insumo = encomenda.insumos[i];

            // Gerando INSERTS para o insumo_produto
            if (i > 0) {
                queryInsumoProduto += ','
            }

            queryInsumoProduto += '(?,?,(SELECT id FROM estoque_insumos WHERE id_insumo = ? LIMIT 1))';
            paramsInsumoProduto[paramsInsumoProduto.length] = insumo.qtdeInsumo;
            paramsInsumoProduto[paramsInsumoProduto.length] = encomenda.id;
            paramsInsumoProduto[paramsInsumoProduto.length] = insumo.idInsumo;

            // Atualizando a quantidade em estoque do insumo
            statements[statements.length] = {
                query: 'UPDATE estoque_insumos SET qtde = qtde - ? WHERE id_insumo = ?', 
                params: [insumo.qtdeInsumo, insumo.idInsumo], 
                cb: (err) => {
                    if (err) {
                        console.debug(`Erro ao atualizar a quantidade de estoque dos insumos: ${err}`);
                    }
                }};
        }

        // Executando o INSERT do insumo_produto
        statements[statements.length] = {
            query: queryInsumoProduto, 
            params: paramsInsumoProduto, 
            cb: (err) => {
                if (err) {
                    console.debug(`Erro ao inserir os insumos utilizados pela encomenda: ${err}`);
                }
            }};

        dbDao.executeInTransaction(statements, cb);
    });

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

exports.carregarInsumos = function(idEncomenda, cb) {
    dbDao.selectEach(`
        SELECT i.id, i.descricao, ip.qtde, (ei.preco_medio * ip.qtde) as custo FROM insumo_produto ip 
        JOIN estoque_insumos ei ON ip.id_estoque_insumo = ei.id
        JOIN insumo i ON i.id = ei.id_insumo
        WHERE id_encomenda = ?`, [idEncomenda], cb);
}

exports.carregarEncomendas = function(filtro, pagina, tamPagina, cb) {
    let query = 'SELECT COUNT(*) AS total FROM encomenda WHERE ativo = 1 ';

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

    dbDao.selectFirst(query, filtro ? [filtro, filtro, filtro] : [], (row, err) => {
        
        if (err) {
            cb(null, err);
            return;
        } 
        
        let total = row.total;
        if (total == 0) {
            cb({total: 0, registros: []}, null);
            return;
        }
        
        query = query.replace('COUNT(*) AS total', '*');

        if (pagina != null && tamPagina != null) {
            query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
        }

        dbDao.selectAll(query, filtro ? [filtro, filtro, filtro] : [], (rows, err) => {
            
            if (err) {
                cb(null, err);
                return;
            } 

            let result = {
                total: total,
                registros: rows
            };

            cb(result, null);
        });
    })
}