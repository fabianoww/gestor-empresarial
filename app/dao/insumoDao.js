const dbDao = require('./dbDao');

exports.salvar = function(insumo, cb) {
    dbDao.execute('INSERT INTO insumo(descricao) VALUES(?)', [insumo.desc], cb);
}

exports.atualizar = function(insumo, cb) {
    dbDao.execute('UPDATE insumo SET descricao = ? WHERE id = ?', [insumo.desc, insumo.id], cb);
}

exports.remover = function(id, cb) {
    dbDao.execute('UPDATE insumo SET ativo = 0 WHERE id = ?', [id], cb);
}

exports.carregarInsumos = function(filtro, pagina, tamPagina, cb) {
    
    let query = `
    SELECT i.id, i.descricao, i.ativo, e.qtde, e.preco_medio
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

    if (pagina != null && tamPagina != null) {
        query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
    }

    
    dbDao.selectEach(query, filtro ? [filtro, filtro] : [], cb);
}

exports.salvarCompraInsumo = function(compraInsumo, cb) {
    dbDao.selectFirst('SELECT * FROM estoque_insumos WHERE id_insumo = ?', [compraInsumo.idInsumo], (registro, err) => {
        if (registro) {
            // Já existe estoque cadastrado para o insumo. Atualizar valores
            console.log('atualizar');
        }
        else {
            // Ainda não existe estoque cadastrado para o insumo. Criar novo registro.
            dbDao.execute('INSERT INTO estoque_insumos (id_insumo, qtde, preco_medio) VALUES(?,?,?)', [compraInsumo.idInsumo, compraInsumo.qtde, (compraInsumo.valor + compraInsumo.frete) / new Number(compraInsumo.qtde)], cb);
        }
    });


    //dbDao.execute('INSERT INTO insumo(descricao) VALUES(?)', [insumo.desc], cb);
}