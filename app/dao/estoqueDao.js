const dbDao = require('./dbDao');
const uiUtils = require('../utils/uiUtils');

exports.salvar = function(estoque, cb) {
    let statements = [];

    statements[statements.length] = {
        query: 'INSERT INTO estoque_produtos(descricao, valor, local, tamanho, imagem) VALUES(?,?,?,?,?)', 
        params: [estoque.descricao, estoque.valor.valueOf(), estoque.local, estoque.tamanho, estoque.imagem], 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao inserir o produto no estoque: ${err}`);
            }
        }};
    
    let queryInsumoProduto = 'INSERT INTO insumo_produto(qtde, id_estoque_produto, id_estoque_insumo) VALUES ';
    let paramsInsumoProduto = [];
    for (let i = 0; i < estoque.insumos.length; i++) {
        const insumo = estoque.insumos[i];

        // Gerando INSERTS para o insumo_produto
        if (i > 0) {
            queryInsumoProduto += ','
        }

        queryInsumoProduto += '(?,(SELECT id FROM estoque_produtos ORDER BY id DESC LIMIT 1),(SELECT id FROM estoque_insumos WHERE id_insumo = ? LIMIT 1))';
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
                console.debug(`Erro ao inserir os insumos utilizados pelo produto: ${err}`);
            }
        }};
    
    dbDao.executeInTransaction(statements, cb);
}

exports.atualizar = function(estoque, cb) {
    let statements = [];

    statements[statements.length] = {
        query: 'UPDATE estoque_produtos SET descricao = ?, valor = ?, local = ?, tamanho = ?, imagem = ? WHERE id = ?', 
        params: [estoque.descricao, estoque.valor.valueOf(), estoque.local, estoque.tamanho, estoque.imagem, estoque.id], 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao atualizar o produto no estoque: ${err}`);
            }
        }};


    dbDao.selectAll('SELECT id_estoque_insumo, qtde FROM insumo_produto WHERE id_estoque_produto = ?', [estoque.id], (registros, err) => {
    
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
            query: 'DELETE FROM insumo_produto WHERE id_estoque_produto = ?', 
            params: [estoque.id], 
            cb: (err) => {
                if (err) {
                    console.debug(`Erro ao deletar os insumos relacionados ao item de estoque: ${err}`);
                }
            }}; 

        let queryInsumoProduto = 'INSERT INTO insumo_produto(qtde, id_estoque_produto, id_estoque_insumo) VALUES ';
        let paramsInsumoProduto = [];
        for (let i = 0; i < estoque.insumos.length; i++) {
            const insumo = estoque.insumos[i];

            // Gerando INSERTS para o insumo_produto
            if (i > 0) {
                queryInsumoProduto += ','
            }

            queryInsumoProduto += '(?,?,(SELECT id FROM estoque_insumos WHERE id_insumo = ? LIMIT 1))';
            paramsInsumoProduto[paramsInsumoProduto.length] = insumo.qtdeInsumo;
            paramsInsumoProduto[paramsInsumoProduto.length] = estoque.id;
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
                    console.debug(`Erro ao inserir os insumos utilizados pelo produto: ${err}`);
                }
            }};

        dbDao.executeInTransaction(statements, cb);
    });
}

exports.remover = function(id, cb) {
    dbDao.execute('UPDATE estoque_produtos SET ativo = 0 WHERE id = ?', [id], cb);
}

exports.carregarEstoque = function(filtro, pagina, tamPagina, cb) {
    let query = 'SELECT COUNT(*) AS total FROM estoque_produtos WHERE ativo = 1 ';

    // Assegurando que string vazia não filtrará resultados
    filtro = filtro && filtro.trim() != '' ? filtro : null;
    
    if (filtro) {
        query += `
            AND (
                id = ?
                OR descricao LIKE '%' || ? || '%'
                OR valor LIKE '%' || ? || '%'
                OR local LIKE '%' || ? || '%'
                OR tamanho LIKE '%' || ? || '%'
            ) `;
    }

    dbDao.selectFirst(query, filtro ? [filtro, filtro, filtro, filtro] : [], (row, err) => {
        
        if (err) {
            cb(null, err);
            return;
        } 
        
        let total = row.total;
        if (total == 0) {
            cb({total: 0, registros: []}, null);
            return;
        }
        
        query = query.replace('COUNT(*) AS total', 'id, descricao, valor, local, tamanho, imagem IS NOT NULL as tem_imagem');


        if (pagina != null && tamPagina != null) {
            query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
        }

        dbDao.selectAll(query, filtro ? [filtro, filtro, filtro, filtro] : [], (rows, err) => {
            
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

exports.carregarImagem = function(id, cb) {
    let query = 'SELECT imagem FROM estoque_produtos WHERE id = ?';
    dbDao.selectFirst(query, [id], cb);
}

exports.carregarInsumos = function(idEstoque, cb) {
    dbDao.selectEach(`
        SELECT i.id, i.descricao, ip.qtde, (ei.preco_medio * ip.qtde) as custo FROM insumo_produto ip 
        JOIN estoque_insumos ei ON ip.id_estoque_insumo = ei.id
        JOIN insumo i ON i.id = ei.id_insumo
        WHERE id_estoque_produto = ?`, [idEstoque], cb);
}

exports.venderItem = function(id, cb) {
    let statements = [];

    // Registrando o recebimento pela venda
    statements[statements.length] = {
        query: `INSERT INTO movimentacao_caixa (descricao, categoria, debito_credito, data, valor) 
            SELECT 'Venda de ' || descricao, 'Recebimento', 'C', '${uiUtils.converterData(new Date())}', valor FROM estoque_produtos WHERE id = ?`,
        params: [id], 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao registrar o recebimento da venda: ${err}`);
            }
        }};

    // Inativando o item de estoque
    statements[statements.length] = {
        query: 'UPDATE estoque_produtos SET ativo = 0 WHERE id = ?',
        params: [id], 
        cb: (err) => {
            if (err) {
                console.debug(`Erro ao inativar o item de estoque: ${err}`);
            }
        }};
    
    dbDao.executeInTransaction(statements, cb);
}