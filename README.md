# Contato da Picanha — estrutura do site

```
index.html                  → HTML principal (site + carrinho + modal de cadastro)
admin.html                  → Painel do administrador (login + edição do catálogo)
robots.txt                  → pede pra buscadores não indexarem admin.html
vercel.json                 → configuração opcional para quando hospedar no Vercel
css/style.css                → visual do site (tema carvão/brasa, cards, carrinho, modal)
css/admin.css                 → visual exclusivo do painel do admin
js/products-data.js         → catálogo ORIGINAL de produtos (ponto de partida)
js/store.js                  → "banco de dados" do site (tudo em localStorage): catálogo
                               já com as edições do admin aplicadas, carrinho, cadastro do
                               cliente e login do admin
js/script.js                   → renderiza os cards a partir do Store, menu mobile,
                               carrinho, cadastro rápido, gráfico de horário de pico
js/admin.js                  → lógica do painel: criar conta, login, editar catálogo, exportar
partials/product-card.html    → cópia de referência do HTML gerado para cada card (só leitura)
images/banner/banner-1.jpg…4  → as 4 fotos do banner do topo (você adiciona)
images/products/<slug>.png    → foto de cada produto (opcional)
images/kits/<kit-slug>.png    → foto de cada kit (opcional)
```

## ⚠️ Leia isto primeiro: como funciona sem servidor

Este site é só HTML/CSS/JS — **não tem servidor nem banco de dados**. Por causa
disso, o painel do admin e o cadastro de clientes funcionam assim:

- **Painel do admin**: tudo que o admin editar (preço, foto, promoção, produtos
  novos) fica salvo *só no navegador onde ele fez a edição*. Para a mudança
  aparecer para **todo mundo** que visita o site, o admin precisa:
  1. Editar o que quiser no painel (`admin.html`);
  2. Clicar em **"Baixar catálogo atualizado"** no fim da página — isso baixa
     um novo `products-data.js` já com tudo atualizado;
  3. Enviar esse arquivo para quem cuida da hospedagem substituir o
     `js/products-data.js` atual do site (e publicar de novo).

  Sem esse passo 3, as edições continuam valendo só no computador/navegador
  onde o admin trabalhou.

- **Cadastro do cliente** (nome + telefone): fica salvo só no navegador da
  própria pessoa, para não precisar digitar de novo na próxima visita e para
  preencher automaticamente a mensagem do WhatsApp. Não existe uma lista
  central de clientes cadastrados guardada em algum lugar — não há onde guardar
  isso sem um servidor.

- **Login do admin**: como é feito só no navegador (sem servidor validando a
  senha), é um controle de acesso simples para afastar curiosos, não uma
  segurança de nível bancário. Isso está avisado também na própria tela de
  criação de conta.

Se no futuro vocês quiserem que as mudanças do admin valham automaticamente
para todo mundo (sem precisar baixar/subir arquivo) e um cadastro de clientes
de verdade, aí sim vai ser preciso um backend com banco de dados.

## Banner do topo (carrossel de 4 fotos)

O topo do site agora é um carrossel horizontal em tela cheia: as 4 fotos
passam automaticamente uma para a outra (a cada ~5,5s), e também dá pra trocar
manualmente pelas setas nas laterais ou pelos pontinhos embaixo. Para colocar
as fotos, salve os arquivos em `images/banner/` com estes nomes exatos:

```
images/banner/banner-1.jpg
images/banner/banner-2.jpg
images/banner/banner-3.jpg
images/banner/banner-4.jpg
```

Se algum arquivo não existir, aquele slide mostra um ícone de brasa 🔥 no
lugar, igual às fotos de produto — o site não quebra. Tem um arquivo
`images/banner/COMO-ADICIONAR-AS-FOTOS.txt` com esse mesmo lembrete. Se
preferir usar `.png` em vez de `.jpg`, é só trocar a extensão no `<img src=...>`
de cada foto dentro do `index.html` (procure por `hero-banner-slide`). Quem
tem a preferência do sistema "reduzir movimento" ativada não vê a troca
automática (só consegue trocar manualmente) — respeita a acessibilidade.

