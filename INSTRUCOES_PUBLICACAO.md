# Guia Passo a Passo para Publicar seu Projeto

Olá! Este guia foi criado para te ajudar a colocar seu projeto no GitHub e publicá-lo na web.

**Importante:** Todos os comandos abaixo devem ser digitados no **terminal que fica dentro do Firebase Studio**. Procure por uma aba ou janela chamada "Terminal" aqui no seu ambiente de desenvolvimento.

---

### Etapa 1: Enviar seu código para o GitHub

Vamos criar um repositório no GitHub para guardar seu código de forma segura.

#### 1.1. Crie um Repositório no Site do GitHub

1.  Acesse [github.com](https://github.com) e faça login.
2.  Clique no ícone **+** no canto superior direito e selecione **"New repository"**.
3.  **Nome do Repositório:** `provafacil-app`
4.  Deixe-o como **Público** (Public) ou **Privado** (Private), como preferir.
5.  **NÃO** marque nenhuma das caixas (README, .gitignore, license).
6.  Clique em **"Create repository"**.

#### 1.2. Copie a URL do seu Repositório

Na página seguinte, o GitHub mostrará a URL do seu repositório. Será algo como:
`https://github.com/SEU-NOME-DE-USUARIO/provafacil-app.git`
Copie essa URL. Você precisará dela no próximo passo.

#### 1.3. Execute os Comandos no Terminal do Firebase Studio

Copie e cole os comandos abaixo, um de cada vez, no terminal aqui do Studio.

```bash
# Comando 1: Inicializa o Git (se ainda não o fez)
# Isso prepara sua pasta para se comunicar com o GitHub.
git init -b main
```

```bash
# Comando 2: Adiciona todos os seus arquivos do projeto
# O ponto "." significa "todos os arquivos nesta pasta".
git add .
```

```bash
# Comando 3: Cria um "pacote" de confirmação com seus arquivos
# A mensagem é um registro do que você fez.
git commit -m "Versão inicial do ProvaFácil"
```

```bash
# Comando 4: Conecta seu projeto local com o repositório no GitHub
# COLE A URL QUE VOCÊ COPIOU DO GITHUB AQUI!
git remote add origin https://github.com/SEU-NOME-DE-USUARIO/provafacil-app.git
```

```bash
# Comando 5: Envia seu código para o GitHub
git push -u origin main
```

Se tudo deu certo, ao recarregar a página do seu repositório no GitHub, você verá todos os arquivos do seu projeto lá!

---

### Etapa 2: Publicar o Aplicativo na Web

Agora, vamos colocar seu site no ar usando o Firebase App Hosting.

#### 2.1. Execute o Comando de Deploy no Terminal do Firebase Studio

O ambiente do Firebase Studio já está configurado com sua conta. Você só precisa executar um comando.

Copie e cole o comando abaixo no mesmo terminal que você usou antes:

```bash
# Este comando constrói seu aplicativo e o envia para a hospedagem do Firebase.
firebase deploy --only apphosting
```

#### 2.2. Acesse seu Aplicativo!

Aguarde o processo terminar. No final, o terminal mostrará a URL do seu site publicado. Será algo como:

**`https://provafacil-app--<hash-aleatorio>.<regiao>.web.app`**

Copie essa URL, cole no seu navegador e seu aplicativo estará funcionando na web!

Se encontrar qualquer erro durante esses passos, copie a mensagem de erro do terminal e me envie para que eu possa ajudar.
