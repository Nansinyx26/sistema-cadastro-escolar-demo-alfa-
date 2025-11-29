📚 Sistema de Gestão Escolar

Sistema completo de gerenciamento de alunos com registro de notas, geração de relatórios e análise de desempenho acadêmico
🎯 Visão Geral
Sistema web moderno e responsivo para gestão educacional, desenvolvido com tecnologias nativas (HTML5, CSS3, JavaScript ES6+) e IndexedDB para persistência de dados offline. Permite cadastro de alunos, registro de notas por matéria, geração de relatórios em DOCX e análise gráfica de desempenho.
✨ Características Principais

🎨 Interface Moderna: Design premium com gradientes, animações e glassmorphism
💾 Armazenamento Local: IndexedDB para dados persistentes sem necessidade de servidor
📊 Análise Visual: Gráficos interativos com Chart.js
📄 Exportação: Relatórios em DOCX e CSV
📱 Responsivo: Otimizado para desktop, tablet e mobile
🔐 Sistema de Login: Autenticação simples (demo: admin/1234)
🎓 Multi-turmas: Suporte para 20 turmas (1A-5D)
📚 7 Matérias: Matemática, Português, Geografia, História, Ciências, Inglês, Ed. Física


🚀 Tecnologias Utilizadas
Core

HTML5 - Estrutura semântica
CSS3 - Estilização avançada (Grid, Flexbox, Animations)
JavaScript ES6+ - Lógica e interatividade
IndexedDB - Banco de dados local

Bibliotecas

Chart.js 3.9.1 - Gráficos interativos
docx.js - Geração de relatórios DOCX
Font Awesome 6.5 - Ícones


📁 Estrutura do Projeto
sistema-escolar/
│
├── index.html                 # Página de login
├── selecionar.html           # Seleção de turmas/direção
├── modern-styles.css         # Estilos do login e seleção
├── morden-selecionar.css     # Estilos específicos da seleção
│
├── turmas/                   # 20 páginas de turmas
│   ├── 1A.html
│   ├── 1B.html
│   ├── ...
│   └── 5D.html
│
├── graficos/                 # Sistema de gráficos
│   ├── graficos.html
│   ├── graficos.css
│   └── graficos.js
│
├── direcao/                  # Painel administrativo
│   ├── direcao.html
│   ├── direcao.css
│   └── direcao.js
│
├── styles.css                # Estilos globais das turmas
├── script.js                 # Lógica principal do sistema
├── watermark.css             # Marca d'água NanDev
└── watermark.js              # Funcionalidade da marca d'água

🛠️ Instalação e Uso
Opção 1: Uso Direto (Recomendado)

Clone o repositório

bashgit clone https://github.com/Nansinyx26/sistema-gestao-escolar.git
cd sistema-gestao-escolar

Abra no navegador

bash# Abra o arquivo index.html diretamente
# Ou use um servidor local (recomendado):
python -m http.server 8000
# Acesse: http://localhost:8000

Login


Usuário: admin
Senha: 1234

Opção 2: Deploy
GitHub Pages
bashgit init
git add .
git commit -m "Deploy inicial"
git branch -M main
git remote add origin [seu-repositorio]
git push -u origin main
Ative GitHub Pages nas configurações do repositório.
Netlify/Vercel
Arraste a pasta do projeto para o dashboard ou conecte o repositório Git.

📖 Guia de Uso
1️⃣ Login e Navegação

Acesse index.html
Faça login (admin/1234)
Escolha entre Turmas ou Painel da Direção

2️⃣ Gerenciar Alunos

Selecione uma turma (ex: 1A, 2B, etc)
Clique em qualquer célula para editar
Adicionar foto: Clique no placeholder de foto
Salvar: Botão "Salvar" em cada linha
Ordenar: Botão "🔤 Ordenar A-Z"

3️⃣ Registrar Notas

Na página da turma, clique em 📚 Notas por Matéria
Selecione a matéria no filtro
Clique em ➕ Adicionar Avaliação
Preencha: Tipo, Descrição, Nota (0-10), Data
Salvar cada avaliação

4️⃣ Visualizar Gráficos

Clique em 📊 Gráficos na página da turma
Selecione Turma e Aluno
Filtre por matéria (opcional)
Clique em 📈 Gerar Gráficos
Visualize: Evolução, Comparação, Radar

5️⃣ Painel da Direção

Acesse via selecionar.html
Visualize estatísticas gerais
Filtre por turma/matéria
Exporte relatórios (CSV/TXT)

6️⃣ Exportar Relatórios

