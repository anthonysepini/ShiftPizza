<div align="center">

# ShiftPizza

### Sistema full stack de gestão de funcionários e escalas para pequenas empresas

<p>
  Projeto de portfólio desenvolvido para demonstrar arquitetura full stack, regras de negócio, autenticação, experiência demo e organização de produto com foco visual e técnico.
</p>

<p>
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-111111?style=for-the-badge" alt="Frontend React e Vite" />
  <img src="https://img.shields.io/badge/Backend-NestJS%20%2B%20Prisma-111111?style=for-the-badge" alt="Backend NestJS e Prisma" />
  <img src="https://img.shields.io/badge/Banco-PostgreSQL%20%2F%20Neon-111111?style=for-the-badge" alt="Banco PostgreSQL e Neon" />
  <img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-orange?style=for-the-badge" alt="Licença MIT" />
</p>

<p>
  <a href="#-prévia-do-projeto">
    <img src="https://img.shields.io/badge/Ver%20prévia-1a1a1a?style=for-the-badge" alt="Ver prévia" />
  </a>
  <a href="#-como-executar-localmente">
    <img src="https://img.shields.io/badge/Executar%20localmente-1a1a1a?style=for-the-badge" alt="Executar localmente" />
  </a>
  <a href="#-tecnologias-utilizadas">
    <img src="https://img.shields.io/badge/Stack%20do%20projeto-1a1a1a?style=for-the-badge" alt="Stack do projeto" />
  </a>
</p>

</div>

O ShiftPizza é um projeto full stack de portfólio criado para simular o gerenciamento de funcionários e escalas de trabalho em pequenas empresas.

A proposta nasceu de um problema real e comum: em muitos negócios menores, a organização da equipe ainda depende de anotações espalhadas, planilhas, alterações de última hora e pouco controle sobre faltas, férias e rotina de trabalho. O ShiftPizza reúne esse fluxo em um único sistema, com uma área administrativa para gestão e uma área do funcionário para consulta pessoal.

Ele foi pensado para mostrar mais do que interface. A intenção aqui foi construir um projeto com estrutura clara, separação entre frontend e backend, validações, autenticação, regras de negócio e uma experiência de demonstração fácil de entender logo no primeiro acesso.

## Demonstração

<div align="center">

### Acesse o projeto

<p>
  <a href="https://front.com" target="_blank">
    <img src="https://img.shields.io/badge/Frontend-Acessar%20site-111111?style=for-the-badge" alt="Acessar frontend" />
  </a>
  <a href="https://api.com" target="_blank">
    <img src="https://img.shields.io/badge/API-Backend-orange?style=for-the-badge" alt="Acessar backend" />
  </a>
</p>

<p>
  O ShiftPizza está disponível online para navegação e teste da experiência demo.
</p>

</div>

### Prévia do projeto

<div align="center">

### Visão geral da experiência

<p>
  Esta prévia mostra o fluxo principal do ShiftPizza, com foco na experiência demo, na área administrativa e na visão do funcionário.
</p>

</div>

### Demonstração em GIF

<div align="center">

![Demonstração do ShiftPizza](docs/media/apresentation.gif)

</div>

### Principais telas

#### Tela de login
A entrada do sistema foi pensada para reduzir atrito durante a demonstração. Nela, o usuário encontra o acesso demo, as credenciais rápidas e a ação de reset.

![Tela de login do ShiftPizza](docs/media/logindemo.png)

#### Dashboard do administrador
O painel administrativo reúne os dados mais importantes da operação, como quantidade de funcionários ativos, faltas registradas, atividade recente e atalhos para as áreas centrais do sistema.

![Dashboard do administrador](docs/media/admindashboard.png)

#### Dashboard do funcionário
O painel do funcionário foi construído para entregar uma leitura rápida da rotina pessoal, com foco em escala, próximos dias de trabalho e alterações relevantes.

![Dashboard do funcionário](docs/media/dashboardemployee.png)

