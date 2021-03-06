const dbDao = require('./dbDao');

exports.salvar = function(insumo, cb) {
    dbDao.execute('INSERT INTO insumo(descricao, qtde_minima) VALUES(?,?)', [insumo.desc, insumo.qtdeMin], cb);
}

exports.atualizar = function(insumo, cb) {
    dbDao.execute('UPDATE insumo SET descricao = ?, qtde_minima = ? WHERE id = ?', [insumo.desc, insumo.qtdeMin, insumo.id], cb);
}

exports.remover = function(id, cb) {
    dbDao.execute('UPDATE insumo SET ativo = 0 WHERE id = ?', [id], cb);
}

exports.carregarInsumos = function(filtro, pagina, tamPagina, cb) {
    
    let query = `
        SELECT COUNT(*) AS total
        FROM insumo i 
        LEFT JOIN estoque_insumos e ON i.id = e.id_insumo
        WHERE ativo = 1 `;

    // Assegurando que string vazia não filtrará resultados
    filtro = filtro && filtro.trim() != '' ? filtro : null;
    
    if (filtro) {
        query += `
            AND (
                i.id = ?
                OR i.descricao LIKE '%' || ? || '%'
            ) `;
    }


    dbDao.selectFirst(query, filtro ? [filtro, filtro] : [], (row, err) => {
        
        if (err) {
            cb(null, err);
            return;
        } 
        
        let total = row.total;
        if (total == 0) {
            cb({total: 0, registros: []}, null);
            return;
        }
        
        query = query.replace('COUNT(*) AS total', 'i.id, i.descricao, i.qtde_minima, i.ativo, e.qtde, e.preco_medio');
        query += 'ORDER BY i.descricao ';

        if (pagina != null && tamPagina != null) {
            query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
        }

        dbDao.selectAll(query, filtro ? [filtro, filtro] : [], (rows, err) => {
            
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
    });
}

exports.consultar = function(id, cb) {
    let query = `
        SELECT i.id, i.descricao, i.qtde_minima, i.ativo, e.qtde, e.preco_medio
        FROM insumo i 
        LEFT JOIN estoque_insumos e ON i.id = e.id_insumo
        WHERE ativo = 1 AND i.id = ?`;
        
    dbDao.selectFirst(query, [id], cb);
}

exports.salvarCompraInsumo = function(compraInsumo, nomeInsumo, cbk) {

    // Verificando existência do estoque
    dbDao.selectFirst('SELECT * FROM estoque_insumos WHERE id_insumo = ?', [compraInsumo.idInsumo], (registro, err) => {
        let statements = [];
        
            if (registro) {
                // Já existe estoque cadastrado para o insumo. Atualizar valores
                let novaQtde = registro.qtde + new Number(compraInsumo.qtde);
                let novoPrecoMedio = ((registro.preco_medio * registro.qtde) + (new Number(compraInsumo.valor) + new Number(compraInsumo.frete))) / novaQtde;
                statements[statements.length] = {
                    query: 'UPDATE estoque_insumos SET qtde = ?, preco_medio = ROUND(?, 2) WHERE id_insumo = ?', 
                    params: [novaQtde, novoPrecoMedio, compraInsumo.idInsumo], 
                    cb: (err) => {
                        if (err) {
                            console.error(`Erro ao atualizar o estoque dos insumos: ${err}`);
                        }
                    }};
            }
            else {
                // Ainda não existe estoque cadastrado para o insumo. Criar novo registro.
                statements[statements.length] = {
                    query: 'INSERT INTO estoque_insumos (id_insumo, qtde, preco_medio) VALUES(?,?,?)', 
                    params: [compraInsumo.idInsumo, compraInsumo.qtde, (compraInsumo.valor + compraInsumo.frete) / new Number(compraInsumo.qtde)], 
                    cb: (err) => {
                        if (err) {
                            console.debug(`Erro ao inserir o estoque dos insumos: ${err}`);
                        }
                    }};
            }

            // Inserindo movimentação de caixa
            let dataMovimentacao = compraInsumo.dataDebito ? compraInsumo.dataDebito : compraInsumo.dataCompra;
            statements[statements.length] = {
                query: 'INSERT INTO movimentacao_caixa (categoria, descricao, debito_credito, data, valor) VALUES(?,?,?,?,?)', 
                params: ['Compra de insumo', `Compra de ${compraInsumo.qtde} ${nomeInsumo}`, 'D', dataMovimentacao, (new Number(compraInsumo.valor) + new Number(compraInsumo.frete))], 
                cb: (err) => {
                    if (err) {
                        console.debug(`Erro ao inserir a movimentação de caixa dos insumos: ${err}`);
                    }
                }};

            // Inserindo compra de insumo
            let valorCompra = compraInsumo.valor ? compraInsumo.valor.valueOf() : null;
            let freteCompra = compraInsumo.frete ? compraInsumo.frete.valueOf() : null
            statements[statements.length] = {
                query: 'INSERT INTO compra_insumo (id_movimentacao, id_insumo, id_fornecedor, qtde, data_compra, data_entrega, data_debito, valor, frete, qtde_parcelas) VALUES((SELECT MAX(id) FROM movimentacao_caixa),?,?,?,?,?,?,?,?,?)', 
                params: [compraInsumo.idInsumo, compraInsumo.idFornecedor, compraInsumo.qtde, compraInsumo.dataCompra, compraInsumo.dataEntrega, compraInsumo.dataDebito, valorCompra, freteCompra, compraInsumo.qtdeParcelas], 
                cb: (err) => {
                    if (err) {
                        console.debug(`Erro ao inserir a compra dos insumos: ${err}`);
                    }
                }};

        dbDao.executeInTransaction(statements, cbk);
    });
}