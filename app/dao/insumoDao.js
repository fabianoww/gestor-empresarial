const dbDao = require('./dbDao');

exports.salvar = function(insumo, cb) {
    dbDao.execute('INSERT INTO insumo(descricao) VALUES(?)', [insumo.desc], cb);
}

exports.atualizar = function(insumo, cb) {
    console.log(insumo);
    dbDao.execute('UPDATE insumo SET descricao = ? WHERE id = ?', [insumo.desc, insumo.id], cb);
}

exports.remover = function(id, cb) {
    dbDao.execute('UPDATE insumo SET ativo = 0 WHERE id = ?', [id], cb);
}

exports.carregarInsumos = function(filtroDesc, pagina, tamPagina, cb) {
    let query = 'SELECT * FROM insumo WHERE ativo = 1 ';
    
    if (filtroDesc && filtroDesc.trim() != '') {
        console.log(`aplicando filtro nos insumos: ${filtroDesc}`) ;
        query += 'AND descricao ILIKE \'%?%\' ';
    }

    if (pagina != null && tamPagina != null) {
        query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
    }

    dbDao.selectEach(query, filtroDesc ? [filtroDesc] : [], cb);
}