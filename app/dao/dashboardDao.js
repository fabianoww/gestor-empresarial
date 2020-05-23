const dbDao = require('./dbDao');

exports.carregarSaldoAtual = function(cb) {
    let query = `SELECT valor
        + (SELECT SUM(valor) FROM movimentacao_caixa mc WHERE (SUBSTR(data,7)||SUBSTR(data,4,2)||SUBSTR(data,1,2)) <= (SUBSTR(CURRENT_DATE,1,4)||SUBSTR(CURRENT_DATE,6,2)||SUBSTR(CURRENT_DATE,9))  AND debito_credito = 'C')
        - (SELECT SUM(valor) FROM movimentacao_caixa mc WHERE (SUBSTR(data,7)||SUBSTR(data,4,2)||SUBSTR(data,1,2)) <= (SUBSTR(CURRENT_DATE,1,4)||SUBSTR(CURRENT_DATE,6,2)||SUBSTR(CURRENT_DATE,9))  AND debito_credito = 'D')
        as saldo
        FROM config 
        WHERE chave = 'VALOR_INICIAL'`;
    
    dbDao.selectFirst(query, [], (row) => {
        cb(new Number(row.saldo).toFixed(2));
    });
}

exports.carregarGastosFuturos = function(cb) {
    let query = `SELECT descricao, data, valor 
        FROM movimentacao_caixa mc 
        WHERE (SUBSTR(data,7)||SUBSTR(data,4,2)||SUBSTR(data,1,2)) > (SUBSTR(CURRENT_DATE,1,4)||SUBSTR(CURRENT_DATE,6,2)||SUBSTR(CURRENT_DATE,9)) 
        AND debito_credito = 'D' 
        ORDER BY SUBSTR(data,7)||SUBSTR(data,4,2)||SUBSTR(data,1,2) ASC LIMIT 3`;
    
    dbDao.selectEach(query, [], cb);
}

exports.carregarProximasEncomendas = function(cb) {
    let query = `SELECT descricao, nome_cliente, data_entrega, status 
        FROM encomenda e 
        WHERE status <> 'ENTREGUE'
        ORDER BY SUBSTR(data_entrega,7)||SUBSTR(data_entrega,4,2)||SUBSTR(data_entrega,1,2) ASC LIMIT 3`;
    
    dbDao.selectEach(query, [], cb);
}

exports.carregarAlertasEstoque = function(cb) {
    let query = `SELECT i.descricao, ei.qtde AS estoque, i.qtde_minima, i.qtde_minima - ei.qtde AS deficit
        FROM estoque_insumos ei 
        JOIN insumo i ON ei.id_insumo = i.id 
        WHERE ei.qtde <= i.qtde_minima 
        ORDER BY i.qtde_minima - ei.qtde DESC`;
    
    dbDao.selectEach(query, [], cb);
}