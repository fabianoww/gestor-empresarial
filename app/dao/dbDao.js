const sqlite3 = require('sqlite3');
const fs = require('fs');

var initDb;

exports.initDB = function() {
    startDB((db, err) => {
        initDb = db;
        db.serialize(function() {
            db.all("SELECT name FROM sqlite_master WHERE type='table'", aplicarMigracoes);
        });
    });
}

function startDB(cb) {
    let dbPath = `${require('os').homedir()}/AppData/Local/Gestor-Empresarial`;
    checkDirectory(dbPath, function(error) {  
        if(error) {
          cb(null, error)
        } else {
            cb(new sqlite3.Database(`${dbPath}/database.db`));
            console.debug('DB aberto.');
        }
      });
}

function checkDirectory(directory, cb) {  
    fs.stat(directory, function(err, stats) {
      if (err) {
        fs.mkdir(directory, cb);
      } else {
        cb();
      }
    });
  }

function closeDB(db) {
    db.close();
    console.debug('DB fechado.');
}

exports.selectAll = function(query, params, cb) {
    startDB((db, err) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                cb(null, err.message);
                return;
            }
            cb(rows, null);
          });
          
        closeDB(db);        
    });
}

exports.selectEach = function(query, params, cb) {
    startDB((db, err) => {
        db.each(query, params, (err, row) => {
            if (err) {
                console.error(err.message);
                cb(null, err.message);
                return;
            }
            cb(row, null);
          });
          
        closeDB(db);
    });
}

exports.selectFirst = function(query, params, cb) {
    startDB((db, err) => {
        db.get(query, params, (err, row) => {
            if (err) {
                console.error(err.message);
                cb(null, err.message);
                return;
            }
            cb(row, null);
        });
        
        closeDB(db);
    });
}

exports.execute = function(query, params, cb) {
    startDB((db, err) => {
        db.run(query, params, function(err) {
            if (err) {
                console.error(err.message);
                cb(null, err.message);
                return;
            }
            
            cb(this.sql.includes('update') || this.sql.includes('UPDATE') ? this.changes : this.lastID, null);
        });
        
        closeDB(db);
    });
}

exports.executeInTransaction = function(statements, cb) {

    if (!statements || statements.length <= 0) {
        return;
    }

    startDB((db, err) => {
        db.run('BEGIN TRANSACTION', [], function(err) {
            if (err) {
                console.error(err.message);
                return;
            }
            
            executeTxStatements(db, statements, 0, cb);
        });
        closeDB(db);
    });
}

function executeTxStatements(db, statements, index, cb) {
    if (index == statements.length) {
        db.run('COMMIT', [], function(err) {
            if (err) {
                console.error(err.message);
                return;
            }

            // Acionando callback do disparo da transação
            cb(err);
        });
        return;
    }

    db.run(statements[index].query, statements[index].params, (err) => {
        
        if (err) {
            db.run('ROLLBACK', [], function(err) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                console.debug('Rollback feito');
            });
            statements[index].cb(err);

            // Acionando callback do disparo da transação
            cb(err);
            return;
        }

        statements[index].cb();
        executeTxStatements(db, statements, ++index, cb);
    });
}

function aplicarMigracoes(err, rows) {
    let tabelasExistentes = [];
    rows.forEach((row) => {
        tabelasExistentes[tabelasExistentes.length] = row.name;
    });
    console.debug('Tabelas existentes: ' + tabelasExistentes);

    if (tabelasExistentes.length == 0) {
        // Primeira instação. Criar base da versão 1.0
        aplicarV1x0x0(tabelasExistentes);
    }

    // Obtendo a versão instalada
    initDb.get('SELECT valor FROM config c WHERE chave = "versaoInstalada"', [], (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }

        let versaoInstalada = row == undefined ? undefined : row.valor;
        console.log(`Versão instalada: ${versaoInstalada}`);

        if (versaoInstalada == undefined) {
            aplicarV1x1x0();
        }
    });
}

