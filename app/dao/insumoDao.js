const dbDao = require('./dbDao');

exports.salvar = function(insumo, cb) {
    dbDao.executeInsert('INSERT INTO insumo(descricao) VALUES(?)', [insumo.desc], cb);
}

exports.carregarInsumos = function(filtroDesc, pagina, tamPagina, cb) {
    let query = 'SELECT * FROM insumo WHERE 1=1 ';
    
    if (filtroDesc && filtroDesc.trim() != '') {
        console.log(`aplicando filtro nos insumos: ${filtroDesc}`) ;
        query += 'AND descricao ILIKE \'%?%\' ';
    }

    if (pagina != null && tamPagina != null) {
        query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
    }

    dbDao.executeSelectEach(query, filtroDesc ? [filtroDesc] : [], cb);
}