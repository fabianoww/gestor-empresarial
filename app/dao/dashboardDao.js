const dbDao = require('./dbDao');

exports.carregarSaldoAtual = function(cb) {
    let query = `SELECT valor
        + (SELECT SUM(valor) FROM movimentacao_caixa mc WHERE (SUBSTR(data,7)||SUBSTR(data,4,2)||SUBSTR(data,1,2)) <= (SUBSTR(CURRENT_DATE,1,4)||SUBSTR(CURRENT_DATE,6,2)||SUBSTR(CURRENT_DATE,9))  AND debito_credito = 'C' AND ativo = 1)
        - (SELECT SUM(valor) FROM movimentacao_caixa mc WHERE (SUBSTR(data,7)||SUBSTR(data,4,2)||SUBSTR(data,1,2)) <= (SUBSTR(CURRENT_DATE,1,4)||SUBSTR(CURRENT_DATE,6,2)||SUBSTR(CURRENT_DATE,9))  AND debito_credito = 'D' AND ativo = 1)
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
        AND ativo = 1
        ORDER BY SUBSTR(data,7)||SUBSTR(data,4,2)||SUBSTR(data,1,2) ASC LIMIT 3`;
    
    dbDao.selectEach(query, [], cb);
}

exports.carregarProximasEncomendas = function(cb) {
    let query = `SELECT descricao, nome_cliente, data_entrega, status 
        FROM encomenda e 
        WHERE status <> 'ENTREGUE'
        AND ativo = 1
        ORDER BY SUBSTR(data_entrega,7)||SUBSTR(data_entrega,4,2)||SUBSTR(data_entrega,1,2) ASC LIMIT 3`;
    
    dbDao.selectEach(query, [], cb);
}

exports.carregarAlertasEstoque = function(cb) {
    let query = `SELECT i.descricao, ei.qtde AS estoque, i.qtde_minima, i.qtde_minima - ei.qtde AS deficit
        FROM estoque_insumos ei 
        JOIN insumo i ON ei.id_insumo = i.id AND i.ativo = 1
        WHERE ei.qtde <= i.qtde_minima 
        ORDER BY i.qtde_minima - ei.qtde DESC
        LIMIT 3`;
    
    dbDao.selectEach(query, [], cb);
}

exports.carregarHistoricoBalancos = function(cb) {
    let query = `SELECT SUM(valor) as valor, debito_credito as tipo, (SUBSTR(data,7)||SUBSTR(data,4,2)) AS periodo
        FROM movimentacao_caixa mc 
        WHERE mc.data IS NOT NULL
        AND mc.data <> ''
        AND ativo = 1
        GROUP BY debito_credito, (SUBSTR(data,7)||SUBSTR(data,4,2))
        ORDER BY 3`;

    dbDao.selectAll(query, [], cb);
}