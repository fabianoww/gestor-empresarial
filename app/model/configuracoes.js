class Configuracoes {
    VALOR_INICIAL_KEY = 'VALOR_INICIAL';

    constructor(valorInicial) {
        this.valorInicial = valorInicial;
    }

    toArray() {
        return [
            {chave: this.VALOR_INICIAL_KEY, valor: this.valorInicial}
        ];
    }

    setConfigItem(item) {
        if (item.chave == this.VALOR_INICIAL_KEY) {
            this.valorInicial = item.valor;
        }
    }
}

module.exports = Configuracoes;