### Tela de login
A entrada do sistema foi pensada para deixar a demonstração simples de testar. A tela já apresenta o acesso demo, credenciais rápidas e a ação de reset.

![Tela de login do ShiftPizza](docs/media/logindemo.png)

### Dashboard do administrador
O painel administrativo mostra uma visão geral da operação, com funcionários ativos, faltas do mês, quantidade de pessoas trabalhando no dia, atividades recentes e atalhos para as principais áreas do sistema.

![Dashboard do administrador](docs/media/admindashboard.png)

### Dashboard do funcionário
O painel do funcionário foi feito para dar uma visão direta da própria rotina. Ele mostra próximos dias de trabalho, faltas registradas, alterações manuais e a escala pessoal de forma objetiva.

![Dashboard do funcionário](docs/media/dashboardemployee.png)

## O que o sistema faz

O ShiftPizza foi dividido em dois fluxos principais.

### Área do administrador
- cadastrar funcionários
- editar dados de funcionários
- remover funcionários
- gerenciar nome, CPF, telefone, cargo e senha
- gerar e organizar escalas mensais
- marcar faltas
- lançar turnos extras
- controlar férias
- acompanhar ações recentes
- resetar o ambiente demo

### Área do funcionário
- acessar um dashboard pessoal
- consultar a própria escala
- visualizar os próprios dados

### Experiência demo
- acesso por perfil
- credenciais demo disponíveis na tela de login
- botão de reset para restaurar o estado original
- usuários demo preparados para teste rápido

## Por que este projeto foi criado

A ideia aqui não foi fazer apenas mais um CRUD.

O objetivo foi construir algo com mais cara de produto: uma aplicação que mostrasse organização full stack, separação entre frontend e backend, regras de negócio, autenticação, validação e uma experiência de demonstração fácil para quem quiser testar o projeto sem complicação.

## Tecnologias utilizadas

### Frontend
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="18" alt="React" /> React
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="18" alt="Vite" /> Vite
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18" alt="TypeScript" /> TypeScript
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="18" alt="Tailwind CSS" /> Tailwind CSS
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="18" alt="CSS" /> CSS
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" width="18" alt="Axios" /> Axios
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg" width="18" alt="React Router DOM" /> React Router DOM

### Backend
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" width="18" alt="NestJS" /> NestJS
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18" alt="TypeScript" /> TypeScript
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" width="18" alt="Prisma ORM" /> Prisma ORM
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="18" alt="Node.js" /> Node.js
- <img src="https://jwt.io/img/pic_logo.svg" width="18" alt="JWT" /> JWT
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18" alt="class-validator" /> class-validator
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18" alt="Argon2" /> Argon2

### Banco e infraestrutura
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="18" alt="PostgreSQL" /> PostgreSQL
- <img src="https://neon.com/brand/neon-logomark-dark-color.svg" width="18" alt="Neon" /> Neon
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="18" alt="HTML" /> HTML
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="18" alt="npm" /> npm

## Estrutura do projeto

<div align="center">

### Como o projeto foi organizado

<p>
  O repositório foi dividido de forma simples e clara para facilitar leitura, manutenção e apresentação.
</p>

</div>

```bash
shiftpizza/
├── 📁 frontend/      # interface, páginas, componentes e navegação
└── 📁 backend/       # API, autenticação, regras de negócio e banco

<table>
  <tr>
    <td>
      <strong>Anthony Diniz Sepini Azevedo</strong><br/>
      Desenvolvedor focado em projetos full stack, arquitetura de aplicações e construção de soluções com boa apresentação visual e técnica.
      <br/><br/>
      <a href="https://github.com/anthonysepini" target="_blank">
        <img src="https://img.shields.io/badge/GitHub-anthonysepini-111111?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
      </a>
      <a href="https://www.linkedin.com/in/anthonysepini" target="_blank">
        <img src="https://img.shields.io/badge/LinkedIn-anthonysepini-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
      </a>
    </td>
  </tr>
</table>
