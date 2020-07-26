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
    let query = 'SELECT COUNT(*) AS total FROM movimentacao_caixa WHERE ativo = 1 ';

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

    dbDao.selectFirst(query, filtro ? [filtro, filtro, filtro, filtro == 'credito' ? 'C' : (filtro == 'debito' ? 'D' : '-'), filtro] : [], (row, err) => {
        
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
        query += 'ORDER BY (SUBSTR(data,7)||SUBSTR(data,4,2)||SUBSTR(data,1,2)) DESC '

        if (pagina != null && tamPagina != null) {
            query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
        }

        dbDao.selectAll(query, filtro ? [filtro, filtro, filtro, filtro == 'credito' ? 'C' : (filtro == 'debito' ? 'D' : '-'), filtro] : [], (rows, err) => {
            
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

exports.carregarCategorias = function (cb) {
    dbDao.selectAll('SELECT DISTINCT categoria FROM movimentacao_caixa WHERE ativo = 1', [], (rows) => {
        let categorias = [];
        rows.forEach(row => categorias[categorias.length] = row.categoria);
        cb(categorias);
    });
}