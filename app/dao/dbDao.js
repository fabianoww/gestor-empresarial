const sqlite3 = require('sqlite3');

var db;

exports.initDB = function() {
    startDB();
    db.serialize(function() {
        db.all("SELECT name  FROM sqlite_master WHERE type='table'", criarTabelas);
    });
}

exports.selectEach = function(query, params, cb) {
    startDB();
    db.each(query, params, (err, row) => {
        if (err) {
            console.error(err.message);
            cb(null, err.message);
            return;
        }
        cb(row, null);
      });
      
    closeDB();
}

exports.selectFirst = function(query, params, cb) {
    startDB();
    db.get(query, params, (err, row) => {
        if (err) {
            console.error(err.message);
            cb(null, err.message);
            return;
        }
        cb(row, null);
      });
      
    closeDB();
}

exports.execute = function(query, params, cb) {
    startDB();
    db.run(query, params, function(err) {
        if (err) {
            console.error(err.message);
            cb(null, err.message);
            return;
        }
        
        cb(this.lastID, null);
    });
    
    closeDB();
}

function startDB() {
    db = new sqlite3.Database('./data/database.db');
    console.debug('DB aberto.');
}

function closeDB() {
    db.close();
    console.debug('DB fechado.');
}

function criarTabelas(err, rows) {
    let tabelasExistentes = [];
    rows.forEach((row) => {
        tabelasExistentes[tabelasExistentes.length] = row.name;
    });
    console.debug('Tabelas existentes: ' + tabelasExistentes);

    let nomeTabela;

    // Verificando tabela 'config'
    nomeTabela = 'config';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        db.run(`
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
        db.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                nome VARCHAR(200), 
                tipo VARCHAR(50), 
                online BOOLEAN, 
                telefone VARCHAR(20), 
                site VARCHAR(200), 
                email VARCHAR(100),
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
        db.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                descricao VARCHAR(200),
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
        db.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                categoria VARCHAR(50), 
                descricao VARCHAR(200), 
                debito_credito VARCHAR(1), 
                data TEXT)`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'compra_insumo'
    nomeTabela = 'compra_insumo';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        db.run(`
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
        db.run(`
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
        db.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                descricao VARCHAR(200),
                valor REAL,
                local VARCHAR(200),
                tamanho VARCHAR(50),
                imagem BLOB)`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'encomenda'
    nomeTabela = 'encomenda';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        db.run(`
            CREATE TABLE ${nomeTabela} (
                id INTEGER NOT NULL PRIMARY KEY, 
                nome_cliente VARCHAR(200),
                telefone_cliente VARCHAR(20),
                email_cliente VARCHAR(100),
                descricao VARCHAR(200),
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
                valor_venda REAL,
                forma_pgto VARCHAR(50),
                data_pgto TEXT,
                id_movimentacao_caixa INTEGER,
                FOREIGN KEY (id_movimentacao_caixa) REFERENCES movimentacao_caixa (id))`);
        console.debug(`Tabela "${nomeTabela}" criada com sucesso!`);
    }

    // Verificando tabela 'insumo_produto'
    nomeTabela = 'insumo_produto';
    if (tabelasExistentes.includes(nomeTabela)) {
        console.debug(`Tabela ${nomeTabela} ja existe!`);
    } 
    else {
        console.debug(`Criando tabela "${nomeTabela}"...`);
        db.run(`
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
    
    closeDB();
}