DOCX: Botão "📄 Gerar DOCX" (página da turma)
CSV: Botão "📄 Exportar Dados" (direção)
TXT: Botão "📊 Gerar Relatórios" (gráficos/direção)


🎨 Personalização
Alterar Cores
Edite as variáveis CSS em styles.css:
css:root {
    --primary: #6366f1;        /* Cor principal */
    --secondary: #ec4899;      /* Cor secundária */
    --bg-dark: #0f172a;        /* Fundo escuro */
    --text-primary: #f1f5f9;   /* Texto principal */
}
Alterar Marca d'Água

Abra watermark.js
Linha 4: Altere a URL do portfólio

javascriptwatermark.href = "SEU-PORTFOLIO-AQUI";

Linha 12: Personalize o texto

javascriptDesenvolvido por <span class="watermark-highlight">SeuNome</span>
Adicionar/Remover Matérias
Edite o array em script.js (linha ~15):
javascriptthis.subjects = [
    { id: 'matematica', name: 'Matemática', icon: '🔢' },
    { id: 'nova_materia', name: 'Nova Matéria', icon: '📐' }
];

🗄️ Estrutura de Dados
IndexedDB Schema
Object Store: students
javascript{
    id: Number (auto),
    class: String,           // Ex: "1A", "2B"
    name: String,
    description: String,
    disability: String,
    photo: String (base64),
    subjectGrades: Object    // { matematica: 8.5, portugues: 7.0 }
}
Object Store: notes
javascript{
    id: Number (auto),
    studentId: Number,
    class: String,
    subject: String,         // Ex: "matematica"
    type: String,            // "prova", "trabalho", "participacao"
    description: String,
    grade: Number,           // 0-10
    date: String (ISO),
    weight: Number           // Peso da avaliação (futuro)
}

🔧 Solução de Problemas
❌ "IndexedDB bloqueado"
Causa: Múltiplas abas abertas ou cache corrompido.
Solução:

Feche todas as abas do sistema
Limpe o cache: Ctrl+Shift+Del → Dados do site
Reabra o sistema

❌ Notas não salvam
Causa: Matéria não selecionada ou nota inválida.
Solução:

Certifique-se de selecionar a matéria no filtro
Nota deve estar entre 0 e 10
Verifique o console (F12) para erros

❌ Gráficos não aparecem
Causa: CDN do Chart.js não carregou ou aluno sem notas.
Solução:

Verifique a conexão com internet
Certifique-se de que o aluno possui notas cadastradas
Tente outro navegador (Chrome recomendado)

❌ Login não funciona
Causa: localStorage bloqueado ou credenciais erradas.
Solução:

Use: admin / 1234 (minúsculas)
Habilite cookies/armazenamento no navegador
Modo anônimo pode bloquear localStorage


🌐 Compatibilidade
Navegadores Testados

✅ Chrome 90+ (Recomendado)
✅ Firefox 88+
✅ Edge 90+
✅ Opera GX 76+
⚠️ Safari 14+ (limitações no IndexedDB)
❌ IE 11 (não suportado)

Resoluções

✅ 4K (3840x2160)
✅ Full HD (1920x1080)
✅ HD (1366x768)
✅ Tablet (768x1024)
✅ Mobile (375x667)


📊 Funcionalidades Avançadas
Sistema de Notas por Matéria

Registro individual por disciplina
Cálculo automático de médias
Filtros por turma e matéria
Histórico completo de avaliações

Gráficos de Evolução

Linha: Evolução temporal das notas
Barra: Comparação entre matérias
Radar: Performance multidimensional
Rosca: Distribuição por categoria

Painel Administrativo

Visão consolidada de todas as turmas
Estatísticas em tempo real
Comparação entre anos escolares
Exportação de dados agregados


🤝 Contribuindo
Contribuições são bem-vindas! Para contribuir:

Fork o projeto
Crie uma branch: git checkout -b feature/nova-funcionalidade
Commit: git commit -m 'Adiciona nova funcionalidade'
Push: git push origin feature/nova-funcionalidade
Abra um Pull Request

Diretrizes

Mantenha o código limpo e documentado
Teste em múltiplos navegadores
Siga o padrão de código existente
Atualize a documentação se necessário

📝 Roadmap
Versão 2.1 (Em desenvolvimento)

 Sistema de backup automático
 Importação de dados via CSV
 Modo escuro/claro
 Notificações de baixo desempenho
 Calendário de avaliações

Versão 3.0 (Planejado)

 Integração com Google Classroom
 App mobile (PWA)
 Sistema de mensagens
 Módulo de frequência
 Impressão de boletins

