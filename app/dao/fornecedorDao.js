const Fornecedor = require('../model/fornecedor');
const dbDao = require('./dbDao');

exports.salvar = function(fornecedor, cb) {
    dbDao.execute('INSERT INTO fornecedor(nome, tipo, online, telefone_fixo, telefone_celular, site, email, observacao) VALUES(?,?,?,?,?,?, ?,?)', 
        [fornecedor.nome, fornecedor.tipo, fornecedor.online, fornecedor.telefoneFixo, fornecedor.telefoneCelular, fornecedor.site, fornecedor.email, fornecedor.observacao], cb);
}

exports.atualizar = function(fornecedor, cb) {
    dbDao.execute('UPDATE fornecedor SET nome = ?, tipo = ?, online = ?, telefone_fixo = ?, telefone_celular = ?, site = ?, email = ?, observacao = ? WHERE id = ?', 
        [fornecedor.nome, fornecedor.tipo, fornecedor.online, fornecedor.telefoneFixo, fornecedor.telefoneCelular, fornecedor.site, fornecedor.email, fornecedor.observacao, fornecedor.id], cb);
}

exports.remover = function(id, cb) {
    dbDao.execute('UPDATE fornecedor SET ativo = 0 WHERE id = ?', [id], cb);
}

exports.carregarFornecedores = function(filtro, pagina, tamPagina, cb) {
    let query = 'SELECT COUNT(*) AS total FROM fornecedor WHERE ativo = 1 ';

    // Assegurando que string vazia não filtrará resultados
    filtro = filtro && filtro.trim() != '' ? filtro : null;
    
    if (filtro) {
        query += `
            AND (
                id = ?
                OR nome LIKE '%' || ? || '%'
                OR tipo LIKE '%' || ? || '%'
                OR telefone_fixo LIKE '%' || ? || '%'
                OR telefone_celular LIKE '%' || ? || '%'
                OR site LIKE '%' || ? || '%'
                OR email LIKE '%' || ? || '%'
                OR observacao LIKE '%' || ? || '%'
                OR online = ?
            ) `;
    }

    dbDao.selectFirst(query, filtro ? [filtro, filtro, filtro, filtro, filtro, filtro, filtro, filtro, filtro == 'online' ? 1 : (filtro == 'loja fisica' ? 0 : -1)] : [], (row, err) => {
        
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

        if (pagina != null && tamPagina != null) {
            query += `LIMIT ${tamPagina} OFFSET ${pagina * tamPagina}`;
        }

        dbDao.selectAll(query, filtro ? [filtro, filtro, filtro, filtro, filtro, filtro, filtro == 'online' ? 1 : (filtro == 'loja fisica' ? 0 : -1)] : [], (rows, err) => {
            
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

exports.consultar = function(id, cb) {
    dbDao.selectFirst('SELECT * FROM fornecedor WHERE id = ?', [id], (registro, err) => {
        cb(new Fornecedor(registro.id, registro.nome, registro.tipo, registro.online, registro.telefone_fixo, registro.telefone_celular, 
            registro.email, registro.site, registro.observacao));
    });
}