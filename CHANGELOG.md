
# Change Log
Todas as mudanças relevantes neste projeto estão documentadas neste arquivo.
 
O formato adotado neste arquivo é baseado no [Mantenha um Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e esse projeto é aderente ao [Versionamento Semântico](http://semver.org/).
 
## [v1.1.0](https://github.com/fabianoww/gestor-empresarial/releases/tag/v1.1.0) - 2020-09-05
 
### Adicionado
- [#8](https://github.com/fabianoww/gestor-empresarial/issues/8)
  Encomendas - Adicionado campo para definição da data prevista para entrega da encomenda.

- [#9](https://github.com/fabianoww/gestor-empresarial/issues/9)
  Encomendas - Na listagem de encomendas, foi adicionado um destaque em verde nos itens que já foram entregues.

- [#14](https://github.com/fabianoww/gestor-empresarial/issues/14)
  Estoque - Adicionada funcionalidade para vender um item de estoque (ícone carrinho de compras). Ao vender o item, será gerado um recebimento no valor atual do produto.
   
### Modificado  
- [#8](https://github.com/fabianoww/gestor-empresarial/issues/8)
  Encomendas - Campo "data da entrega" movido para o grupo "pagamento", ao final do formulário. Além disso, este campo somente será exibido ao selecionar a opção "entregue" no campo "status da encomenda".

- [#10](https://github.com/fabianoww/gestor-empresarial/issues/10)
  Encomendas - Foram alterados os critérios para ordenação da listagem de encomendas de modo a considerar a seguintes regras:
    1. Não entregues primeiro, já entregues depois
    2. Data da encomenda, em ordem decrescente (da mais recente para a mais antiga)
    
- [#11](https://github.com/fabianoww/gestor-empresarial/issues/11)
  A tela de "Fluxo de Caixa" foi dividida em duas telas: "Pagamentos" e "Recebimentos".

- [#13](https://github.com/fabianoww/gestor-empresarial/issues/13)
  Fluxo de caixa - No formulário para inclusão/alteração de um fluxo de caixa, foram ocultados os campos para seleção de Receita/Despesa. Essa informação será inferida com base na categoria escolhida.

 
### Corrigido
- [#12](https://github.com/fabianoww/gestor-empresarial/issues/12)
  Fluxo de caixa - Corrigido erro que registrava, na inclusão/alteração de um fluxo de caixa, a categoria "Investimento" ao selecionar a opção "Recebimento".