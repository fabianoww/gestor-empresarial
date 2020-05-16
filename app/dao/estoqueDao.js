const dbDao = require('./dbDao');

exports.salvar = function(estoque, cb) {
    dbDao.execute('INSERT INTO estoque_produtos(descricao, valor, local, tamanho, imagem) VALUES(?,?,?,?,?)', 
        [estoque.descricao, estoque.valor.valueOf(), estoque.local, estoque.tamanho, estoque.imagem], cb);
}

exports.atualizar = function(estoque, cb) {
    dbDao.execute('UPDATE estoque_produtos SET descricao = ?, valor = ?, local = ?, tamanho = ?, imagem = ? WHERE id = ?', 
        [estoque.descricao, estoque.valor.valueOf(), estoque.local, estoque.tamanho, estoque.imagem, estoque.id], cb);
}

exports.remover = function(id, cb) {
    dbDao.execute('UPDATE estoque_produtos SET ativo = 0 WHERE id = ?', [id], cb);
}

exports.carregarEstoque = function(filtro, pagina, tamPagina, cb) {
    let query = 'SELECT id, descricao, valor, local, tamanho, imagem IS NOT NULL as tem_imagem FROM estoque_produtos WHERE ativo = 1 ';

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

    if (pagina != null && tamPagina != null) {
        query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
    }
    
    dbDao.selectEach(query, filtro ? [filtro, filtro, filtro, filtro] : [], cb);
}

exports.carregarImagem = function(id, cb) {
    let query = 'SELECT imagem FROM estoque_produtos WHERE id = ?';
    dbDao.selectFirst(query, [id], cb);
}