function aplicarV1x0x0(tabelasExistentes){
    console.log('Aplicando versão 1.0.0 da base de dados');
    let nomeTabela;

    // Verificando tabela 'config'
    nomeTabela = 'config';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        initDb.run(`
            CREATE TABLE ${nomeTabela} (
                chave VARCHAR(50) NOT NULL PRIMARY KEY, 
                valor TEXT)`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'fornecedor'
    nomeTabela = 'fornecedor';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        initDb.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                nome VARCHAR(200), 
                tipo VARCHAR(50), 
                online BOOLEAN, 
                telefone_fixo VARCHAR(20), 
                telefone_celular VARCHAR(20), 
                site VARCHAR(200), 
                email VARCHAR(100),
                observacao VARCHAR(200),
                ativo INTEGER NOT NULL DEFAULT 1)`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'insumo'
    nomeTabela = 'insumo';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        initDb.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                descricao VARCHAR(200),
                qtde_minima INTEGER,
                ativo INTEGER NOT NULL DEFAULT 1)`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'movimentacao_caixa'
    nomeTabela = 'movimentacao_caixa';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        initDb.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                categoria VARCHAR(50), 
                descricao VARCHAR(200), 
                debito_credito VARCHAR(1), 
                data TEXT,
                valor REAL,
                ativo INTEGER NOT NULL DEFAULT 1)`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'compra_insumo'
    nomeTabela = 'compra_insumo';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        initDb.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                id_movimentacao INTEGER, 
                id_insumo INTEGER,
                id_fornecedor INTEGER,
                qtde INTEGER,
                data_compra TEXT,
                data_entrega TEXT,
                data_debito TEXT,
                valor REAL,
                frete REAL,
                qtde_parcelas INTEGER, 
                FOREIGN KEY (id_movimentacao) REFERENCES movimentacao_caixa (id), 
                FOREIGN KEY (id_insumo) REFERENCES insumo (id), 
                FOREIGN KEY (id_fornecedor) REFERENCES fornecedor (id))`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'estoque_insumos'
    nomeTabela = 'estoque_insumos';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        initDb.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                id_insumo INTEGER,
                qtde INTEGER,
                formula_conversao VARCHAR(50),
                preco_medio REAL,
                FOREIGN KEY (id_insumo) REFERENCES insumo (id))`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'estoque_produtos'
    nomeTabela = 'estoque_produtos';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        initDb.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                descricao VARCHAR(200),
                valor REAL,
                local VARCHAR(200),
                tamanho VARCHAR(50),
                imagem BLOB,
                ativo INTEGER NOT NULL DEFAULT 1)`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'encomenda'
    nomeTabela = 'encomenda';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        initDb.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                nome_cliente VARCHAR(200),
                telefone_cliente VARCHAR(20),
                email_cliente VARCHAR(100),
                logradouro_endereco_cliente VARCHAR(100),
                cep_endereco_cliente VARCHAR(9),
                numero_endereco_cliente VARCHAR(10),
                bairro_endereco_cliente VARCHAR(100),
                complemento_endereco_cliente VARCHAR(200),
                cidade_endereco_cliente VARCHAR(100),
                estado_endereco_cliente VARCHAR(2),
                descricao VARCHAR(200),
                tipo_produto VARCHAR(50),
                qtde INTEGER,
                cores VARCHAR(200),
                observacoes TEXT,
                data_encomenda TEXT,
                data_entrega TEXT,
                prazo_envio INTEGER,
                data_envio TEXT,
                horas_producao INTEGER,
                status VARCHAR(50),
                codigo_rastreamento VARCHAR(50),
                valor_entrada_venda REAL,
                valor_entrega_venda REAL,
                forma_pgto VARCHAR(50),
                data_entrada TEXT,
                data_pgto TEXT,
                id_movimentacao_caixa_entrada INTEGER,
                id_movimentacao_caixa_princ INTEGER,
                ativo INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (id_movimentacao_caixa_entrada) REFERENCES movimentacao_caixa (id),
                FOREIGN KEY (id_movimentacao_caixa_princ) REFERENCES movimentacao_caixa (id))`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'insumo_produto'
    nomeTabela = 'insumo_produto';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        initDb.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                id_encomenda INTEGER, 
                id_estoque_produto INTEGER,
                id_estoque_insumo INTEGER,
                qtde INTEGER,
                FOREIGN KEY (id_encomenda) REFERENCES encomenda (id), 
                FOREIGN KEY (id_estoque_produto) REFERENCES estoque_produtos (id), 
                FOREIGN KEY (id_estoque_insumo) REFERENCES estoque_insumos (id))`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }
    
    closeDB(initDb);
}

function aplicarV1x1x0(tabelasExistentes){
    console.log('Aplicando versão 1.1.0 da base de dados');
    
    // Definindo versão do sistema na tabela de configurações
    initDb.run('INSERT INTO config (chave, valor) values ("versaoInstalada", "1.1.0")');
    
    // Criando coluna de data prevista da encomenda
    initDb.run('ALTER TABLE encomenda ADD data_prevista TEXT');

    
}
