## Sistema de Gerenciamento de Pedidos

#### Descrição: Um sistema para gerenciar pedidos em um restaurante.    
- Rotas da aplicação:
  #### Produtos
  - [x] **POST** **`/api/product`** - Criar um novo produto.
    - *id*
    - *Nome*
    - *Descrição*
    - *Preço*
    - *Categoria*
    - *Data de criação*
    - *Data de remoção*
    - *Data de edição*
  - [x] **GET** **`/api/product`** - Listar todos os produtos (+ filtro name).
  - [x] **GET** **`/api/product/:id`** - Buscar um produto específico.
  - [x] **PUT** **`/api/product/:id`** - Atualizar um produto específico.
  - [x] **DELETE** **`/api/product/:id`** - Deletar um produto específico.

  #### Categorias
  - [x] **POST** **`/api/category`** - Criar uma nova categoria.
    - *id*
    - *Nome*
    - *Data de criação*
    - *Data de remoção*
    - *Data de edição*
  - [x] **GET** **`/api/category`** - Listar todas as categorias.
  - [x] **GET** **`/api/category/:id`** - Buscar uma categoria específica com os produtos.
  - [x] **PUT** **`/api/category/:id`** - Atualizar uma categoria específica.
  - [x] **DELETE** **`/api/category/:id`** - Deletar uma categoria específica.

  #### Pedidos
  - [x] **POST** **`/api/pedidos`** - Criar um novo pedido.
    - *id*
    - *Produto (id)*
    - *Status ('pendente', 'em preparo', 'pronto', 'entregue')*
    - *Data de criação*
    - *Data de remoção*
    - *Data de edição*
  - [x] **GET** **`/api/pedidos`** - Listar todos os pedidos (+ filtro por status).
  - [x] **GET** **`/api/pedidos/:id`** - Buscar um pedido específico.
  - [x] **PUT** **`/api/pedidos/:id`** - Atualizar um pedido específico.
  - [x] **DELETE** **`/api/pedidos/:id`** - Deletar um pedido específico.


### Tecnologias

- NodeJS - Express
- Postgres SQL - Docker
- Prisma ORM
- JTW

#### Extras
- [x] Fazer docker-compose
- [x] RBAC - Autorização por roles
- [x] Refresh Token
- [] Swagger
- [] Refatorar **
  - Aplicar validações com ZOD
  - Reduzir duplicidade de código
  - Transformar Controllers em "static"
  - Criar contratos
  - Função / Classe para gerar Token (Reutilizável)
- [] Deploy