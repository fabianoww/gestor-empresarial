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
    let query = 'SELECT * FROM insumo WHERE ativo = 1 ';

    // Assegurando que string vazia não filtrará resultados
    filtro = filtro && filtro.trim() != '' ? filtro : null;
    
    if (filtro) {
        console.log(`Aplicando filtro nos insumos: ${filtro}`) ;
        query += `
            AND (
                id = ?
                OR descricao LIKE '%' || ? || '%'
            ) `;
    }

    if (pagina != null && tamPagina != null) {
        query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
    }
    
    dbDao.selectEach(query, filtro ? [filtro, filtro] : [], cb);
}