O único botão que ficou no banner é **"Ver o menu"**, que rola a página até a
seção de produtos.

## Produtos esgotados

No painel (`admin.html`), cada produto tem um campo **"Esgotado"** (checkbox).
Quando marcado:

- O card do produto no site fica escurecido, com o selo trocado para
  **"Esgotado"** (some qualquer selo de promoção enquanto durar).
- O botão de adicionar ao carrinho fica desativado — o cliente não consegue
  colocar aquele item no carrinho enquanto ele estiver marcado como esgotado.
- Ao desmarcar o "Esgotado" e salvar, o produto volta ao normal.

Essa marcação é só por produto (não existe para os kits). Como tudo nesta
versão do site vive no navegador (veja a seção sobre como funciona sem
servidor), lembre de clicar em **"Baixar catálogo atualizado"** depois de
marcar/desmarcar um produto como esgotado, pra isso valer pra todo mundo.

## Produtos vendidos por peso (kg) — como funciona o pedido no WhatsApp

Como o preço por quilo só é definido depois de pesar o produto na loja, o
carrinho trata os itens com unidade **"kg"** de um jeito diferente dos itens
de preço fechado (unidade, bandeja, pacote, kits etc.):

- Cada item do pedido é sempre enviado para o WhatsApp com seu **valor
  individual** (preço por kg ou preço fechado, conforme o caso).
- Se o pedido **tiver algum item por peso**: o site NÃO soma um total final —
  ele soma só o subtotal dos itens de preço fechado (se houver algum) e avisa
  que o valor dos itens por peso e o total geral serão calculados pelo
  Garcez depois da pesagem.
- Se o pedido **não tiver nenhum item por peso** (só itens de preço fechado
  e/ou kits): o site soma e envia o total final normalmente, como antes.

Isso é decidido automaticamente por produto, com base no campo "Unidade" que
o admin preenche no painel (`admin.html`): produtos com unidade `kg` entram
na regra de peso; qualquer outra unidade (ou nenhuma) é tratada como preço
fechado.

## Horários de funcionamento

- Segunda: fechado
- Terça a sábado: 9h às 19h
- Domingos e feriados: 10h30 às 13h

O dia da semana atual é destacado sozinho na lista de horários, com base na
data do aparelho de quem está vendo o site — não precisa mexer em nada
manualmente. Se algum horário mudar no futuro, edite os textos direto nas
linhas dentro de `<div class="hours-list" id="hoursList">` no `index.html`
(o destaque automático continua funcionando, já que segue o atributo
`data-day` de cada linha, não o texto).

## Painel do administrador (`admin.html`)

- Na primeira vez que alguém abre `admin.html` em um navegador, aparece a tela
  **"Criar conta de administrador"** (usuário + senha). Depois disso, aparece
  sempre a tela de login nesse navegador.
- Depois de logado, dá para: editar nome/preço/unidade/selo de promoção/imagem/
  esgotado de qualquer produto, remover um produto existente, adicionar
  produtos novos em qualquer categoria, e editar nome/preço/imagem dos 5 kits.
- O botão **"Baixar catálogo atualizado"** gera um novo `products-data.js` já
  com tudo que foi editado — é esse arquivo que precisa substituir o atual no
  servidor para as mudanças valerem para todos os visitantes.
- Existe um link **"Área do administrador"** no rodapé do site que leva até
  o `admin.html`.

## Cadastro do cliente + Carrinho

- Cada produto e cada kit tem um botão de **adicionar ao carrinho**.
- O ícone de carrinho no topo do site mostra a quantidade de itens e abre uma
  gaveta lateral com a lista, onde dá pra ajustar quantidade ou remover itens.
