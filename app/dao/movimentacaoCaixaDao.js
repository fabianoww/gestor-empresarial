const dbDao = require('./dbDao');

exports.salvar = function(movimentacaoCaixa, cb) {
    dbDao.execute('INSERT INTO movimentacao_caixa (descricao, categoria, debito_credito, data, valor) VALUES(?,?,?,?,?)', 
        [movimentacaoCaixa.descricao, movimentacaoCaixa.categoria, movimentacaoCaixa.tipo, movimentacaoCaixa.data, movimentacaoCaixa.valor.valueOf()], cb);
}

exports.atualizar = function(movimentacaoCaixa, cb) {
    dbDao.execute('UPDATE movimentacao_caixa SET descricao = ?, categoria = ?, debito_credito = ?, data = ?, valor = ? WHERE id = ?', 
        [movimentacaoCaixa.descricao, movimentacaoCaixa.categoria, movimentacaoCaixa.tipo, movimentacaoCaixa.data, movimentacaoCaixa.valor.valueOf(), movimentacaoCaixa.id], cb);
}

exports.remover = function(id, cb) {
    dbDao.execute('UPDATE movimentacao_caixa SET ativo = 0 WHERE id = ?', [id], cb);
}

exports.carregarMovimentacoes = function(filtro, pagina, tamPagina, cb) {
    let query = 'SELECT * FROM movimentacao_caixa WHERE ativo = 1 ';

    // Assegurando que string vazia não filtrará resultados
    filtro = filtro && filtro.trim() != '' ? filtro : null;
    
    if (filtro) {
        query += `
            AND (
                id = ?
                OR descricao LIKE '%' || ? || '%'
                OR categoria LIKE '%' || ? || '%'
                OR debito_credito LIKE '%' || ? || '%'
                OR data LIKE '%' || ? || '%'
            ) `;
    }

    if (pagina != null && tamPagina != null) {
        query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
    }
    
    dbDao.selectEach(query, filtro ? [filtro, filtro, filtro, filtro == 'credito' ? 'C' : (filtro == 'debito' ? 'D' : '-'), filtro] : [], cb);
}

exports.carregarCategorias = function (cb) {
    dbDao.selectAll('SELECT DISTINCT categoria FROM movimentacao_caixa WHERE ativo = 1', [], (rows) => {
        let categorias = [];
        rows.forEach(row => categorias[categorias.length] = row.categoria);
        cb(categorias);
    });
}