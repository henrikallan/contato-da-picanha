/* ============================================================
   CONTATO DA PICANHA — Catálogo de produtos (referência)
   Os cards de produto agora são HTML estático dentro do
   index.html, um por categoria (mesmo padrão dos cards de kit).
   Esta lista (PRODUCTS) NÃO gera mais os cards automaticamente —
   ela fica aqui só como referência/backup dos dados usados.

   Para trocar nome ou preço de um produto: edite direto o card
   dele em index.html.
   Para adicionar a foto de um produto: salve uma imagem em
   images/products/<slug>.jpg (o slug está no atributo "src" da
   <img> de cada card, ex.: images/products/frigol.jpg).
   Se a imagem não existir, o card mostra um ícone de brasa no lugar.

   KIT_IMAGES (no fim deste arquivo) continua ativo — ele ainda
   controla as fotos dos 5 kits de churrasco.
============================================================ */

const PRODUCTS = {

  picanhas: [
    { slug: "selecao-contato",    name: "PICANHA SELEÇÃO CONTATO",              origin: "Nacional",   storage: "Resfriada", price: "99,90",  unit: "kg" },
    { slug: "frigol-chef",        name: "PICANHA FRIGOL CHEF",                  origin: "Nacional",   storage: "Resfriada", price: "89,90",  unit: "kg",   soldOut: true },
    { slug: "pul",                name: "PICANHA PUL",                          origin: "Nacional",   storage: "Resfriada", price: "112,90", unit: "kg",   soldOut: true },
    { slug: "chef",               name: "PICANHA CHEF",                         origin: "Nacional",   storage: "Resfriada", price: "115,90", unit: "kg" },
    { slug: "estancia-92",        name: "PICANHA ESTÂNCIA 92",                  origin: "Nacional",   storage: "Resfriada", price: "144,90", unit: "kg" },
    { slug: "bassi",              name: "PICANHA BASSI",                        origin: "Nacional",   storage: "Resfriada", price: "144,90", unit: "kg",   soldOut: true },
    { slug: "frigol",             name: "PICANHA FRIGOL",                       origin: "Nacional",   storage: "Resfriada", price: "109,90", unit: "kg" },
    { slug: "brasa",              name: "PICANHA BRASA",                        origin: "Nacional",   storage: "Resfriada", price: "119,90", unit: "kg" },
    { slug: "dimeza",             name: "PICANHA DIMEZA",                       origin: "Nacional",   storage: "Resfriada", price: "117,90", unit: "kg",   soldOut: true },
    { slug: "fire",               name: "PICANHA FIRE",                         origin: "Nacional",   storage: "Resfriada", price: "122,90", unit: "kg" },
    { slug: "baby-novilho",       name: "PICANHA BABY NOVILHO",                 origin: "Nacional",   storage: "Resfriada", price: "119,90", unit: "kg",   soldOut: true },
    { slug: "diprima",            name: "PICANHA DIPRIMA",                      origin: "Nacional",   storage: "Resfriada", price: "119,90", unit: "kg",   soldOut: true },
    { slug: "guarani",            name: "PICANHA GUARANI",                      origin: "Paraguaia",  storage: "Resfriada", price: "124,90", unit: "kg",   soldOut: true },
    { slug: "cabana-las-lilas",   name: "PICANHA CABAÑA LAS LILAS",             origin: "Uruguaia",   storage: "Congelada", price: "132,90", unit: "kg",   soldOut: true },
    { slug: "tacuarembo",         name: "PICANHA TACUAREMBÓ",                   origin: "Uruguaia",   storage: "Congelada", price: "129,90", unit: "kg" },
    { slug: "los lazos",          name: "PICANHA LOS LAZOS",                    origin: "Uruguaia",   storage: "Congelada", price: "132,90", unit: "kg" },
    { slug: "cocarsa",            name: "PICANHA COCARSA",                      origin: "Argentina",  storage: "Congelada", price: "137,90", unit: "kg" },
    { slug: "selecao-contato-bdj",name: "PICANHA SELEÇÃO CONTATO - 500g",       origin: "Nacional",   storage: "Congelada", price: "69,90",  unit: "un" },
  ],

  bovinos: [
    { slug: "chorizo-estancia-92",    name: "CHORIZO ESTÂNCIA 92",                      price: "79,90", unit: "kg" },
    { slug: "fraldinha-extra-grill",  name: "FRALDINHA EXTRA GRILL",                    price: "59,90", unit: "kg" },
    { slug: "fraldinha-fire",         name: "FRALDINHA FIRE",                           price: "49,90", unit: "kg",   soldOut: true }, 
    { slug: "ancho-grill",            name: "ANCHO GRILL",                              price: "64,90", unit: "kg" },
    { slug: "contra-file-cara-branca",name: "CONTRA FILÉ CARA BRANCA",                  price: "69,90", unit: "kg" },
    { slug: "contra-file-chef",       name: "CONTRA FILÉ CHEF",                         price: "66,90", unit: "kg",   soldOut: true },
    { slug: "bananinha",              name: "BANANINHA",                                price: "55,90", unit: "kg" },
    { slug: "capa-file-bassi",        name: "CAPA DE FILÉ BASSI",                       price: "45,90", unit: "kg",   soldOut: true },
    { slug: "stick-de-costela",       name: "STICK DE COSTELA",                         price: "59,90", unit: "kg" },
    { slug: "maca-de-peito-angus",    name: "BRISKET ANGUS - MAÇÃ DE PEITO",            price: "64,90", unit: "kg" },
    { slug: "rib-steak-grill",        name: "RIB STEAK GRILL",                          price: "69,90", unit: "kg",   soldOut: true },
    { slug: "maminha-angus",          name: "MAMINHA ANGUS",                            price: "99,90", unit: "kg",   soldOut: true },
    { slug: "alcatra-com-queijo",     name: "ALCATRA C/ QUEIJO",                        price: "64,90", unit: "kg" },
    { slug: "baby-beef-angus",        name: "BABY BEEF ANGUS",                          price: "89,90", unit: "kg",   soldOut: true },
    { slug: "chorizo-steak-1kg",      name: "CHORIZO STEAK CONTATO - 1KG",              price: "79,90", unit: "un" },
    { slug: "chorizo-steak-500g",     name: "CHORIZO STEAK CONTATO - 500g",             price: "39,90", unit: "un" },
    { slug: "costela-premium",        name: "COSTELA BOVINA C/ QUEIJO - 450g",          price: "74,90" },
    { slug: "linguica-costela-angus", name: "LINGUIÇA DE COSTELA ANGUS - 300g",         price: "16,90" },
    { slug: "linguica-costela-queijo",name: "LINGUIÇA DE COSTELA C/ QUEIJO - 420g",     price: "25,90",   soldOut: true },
    { slug: "hamburger-angus",        name: "HAMBÚRGUER ANGUS - CX 2 UN.",              price: "21,90" },
    { slug: "alcatra-queijo-espeto",  name: "ALCATRA C/ QUEIJO NO ESPETO - 5 UN.",      price: "34,90",   soldOut: true },
  ],

  suinos: [
    { slug: "picanha-suina-defumada",  name: "PICANHA SUÍNA DEFUMADA",                price: "39,90", unit: "kg" },
    { slug: "picanha-suina-temperada", name: "PICANHA SUÍNA TEMPERADA",               price: "39,90", unit: "kg" },
    { slug: "alcatra-suina-temperada", name: "ALCATRA SUÍNA TEMPERADA",               price: "34,90", unit: "kg" },
    { slug: "costelinha-bbq",          name: "COSTELINHA AO MOLHO BBQ - 500g",        price: "49,90" },
    { slug: "panceta-temperada",       name: "PANCETA TEMPERADA",                     price: "36,90", unit: "kg" },
    { slug: "panceta-bandeja",         name: "PANCETA TEMPERADA CONTATO - 500g",      price: "23,90", unit: "un" },
    { slug: "linguica-toscana",        name: "LINGUIÇA TOSCANA",                      price: "21,90" },

    { slug: "manta-recheada",          name: "MANTA RECHEADA - 500g",                 price: "21,90",
      variants: { brands: [ { flavors: [
        { name: "Cheddar",     image:   "images/products/suinos/manta-recheada-cheddar.jpg" },
        { name: "Provolone",   image: "images/products/suinos/manta-recheada-provolone.jpg" }
      ] } ] } },

    { slug: "linguica-artesanal-recheada", name: "LINGUIÇA ARTESANAL RECHEADA - 500g", price: "21,90",
      variants: { brands: [ { flavors: [
        { name: "Tradicional",       image:      "images/products/suinos/linguica-artesanal-tradicional.jpg" },
        { name: "Bacon",             image:            "images/products/suinos/linguica-artesanal-bacon.jpg" },
        { name: "Provolone",         image:        "images/products/suinos/linguica-artesanal-provolone.jpg" },
        { name: "Mandioca",          image:         "images/products/suinos/linguica-artesanal-mandioca.jpg" },
        { name: "Alho Poró",         image:        "images/products/suinos/linguica-artesanal-alho-poro.jpg" },
        { name: "Pimenta Biquinho",  image: "images/products/suinos/linguica-artesanal-pimenta-biquinho.jpg" },
        { name: "Apimentada",        image:       "images/products/suinos/linguica-artesanal-apimentada.jpg" }
      ] } ] } },
  ],

  aves: [
    { slug: "tulipa-bbq",             name: "TULIPA BBQ - 1KG",                         price: "29,90"  },

    { slug: "tulipa-marinada",        name: "TULIPA MARINADA - 600g",                   price: "24,90",
    variants: { brands: [ { flavors: [
        { name: "Mostarda e Mel",          image:        "images/products/aves/tulipa-mostarda-mel.jpg" },
        { name: "Cerveja e Ervas Finas",   image: "images/products/aves/tulipa-cerveja-ervas-finas.jpg" }
      ] } ] } },

    { slug: "coxinha-mostarda-mel",   name: "COXINHA NA MOSTARDA E MEL - 1KG",           price: "22,90" },
    { slug: "sobrecoxa-marinada",     name: "SOBRECOXA MARINADA NA CERVEJA - PCT 900g",  price: "24,90" },
    { slug: "coracao-espeto",         name: "CORAÇÃO NO ESPETO - 5 UN.",                 price: "24,90" },
    { slug: "coracao-temperado",      name: "CORAÇÃO TEMPERADO - 600g",                  price: "29,90" },
    { slug: "coxinha-temperada",      name: "COXINHA TEMPERADA CONTATO - 500g",          price: "22,90",  unit: "un" },
  ],

  diversos: [
    { slug: "pao-de-alho", name: "PÃES DE ALHO", price: "22,90",
      variants: { brands: [

        { name:  "Zé do Espeto",
           image: "images/products/diversos/pao-marcas-sabores/ze-do-espeto.jpg", 
             flavors: [
          { name: "Tradicional",          image:      "images/products/diversos/pao-marcas-sabores/ze-do-espeto-tradicional.jpg" },
          { name: "4 Queijos",            image:        "images/products/diversos/pao-marcas-sabores/ze-do-espeto-4-queijos.jpg" },
          { name: "Tomate Seco",          image:      "images/products/diversos/pao-marcas-sabores/ze-do-espeto-tomate-seco.jpg" },
          { name: "Frango c/ Requeijão",  image: "images/products/diversos/pao-marcas-sabores/ze-do-espeto-frango-requeijao.jpg" },
          { name: "Alho Poró",            image:        "images/products/diversos/pao-marcas-sabores/ze-do-espeto-alho-poro.jpg" }
        ] },

        { name: "Beagô", 
           image: "images/products/diversos/pao-marcas-sabores/beago.jpg",
             flavors: [
          { name: "Tradicional",           image:      "images/products/diversos/pao-marcas-sabores/beago-tradicional.jpg" },
          { name: "Pepperoni",             image:        "images/products/diversos/pao-marcas-sabores/beago-pepperoni.jpg" },
          { name: "4 Queijos",             image:        "images/products/diversos/pao-marcas-sabores/beago-4-queijos.jpg" },
          { name: "Tomate Seco",           image:      "images/products/diversos/pao-marcas-sabores/beago-tomate-seco.jpg" },
          { name: "Calabresa",             image:        "images/products/diversos/pao-marcas-sabores/beago-calabresa.jpg" },
          { name: "Alho Poró",             image:        "images/products/diversos/pao-marcas-sabores/beago-alho-poro.jpg" },
          { name: "Frango c/ Requeijão",   image: "images/products/diversos/pao-marcas-sabores/beago-frango-requeijao.jpg" }
        ] },

        { name: "Dona Beth", 
           image: "images/products/diversos/pao-marcas-sabores/dona-beth.jpg",
             flavors: [
          { name: "Alho Poró c/ Queijo Suíço",    image:     "images/products/diversos/pao-marcas-sabores/dona-beth-alho-poro.jpg" },
          { name: "Bacon c/ Cheddar",             image: "images/products/diversos/pao-marcas-sabores/dona-beth-bacon-cheddar.jpg" } 
        ] }

      ] } },

    { slug: "medalhao",      name: "MEDALHÕES - 5 UN.",                price: "34,90",
      variants: { brands: [ { flavors: [
        { name: "Frango",             image:            "images/products/diversos/medalhao-frango.jpg" },
        { name: "Mussarela Bolinha",  image: "images/products/diversos/medalhao-mussarela-bolinha.jpg" },
        { name: "Romeu e Julieta",    image:     "images/products/diversos/medalhao-romeu-julieta.jpg" },
        { name: "Batata c/ Cheddar",  image:    "images/products/diversos/medalhao-batata-cheddar.jpg" }
      ] } ] } },

    { slug: "farofa-crocante-faroka", name: "FAROFA CROCANTE - FAROKA", price: "15,90",
      variants: { brands: [ { flavors: [
        { name: "Alho",        image:         "images/products/diversos/farofa-alho.jpg" },
        { name: "Bacon",       image:        "images/products/diversos/farofa-bacon.jpg" },
        { name: "Ervas Finas", image:  "images/products/diversos/farofa-ervas-finas.jpg" },
        { name: "Picante",     image:      "images/products/diversos/farofa-picante.jpg" }
      ] } ] } },

    { slug: "choripan",                   name: "CHORIPAN - CX 400g",                         price: "29,90",
      variants: { brands: [ { flavors: [
        { name: "Suína - Quatro Queijos",                        image:     "images/products/diversos/choripan-quatro-queijos.jpg" },
        { name: "Suína - Abacaxi c/ Provolone",                  image:  "images/products/diversos/choripan-abacaxi-provolone.jpg" },
        { name: "Linguiça Suína c/ Queijo Minas",                image:       "images/products/diversos/choripan-queijo-minas.jpg" },
        { name: "Linguiça de Contrafilé c/ Gorgonzola",          image:         "images/products/diversos/choripan-gorgonzola.jpg" },
        { name: "Linguiça de Frango c/ Requeijão",               image:          "images/products/diversos/choripan-requeijao.jpg" }
        
        
      ] } ] } },

    { slug: "picole-costelinha-queijo",   name: "PICOLÉ DE COSTELINHA C/ QUEIJO - 3 UN.",       price: "21,90" },
    { slug: "camafeu",                    name: "CAMAFEU - CX 10 UN.",                        price: "32,90" },
    { slug: "camarao-espeto",             name: "CAMARÃO NO ESPETO - 7 UN.",                  price: "39,90" },
    { slug: "bolinho-bacalhau",           name: "BOLINHO DE BACALHAU - 15 UN.",               price: "21,90" },
    { slug: "bolinho-costela",            name: "BOLINHO DE COSTELA C/ QUEIJO",               price: "42,90" },
    { slug: "bolinho-copa-lombo",         name: "BOLINHO DE COPA LOMBO C/ QUEIJO & BARBECUE", price: "42,90" },
    { slug: "salsichao",                  name: "SALSICHÃO - 500g",                           price: "10,90" },
    { slug: "queijo-coalho",              name: "QUEIJO COALHO - 6 UN.",                      price: "29,90" },

    { slug: "carvao-tamanhos", name: "CARVÃO", price: "ESCOLHA O TAMANHO",
      variants: { flavorLabel: "Tamanho", brands: [ { flavors: [
        { name: "Carvão 3kg",  price: "16,90", image:  "images/products/diversos/carvao-tamanhos.jpg" },
        { name: "Carvão 5kg",  price: "26,90", image:  "images/products/diversos/carvao-tamanhos.jpg" },
        { name: "Carvão 10kg", price: "52,90", image: "images/products/diversos/carvao-tamanhos.jpg" }
      ] } ] } },

    { slug: "acendedor-fogaco",           name: "ACENDEDOR FOGAÇO - 1 UN",                    price:  "2,90" },
      
  ],

  molhos: [
    { slug: "molho-agridoce-ardencia", name: "MOLHO AGRIDOCE ARDÊNCIA EXÓTICA - 250ML", price: "18,90",
      variants: { brands: [ { flavors: [
        { name: "Cebola Caramelizada", image: "images/products/molhos/cebola-caramelizada.jpg" },
        { name: "Jabuticaba",          image: "images/products/molhos/jabuticaba.jpg" },
        { name: "Morango",             image: "images/products/molhos/morango.jpg" },
        { name: "Picante",             image: "images/products/molhos/picante.jpg" },
        { name: "Abacaxi",             image: "images/products/molhos/abacaxi.jpg" },
        { name: "Maracujá",            image: "images/products/molhos/maracuja.jpg" },
        { name: "Gengibre c/ Limão",   image: "images/products/molhos/gengibre-limao.jpg" },
        { name: "Manga",               image: "images/products/molhos/manga.jpg" }
      ] } ] } },

    { slug: "baconnaise-junior",     name: "BACONNAISE JUNIOR - 360g",             price: "26,90" },
    { slug: "maionese-grill-junior", name: "MAIONESE GRILL JUNIOR - 350g",         price: "25,90" },

    { slug: "chimichurri",           name: "CHIMICHURRI",                   price: "19,90",
       variants: { brands: [ { flavors: [
        { name: "Tradicional",       image: "images/products/molhos/chimichurri-tradicional.jpg" },
        { name: "Limão Siciliano",   image: "images/products/molhos/chimichurri-limao-siciliano.jpg" }
      ] } ] } },

    { slug: "vinagrete-pimenta",     name: "VINAGRETE DE PIMENTA - 350g",            price: "32,90" },
    { slug: "azeite-alma-lusa",      name: "AZEITE EXTRA VIRGEM ALMA LUSA - 500ML",      price: "34,90" },
    { slug: "melado-de-cana",        name: "MELADO DE CANA - 500ML",          price: "19,90" },
  ],


    sais: [
        { slug: "sais-parrilla-mini", name: "SAL DE PARRILLA - 125g", price: "8,90",
      variants: { brands: [ { flavors: [
        { name: "Tradicional",     image:   "images/products/sais/sal-parrilla-tradicional.jpg" },
        { name: "Cebola & Alho",   image:   "images/products/sais/sal-parrilla-cebola-alho.jpg" },
        { name: "Chimichurri",     image:   "images/products/sais/sal-parrilla-chimichurri.jpg" },
        { name: "Pimenta Preta",   image: "images/products/sais/sal-parrilla-pimenta-preta.jpg" }
      ] } ] } },

        { slug: "sais-parrilla-500g", name: "SAL DE PARRILLA - 500g", price: "16,90",
      variants: { brands: [ { flavors: [
        { name: "Tradicional",     image:   "images/products/sais/sal-parrilla-tradicional.jpg" },
        { name: "Cebola & Alho",   image:   "images/products/sais/sal-parrilla-cebola-alho.jpg" },
        { name: "Chimichurri",     image:   "images/products/sais/sal-parrilla-chimichurri.jpg" },
        { name: "Pimenta Preta",   image: "images/products/sais/sal-parrilla-pimenta-preta.jpg" }
      ] } ] } },

    { slug: "sais-parrilla-850g", name: "SAL DE PARRILLA - 850g", price: "21,90",
      variants: { brands: [ { flavors: [
        { name: "Tradicional",     image:   "images/products/sais/sal-parrilla-tradicional.jpg" },
        { name: "Cebola & Alho",   image:   "images/products/sais/sal-parrilla-cebola-alho.jpg" },
        { name: "Chimichurri",     image:   "images/products/sais/sal-parrilla-chimichurri.jpg" },
        { name: "Pimenta Preta",   image: "images/products/sais/sal-parrilla-pimenta-preta.jpg" }
      ] } ] } },
  ],

  acessorios: [

    { slug: "tabua-personalizada",        name: "TÁBUAS PERSONALIZADAS",                      price: "299,90"},
    { slug: "faca-personalizada",         name: "FACAS PERSONALIZADAS",                       price: "299,90"},
    { slug: "petisqueira-personalizada",  name: "PETISQUEIRAS PERSONALIZADAS",                price: "199,90"},
    { slug: "garra-de-urso" ,             name: "GARRAS DE URSO PERSONALIZADAS",              price:  "69,90"},
    { slug: "sacola-termica",             name: "SACOLA TÉRMICA",                             price:   "9,90"},
  ],

};

const KIT_IMAGES = {
  "kit-contatinhos": "images/kits/kit-contatinhos.jpg",
  "kit-completao":   "images/kits/kit-completao.jpg",
  "kit-resenha":     "images/kits/kit-resenha.jpg",
  "kit-contato":     "images/kits/kit-contato.jpg",
  "kit-galera":      "images/kits/kit-galera.jpg",
};

window.PRODUCTS = PRODUCTS;
window.KIT_IMAGES = KIT_IMAGES;