- Ao clicar em **"Finalizar pedido no WhatsApp"**:
  - Se for a primeira vez da pessoa no navegador, aparece um formulário rápido
    pedindo só **nome e telefone**;
  - Depois disso, abre o WhatsApp já com uma mensagem pronta, listando cada
    item com seu valor individual — e o total final, exceto quando há item
    vendido por peso (ver seção acima).

## Como editar o catálogo

Tudo é feito pelo painel (`admin.html`) — não precisa editar `index.html` ou
`products-data.js` na mão para trocar nome, preço, foto ou criar/remover
produtos. `js/products-data.js` continua sendo o ponto de partida (o catálogo
"de fábrica"); as edições feitas no painel ficam guardadas por cima dele até
serem exportadas (veja a seção "como funciona sem servidor" acima).

### Como adicionar fotos dos produtos

Cada produto tem um campo `slug` (ex.: `frigol`, `chorizo-estancia-92`,
`carvao-5kg`). Por padrão, a foto é buscada em `images/products/<slug>.png`.
Se o arquivo não existir, o card mostra automaticamente um ícone de brasa 🔥
no lugar — o site não quebra e não aparece ícone de imagem quebrada. No
painel do admin também dá pra colocar qualquer outro caminho/URL de imagem no
campo "Imagem" de cada produto.

O mesmo vale para os kits, em `images/kits/<kit-slug>.png`
(`kit-contatinhos`, `kit-completao`, `kit-resenha`, `kit-contato`,
`kit-galera`), também editável pelo painel.

## Grid responsivo dos cards

- Acima de 1080px: 4 cards por linha
- Entre 640px e 1080px: 3 cards por linha
- Abaixo de 640px (celular): 2 cards por linha

Isso está definido em `css/style.css`, na regra `.cards-grid`.

## Hospedando no Vercel (ou qualquer host de site estático)

Esse site é 100% estático (HTML/CSS/JS puro) — não precisa de build, nem de
Node, nem de banco de dados. No Vercel:

1. Suba esta pasta inteira (com `index.html` na raiz do projeto) para um
   repositório Git, ou arraste a pasta direto no painel do Vercel.
2. Framework: escolha **"Other"** (ou deixe em branco) — não use Next.js,
   Vite, etc. Build command: nenhum. Output directory: raiz do projeto (`.`).
3. Não é preciso configurar nada além disso — `vercel.json` já incluído só
   adiciona um cabeçalho extra pedindo pra buscadores não indexarem a página
   `admin.html`, e o `robots.txt` reforça o mesmo pedido.

Um lembrete importante: como não há login "de verdade" (servidor validando
senha), qualquer pessoa que descobrir a URL `seusite.com/admin.html` consegue
ver a tela de login (embora só entre com usuário/senha corretos). O
`robots.txt` e o `vercel.json` ajudam a evitar que a página apareça em buscas
no Google, mas não impedem alguém de acessar a URL diretamente. Se quiser uma
proteção mais forte, dá pra: (a) usar a Proteção por Senha do Vercel (recurso
pago, protege o domínio inteiro ou rotas específicas), ou (b) renomear
`admin.html` para algo menos óbvio antes de publicar.

## Limitações conhecidas desta versão (sem servidor)

- Edições do admin só aparecem para todo mundo depois do passo de exportar +
  subir o arquivo no servidor (explicado acima).
- Os 5 kits têm nome/preço/imagem editáveis, mas a lista de itens de dentro de
  cada kit continua fixa no `index.html` — para mudar os itens de um kit ou
  criar um kit novo do zero, ainda é preciso editar o HTML diretamente.
- Não existe uma lista central de clientes cadastrados nem histórico de
  pedidos — cada pedido vira uma mensagem de WhatsApp, e o cadastro (nome e
  telefone) fica salvo só no navegador de quem comprou.
- O total do pedido só é omitido quando há item por peso (kg) no carrinho —
  qualquer outra unidade é sempre somada normalmente no total final.
- O marcador de "Esgotado" existe só para produtos, não para os 5 kits.
