const dbDao = require('./dbDao');
const Configuracoes = require('../model/configuracoes');

exports.salvar = function(config, cb) {
    salvarItem(config.toArray(), 0, [], [], cb);
}

function salvarItem(itens, index, sucessos, falhas, cb) {

    if (itens.length == index) {
        cb(sucessos, falhas);
        return;
    }

    let configItem = itens[index];
    dbDao.execute('UPDATE config SET valor = ? WHERE chave = ?', [configItem.valor, configItem.chave], (changes, err) => {
        if (err) {
            console.error(`Falha ao atualizar o item de configuração ${configItem.chave}: ${err}`);
            falhas[falhas.length] = configItem.chave;
            salvarItem(itens, index+1, sucessos, falhas, cb);
            return;
        }

        if (changes) {
            console.debug(`Item de configuração ${configItem.chave} atualizado para o valor ${configItem.valor}`);
            sucessos[sucessos.length] = configItem.chave;
            salvarItem(itens, index+1, sucessos, falhas, cb);
        } else {
            dbDao.execute('INSERT INTO config(chave, valor) VALUES(?,?)', [configItem.chave, configItem.valor], (id, err) => {
                if (err) {
                    console.error(`Falha ao inserir o item de configuração ${configItem.chave}: ${err}`);
                    falhas[falhas.length] = configItem.chave;
                    return;
                } else {
                    console.debug(`Item de configuração ${configItem.chave} inserido com o valor ${configItem.valor}`);
                    sucessos[sucessos.length] = configItem.chave;
                }

                salvarItem(itens, index+1, sucessos, falhas, cb);
            });
        }
    });
}

exports.carregarConfiguracoes = function(cb) {
    let query = 'SELECT * FROM config';
    
    dbDao.selectAll(query, [], (rows) => {
        let config = new Configuracoes(null);
        rows.forEach(row => {
            config.setConfigItem(row);
        });
        
        cb(config);
    });
}