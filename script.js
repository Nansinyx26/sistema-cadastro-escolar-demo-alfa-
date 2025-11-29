// Sistema de Cadastro de Alunos - JavaScript Principal - Versão com Sistema de Matérias e Gráficos

class StudentManagementSystem {
    constructor() {
        this.dbName = 'StudentsDB';
        this.version = 4; // Incrementando versão para incluir sistema de matérias
        this.db = null;
        this.currentClass = null;
        this.nextTempId = 1;
        this.notesModal = null;
        this.currentStudentForNotes = null;
        this.currentSubject = ''; // Matéria atual selecionada

        // Definir matérias disponíveis
        this.subjects = [
            { id: 'matematica', name: 'Matemática' },
            { id: 'portugues', name: 'Português' },
            { id: 'geografia', name: 'Geografia' },
            { id: 'historia', name: 'História' },
            { id: 'ciencias', name: 'Ciências' },
            { id: 'ingles', name: 'Inglês' },
            { id: 'educacao_fisica', name: 'Educação Física' }
        ];

        this.init();
    }

    async init() {
        await this.initDB();
        this.createNotesModal();
        this.injectStyles();
        this.injectGraphicsStyles(); // Adicionar estilos dos gráficos
        if (document.querySelector('.students-table')) {
            this.initClassPage();
        } else {
            // Se estiver na página inicial, adicionar botão de gráficos
            this.addGraphicsButtonToIndex();
        }
    }

    // Injetar estilos do modal de notas (atualizado com estilos para matérias)
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Estilos do Modal de Notas */
            .notes-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }

            .notes-modal-content {
                background: linear-gradient(135deg, #222222 0%, #2a2a2a 100%);
                margin: 2% auto;
                padding: 0;
                border-radius: 12px;
                width: 95%;
                max-width: 1200px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 188, 212, 0.5);
                border: 2px solid #00bcd4;
            }

            .notes-modal-header {
                background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
                padding: 20px 25px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .notes-modal-title {
                font-size: 24px;
                font-weight: 600;
                margin: 0;
            }

            .notes-close {
                color: white;
                font-size: 32px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                line-height: 1;
                padding: 5px 10px;
                border-radius: 50%;
            }

            .notes-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }

            .notes-modal-body {
                padding: 25px;
                max-height: calc(90vh - 120px);
                overflow-y: auto;
                color: #e0e0e0;
            }

            .notes-controls {
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: 15px;
                margin-bottom: 20px;
                align-items: center;
            }

            .subject-filter-container {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .subject-filter-label {
                color: #00bcd4;
                font-weight: 600;
                white-space: nowrap;
            }

            .subject-filter-select {
                background: linear-gradient(135deg, #333333 0%, #444444 100%);
                color: #e0e0e0;
                border: 2px solid #00bcd4;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                min-width: 180px;
            }

            .subject-filter-select:focus {
                outline: none;
                border-color: #26c6da;
                box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.3);
            }

            .subject-filter-select:hover {
                background: linear-gradient(135deg, #444444 0%, #555555 100%);
                border-color: #26c6da;
            }

            .notes-add-btn {
                background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
                white-space: nowrap;
            }

            .notes-add-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(67, 160, 71, 0.7);
                background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
            }

            .notes-add-btn:disabled {
                background: #666666;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }

            .notes-table-container {
                background: #1a1a1a;
                border-radius: 10px;
                overflow: hidden;
                border: 1px solid #444444;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .notes-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
                color: #e0e0e0;
            }

            .notes-table th {
                background: linear-gradient(135deg, #333333 0%, #444444 100%);
                color: #00bcd4;
                padding: 15px 12px;
                text-align: left;
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 2px solid #00bcd4;
                position: sticky;
                top: 0;
                z-index: 10;
            }

            .notes-table td {
                padding: 12px;
                border-bottom: 1px solid #333333;
                vertical-align: middle;
            }

            .notes-table tr:hover {
                background-color: #2a2a2a;
            }

            .notes-table tr.editing {
                background-color: #004d40;
                box-shadow: inset 0 0 0 2px #00bcd4;
            }

            .notes-table input[type="text"],
            .notes-table input[type="number"],
            .notes-table input[type="date"],
            .notes-table select,
            .notes-table textarea {
                width: 100%;
                padding: 8px 10px;
                border: 1px solid #555555;
                border-radius: 6px;
                font-size: 13px;
                background-color: #333333;
                color: #e0e0e0;
                transition: all 0.3s;
            }

            .notes-table input:focus,
            .notes-table select:focus,
            .notes-table textarea:focus {
                outline: none;
                border-color: #00bcd4;
                box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.3);
                background-color: #2a2a2a;
            }

            .notes-table textarea {
                resize: vertical;
                min-height: 60px;
                max-height: 100px;
            }

            .notes-table .student-name {
                font-weight: 600;
                color: #00bcd4;
                min-width: 150px;
            }

            .notes-table .grade-input {
                width: 80px;
                text-align: center;
            }

            .notes-table .subject-display {
                font-weight: 600;
                color: #fbc02d;
                background: rgba(251, 192, 45, 0.1);
                padding: 4px 8px;
                border-radius: 6px;
                text-align: center;
                min-width: 120px;
            }

            .notes-actions {
                display: flex;
                gap: 8px;
                justify-content: center;
                min-width: 120px;
            }

            .btn-note-save {
                background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 500;
                transition: all 0.3s;
            }

            .btn-note-save:hover {
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(67, 160, 71, 0.7);
            }

            .btn-note-delete {
                background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 500;
                transition: all 0.3s;
            }

            .btn-note-delete:hover {
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(229, 57, 53, 0.7);
            }

            .empty-notes-message {
                text-align: center;
                padding: 40px 20px;
                color: #888888;
                font-style: italic;
                background: #1a1a1a;
                border-radius: 8px;
                border: 2px dashed #444444;
            }

            .notes-summary {
                background: linear-gradient(135deg, #2a2a2a 0%, #333333 100%);
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                border-left: 4px solid #00bcd4;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .notes-summary h3 {
                color: #00bcd4;
                margin-bottom: 15px;
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .notes-summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
            }

            .summary-item {
                text-align: center;
                background: rgba(0, 188, 212, 0.1);
                padding: 15px;
                border-radius: 8px;
                border: 1px solid rgba(0, 188, 212, 0.3);
            }

            .summary-label {
                font-size: 12px;
                color: #888888;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                font-weight: 600;
            }

            .summary-value {
                font-size: 20px;
                font-weight: 700;
                color: #00bcd4;
            }

            .subject-indicator {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                padding: 10px;
                background: rgba(251, 192, 45, 0.1);
                border-radius: 8px;
                border-left: 4px solid #fbc02d;
            }

            .subject-icon {
                font-size: 18px;
            }

            .subject-name {
                font-weight: 600;
                color: #fbc02d;
                font-size: 16px;
            }

            @media (max-width: 768px) {
                .notes-modal-content {
                    width: 98%;
                    margin: 1% auto;
                    max-height: 95vh;
                }

                .notes-controls {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }

                .subject-filter-container {
                    justify-content: center;
                }

                .notes-table {
                    font-size: 12px;
                }

                .notes-table th,
                .notes-table td {
                    padding: 8px 6px;
                }

                .notes-summary-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }

                .summary-item {
                    padding: 10px;
                }
            }

            /* Animações */
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.8) translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .notes-modal.show .notes-modal-content {
                animation: modalSlideIn 0.4s ease-out;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .notes-table tr {
                animation: fadeInUp 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    // Função para injetar estilos dos gráficos
    injectGraphicsStyles() {
        if (!document.getElementById('graphics-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'graphics-styles';
            styleSheet.textContent = `
                .btn-graphics {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                
                .btn-graphics:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
                }
                
                .btn-graphics:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 10px rgba(255, 107, 107, 0.6);
                }
                
                .graphics-btn {
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    border: none;
                    border-radius: 15px;
                    padding: 20px;
                    margin: 10px;
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    min-width: 250px;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                    text-decoration: none;
                }
                
                .graphics-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
                }
                
                .graphics-btn .btn-icon {
                    font-size: 2em;
                    margin-bottom: 5px;
                }
                
                .graphics-btn .btn-text h3 {
                    margin: 0 0 5px 0;
                    font-size: 1.2em;
                    font-weight: 600;
                }
                
                .graphics-btn .btn-text p {
                    margin: 0;
                    font-size: 0.9em;
                    opacity: 0.8;
                }
                
                @media (max-width: 768px) {
                    .graphics-btn {
                        min-width: auto;
                        width: 100%;
                        margin: 10px 0;
                        flex-direction: column;
                        text-align: center;
                        padding: 15px;
                        gap: 10px;
                    }
                    
                    .graphics-btn .btn-icon {
                        font-size: 1.5em;
                        margin-bottom: 0;
                    }
                }
            `;
            document.head.appendChild(styleSheet);
        }
    }

    // Criar modal de notas (atualizado com filtro de matérias)
    createNotesModal() {
        const modal = document.createElement('div');
        modal.className = 'notes-modal';
        modal.innerHTML = `
            <div class="notes-modal-content">
                <div class="notes-modal-header">
                    <h2 class="notes-modal-title">📚 Gerenciar Notas por Matéria</h2>
                    <span class="notes-close">&times;</span>
                </div>
                <div class="notes-modal-body">
                    <div class="notes-summary">
                        <h3>📊 Resumo da Turma</h3>
                        <div class="notes-summary-grid">
                            <div class="summary-item">
                                <div class="summary-label">Média da Turma</div>
                                <div class="summary-value" id="class-average">-</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Alunos com Nota</div>
                                <div class="summary-value" id="students-with-grades">-</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Total de Avaliações</div>
                                <div class="summary-value" id="total-assessments">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="notes-controls">
                        <div class="subject-filter-container">
                            <label class="subject-filter-label">Matéria:</label>
                            <select class="subject-filter-select" onchange="studentSystem.filterBySubject(this.value)">
                                <option value="">📚 Todas as Matérias</option>
                                <option value="matematica">🔢 Matemática</option>
                                <option value="portugues">📝 Português</option>
                                <option value="geografia">🗺️ Geografia</option>
                                <option value="historia">📜 História</option>
                                <option value="ciencias">🔬 Ciências</option>
                                <option value="ingles">🇺🇸 Inglês</option>
                                <option value="educacao_fisica">⚽ Educação Física</option>
                            </select>
                        </div>
                        
                        <div></div> <!-- Espaçador -->
                        
                        <button class="notes-add-btn" onclick="studentSystem.addNewNoteRow()" id="addNoteBtn">
                            ➕ Adicionar Avaliação
                        </button>
                    </div>
                    
                    <div id="subject-indicator-container"></div>
                    
                    <div class="notes-table-container">
                        <table class="notes-table">
                            <thead>
                                <tr>
                                    <th>👤 Aluno</th>
                                    <th>📚 Matéria</th>
                                    <th>📋 Tipo</th>
                                    <th>📝 Descrição</th>
                                    <th>📊 Nota</th>
                                    <th>📅 Data</th>
                                    <th>⚙️ Ações</th>
                                </tr>
                            </thead>
                            <tbody id="notes-table-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.notesModal = modal;

        // Event listeners do modal
        modal.querySelector('.notes-close').onclick = () => this.closeNotesModal();
        modal.onclick = (e) => {
            if (e.target === modal) this.closeNotesModal();
        };
    }

    // Inicialização do IndexedDB - Versão com suporte a matérias
    async initDB() {
        return new Promise(async(resolve, reject) => {
            try {
                if (this.db) {
                    this.db.close();
                }

                await new Promise(resolve => setTimeout(resolve, 100));

                const request = indexedDB.open(this.dbName, this.version);

                request.onerror = (event) => {
                    console.error('Erro ao abrir IndexedDB:', event.target.error);
                    reject(event.target.error);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    console.log('IndexedDB inicializado com sucesso');
                    setTimeout(() => resolve(), 50);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    console.log('Atualizando banco de dados para versão', this.version);

                    // Remover stores antigos se existirem
                    if (db.objectStoreNames.contains('students')) {
                        db.deleteObjectStore('students');
                    }
                    if (db.objectStoreNames.contains('notes')) {
                        db.deleteObjectStore('notes');
                    }

                    // Criar object store de estudantes
                    const studentsStore = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
                    studentsStore.createIndex('class', 'class', { unique: false });
                    studentsStore.createIndex('name', 'name', { unique: false });

                    // Criar object store de notas (com suporte a matérias)
                    const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
                    notesStore.createIndex('studentId', 'studentId', { unique: false });
                    notesStore.createIndex('class', 'class', { unique: false });
                    notesStore.createIndex('subject', 'subject', { unique: false }); // Novo índice para matérias
                    notesStore.createIndex('type', 'type', { unique: false });
                    notesStore.createIndex('date', 'date', { unique: false });
                    notesStore.createIndex('classSubject', ['class', 'subject'], { unique: false }); // Índice composto

                    console.log('Object stores criados com suporte a matérias');
                };

                request.onblocked = () => {
                    console.warn('IndexedDB bloqueado - tentando novamente...');
                    setTimeout(() => this.initDB().then(resolve).catch(reject), 1000);
                };

            } catch (error) {
                console.error('Erro na inicialização do IndexedDB:', error);
                reject(error);
            }
        });
    }

    // Inicialização da página da turma
    initClassPage() {
        this.currentClass = this.getClassFromURL();
        console.log('Turma atual:', this.currentClass);
        this.loadStudents();
        this.bindEvents();
        this.addNotesButton();
    }

    // Atualizado para incluir o botão de gráficos
    addNotesButton() {
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons && !document.getElementById('notesBtn')) {
            // Botão de Gráficos
            const graphicsBtn = document.createElement('button');
            graphicsBtn.id = 'graphicsBtn';
            graphicsBtn.className = 'btn-secondary btn-graphics';
            graphicsBtn.innerHTML = '📊 Gráficos';
            graphicsBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
            graphicsBtn.style.color = '#e0e0e0';
            graphicsBtn.style.marginRight = '10px';
            graphicsBtn.onclick = () => this.openGraphicsPage();

            // Botão de Notas
            const notesBtn = document.createElement('button');
            notesBtn.id = 'notesBtn';
            notesBtn.className = 'btn-secondary btn-notes';
            notesBtn.innerHTML = '📚 Notas por Matéria';
            notesBtn.style.background = 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)';
            notesBtn.style.color = '#e0e0e0';
            notesBtn.style.marginRight = '10px';
            notesBtn.onclick = () => this.openNotesModal();

            // Inserir antes do botão de gerar DOCX
            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn) {
                actionButtons.insertBefore(graphicsBtn, generateBtn);
                actionButtons.insertBefore(notesBtn, generateBtn);
            } else {
                actionButtons.appendChild(graphicsBtn);
                actionButtons.appendChild(notesBtn);
            }
        }
    }

    // Abrir página de gráficos
    openGraphicsPage() {
        // Verificar se há alunos com notas na turma
        this.checkStudentsWithNotes().then(hasNotes => {
            if (!hasNotes) {
                alert('📊 Ainda não há notas cadastradas nesta turma.\n\nCadastre algumas avaliações primeiro usando o botão "📚 Notas por Matéria".');
                return;
            }

            // Abrir nova aba com a página de gráficos
            const graphicsUrl = '../graficos/graficos.html';
            window.open(graphicsUrl, '_blank');
        });
    }

    // Verificar se há estudantes com notas na turma
    async checkStudentsWithNotes() {
        if (!this.db) return false;

        try {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            const index = store.index('class');
            const request = index.getAll(this.currentClass);

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const notes = request.result;
                    const hasValidNotes = notes.some(note => note.grade !== null && note.grade !== '');
                    resolve(hasValidNotes);
                };

                request.onerror = () => {
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('Erro ao verificar notas:', error);
            return false;
        }
    }

    // Adicionar botão de gráficos na página inicial (index.html)
    addGraphicsButtonToIndex() {
        // Procurar por um container de botões na página inicial
        const buttonsContainer = document.querySelector('.main-buttons') ||
            document.querySelector('.action-buttons') ||
            document.querySelector('.buttons-container') ||
            document.querySelector('.container');

        if (buttonsContainer && !document.getElementById('indexGraphicsBtn')) {
            const graphicsBtn = document.createElement('button');
            graphicsBtn.id = 'indexGraphicsBtn';
            graphicsBtn.className = 'main-btn graphics-btn';
            graphicsBtn.innerHTML = `
                <div class="btn-icon">📊</div>
                <div class="btn-text">
                    <h3>Gráficos de Evolução</h3>
                    <p>Visualize o progresso dos alunos</p>
                </div>
            `;

            // Estilos inline para compatibilidade
            graphicsBtn.style.cssText = `
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                border: none;
                border-radius: 15px;
                padding: 20px;
                margin: 10px;
                color: white;
                font-family: 'Segoe UI', sans-serif;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 15px;
                min-width: 250px;
                box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
            `;

            // Hover effect
            graphicsBtn.onmouseenter = () => {
                graphicsBtn.style.transform = 'translateY(-2px)';
                graphicsBtn.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4)';
            };

            graphicsBtn.onmouseleave = () => {
                graphicsBtn.style.transform = 'translateY(0)';
                graphicsBtn.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            };

            graphicsBtn.onclick = () => {
                window.open('graficos.html', '_blank');
            };

            buttonsContainer.appendChild(graphicsBtn);
        }
    }

    // Abrir modal de notas
    async openNotesModal() {
        if (!this.notesModal) return;

        this.notesModal.style.display = 'block';
        this.notesModal.classList.add('show');

        // Resetar filtro
        this.currentSubject = '';
        const subjectSelect = this.notesModal.querySelector('.subject-filter-select');
        if (subjectSelect) {
            subjectSelect.value = '';
        }

        await this.loadNotesData();
        this.updateNotesSummary();
        this.updateSubjectIndicator();
    }

    // Fechar modal de notas
    closeNotesModal() {
        if (!this.notesModal) return;

        this.notesModal.classList.remove('show');
        setTimeout(() => {
            this.notesModal.style.display = 'none';
        }, 300);
    }

    // Filtrar por matéria
    async filterBySubject(subjectId) {
        this.currentSubject = subjectId;
        await this.loadNotesData();
        this.updateNotesSummary();
        this.updateSubjectIndicator();

        // Atualizar estado do botão
        const addBtn = document.getElementById('addNoteBtn');
        if (addBtn) {
            if (subjectId) {
                addBtn.disabled = false;
                addBtn.textContent = `➕ Adicionar Avaliação (${this.getSubjectName(subjectId)})`;
            } else {
                addBtn.disabled = true;
                addBtn.textContent = `➕ Selecione uma matéria primeiro`;
            }
        }
    }

    // Obter nome da matéria
    getSubjectName(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        return subject ? subject.name : subjectId;
    }

    // Obter ícone da matéria
    getSubjectIcon(subjectId) {
        const icons = {
            'matematica': '🔢',
            'portugues': '📝',
            'geografia': '🗺️',
            'historia': '📜',
            'ciencias': '🔬',
            'ingles': '🇺🇸',
            'educacao_fisica': '⚽'
        };
        return icons[subjectId] || '📚';
    }

    // Atualizar indicador de matéria
    updateSubjectIndicator() {
        const container = document.getElementById('subject-indicator-container');
        if (!container) return;

        if (this.currentSubject) {
            const subjectName = this.getSubjectName(this.currentSubject);
            const subjectIcon = this.getSubjectIcon(this.currentSubject);

            container.innerHTML = `
                <div class="subject-indicator">
                    <span class="subject-icon">${subjectIcon}</span>
                    <span class="subject-name">Exibindo: ${subjectName}</span>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="subject-indicator">
                    <span class="subject-icon">📚</span>
                    <span class="subject-name">Exibindo: Todas as Matérias</span>
                </div>
            `;
        }
    }

    // Carregar dados de notas (atualizado com filtro de matérias)
    async loadNotesData() {
        if (!this.db) return;

        try {
            // Carregar estudantes
            const studentsTransaction = this.db.transaction(['students'], 'readonly');
            const studentsStore = studentsTransaction.objectStore('students');
            const studentsIndex = studentsStore.index('class');
            const studentsRequest = studentsIndex.getAll(this.currentClass);

            studentsRequest.onsuccess = async() => {
                const students = studentsRequest.result.filter(s => s.name);

                // Carregar notas (com ou sem filtro de matéria)
                const notesTransaction = this.db.transaction(['notes'], 'readonly');
                const notesStore = notesTransaction.objectStore('notes');

                let notesRequest;
                if (this.currentSubject) {
                    // Filtrar por turma E matéria
                    const classSubjectIndex = notesStore.index('classSubject');
                    notesRequest = classSubjectIndex.getAll([this.currentClass, this.currentSubject]);
                } else {
                    // Apenas por turma
                    const classIndex = notesStore.index('class');
                    notesRequest = classIndex.getAll(this.currentClass);
                }

                notesRequest.onsuccess = () => {
                    const notes = notesRequest.result;
                    this.displayNotesTable(students, notes);
                };
            };
        } catch (error) {
            console.error('Erro ao carregar dados de notas:', error);
        }
    }

    // Exibir tabela de notas (atualizado para matérias)
    displayNotesTable(students, notes) {
        const tbody = document.getElementById('notes-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-notes-message">
                        ❌ Nenhum aluno cadastrado nesta turma.<br>
                        Cadastre alunos primeiro na aba principal.
                    </td>
                </tr>
            `;
            return;
        }

        // Se uma matéria específica foi selecionada, mostrar apenas notas dessa matéria
        if (this.currentSubject && notes.length === 0) {
            // Criar linhas vazias para cada aluno na matéria selecionada
            students.forEach(student => {
                const row = this.createNoteRow(student, {
                    id: null,
                    studentId: student.id,
                    subject: this.currentSubject,
                    type: '',
                    description: '',
                    grade: '',
                    weight: 1,
                    date: new Date().toISOString().split('T')[0],
                    class: this.currentClass
                });
                tbody.appendChild(row);
            });
            return;
        }

        if (this.currentSubject) {
            // Mostrar apenas notas da matéria selecionada
            const notesByStudent = {};
            notes.forEach(note => {
                if (!notesByStudent[note.studentId]) {
                    notesByStudent[note.studentId] = [];
                }
                notesByStudent[note.studentId].push(note);
            });

            students.forEach(student => {
                const studentNotes = notesByStudent[student.id] || [];

                if (studentNotes.length === 0) {
                    // Linha vazia para aluno sem notas na matéria
                    const row = this.createNoteRow(student, {
                        id: null,
                        studentId: student.id,
                        subject: this.currentSubject,
                        type: '',
                        description: '',
                        grade: '',
                        weight: 1,
                        date: new Date().toISOString().split('T')[0],
                        class: this.currentClass
                    });
                    tbody.appendChild(row);
                } else {
                    // Linhas com notas existentes da matéria
                    studentNotes.forEach(note => {
                        const row = this.createNoteRow(student, note);
                        tbody.appendChild(row);
                    });
                }
            });
        } else {
            // Mostrar todas as notas de todas as matérias
            if (notes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-notes-message">
                            📝 Nenhuma avaliação cadastrada ainda.<br>
                            Selecione uma matéria e comece a adicionar avaliações.
                        </td>
                    </tr>
                `;
                return;
            }

            // Agrupar notas por aluno e depois por matéria
            const notesByStudent = {};
            notes.forEach(note => {
                if (!notesByStudent[note.studentId]) {
                    notesByStudent[note.studentId] = {};
                }
                if (!notesByStudent[note.studentId][note.subject]) {
                    notesByStudent[note.studentId][note.subject] = [];
                }
                notesByStudent[note.studentId][note.subject].push(note);
            });

            // Criar linhas agrupadas por matéria
            this.subjects.forEach(subject => {
                let hasNotesInSubject = false;

                // Verificar se há notas nesta matéria
                students.forEach(student => {
                    if (notesByStudent[student.id] && notesByStudent[student.id][subject.id]) {
                        hasNotesInSubject = true;
                    }
                });

                if (hasNotesInSubject) {
                    // Cabeçalho da matéria
                    const headerRow = document.createElement('tr');
                    headerRow.style.background = 'rgba(251, 192, 45, 0.2)';
                    headerRow.style.fontWeight = 'bold';
                    headerRow.innerHTML = `
                        <td colspan="7" style="text-align: center; padding: 15px; color: #fbc02d; font-size: 16px;">
                            ${this.getSubjectIcon(subject.id)} ${subject.name}
                        </td>
                    `;
                    tbody.appendChild(headerRow);

                    // Notas dos alunos nesta matéria
                    students.forEach(student => {
                        const studentSubjectNotes = notesByStudent[student.id] && notesByStudent[student.id][subject.id] ? notesByStudent[student.id][subject.id] : [];

                        studentSubjectNotes.forEach(note => {
                            const row = this.createNoteRow(student, note);
                            tbody.appendChild(row);
                        });
                    });
                }
            });
        }
    }

    // Criar linha de nota (atualizado com coluna de matéria)
    createNoteRow(student, note) {
        const row = document.createElement('tr');
        const rowId = note.id || `temp_${Date.now()}_${Math.random()}`;

        row.dataset.noteId = note.id || '';
        row.dataset.studentId = student.id;
        row.id = `note_row_${rowId}`;

        // Opções de tipo de avaliação
        const typeOptions = `
            <option value="" ${!note.type ? 'selected' : ''}>Selecionar</option>
            <option value="prova" ${note.type === 'prova' ? 'selected' : ''}>Prova</option>
            <option value="trabalho" ${note.type === 'trabalho' ? 'selected' : ''}>Trabalho</option>
            <option value="participacao" ${note.type === 'participacao' ? 'selected' : ''}>Participação</option>
            <option value="outros" ${note.type === 'outros' ? 'selected' : ''}>Outros</option>
        `;

        // Opções de matérias
        let subjectOptions = '';
        if (this.currentSubject) {
            // Se uma matéria está selecionada, mostrar apenas ela
            const subjectName = this.getSubjectName(this.currentSubject);
            subjectOptions = `<div class="subject-display">${this.getSubjectIcon(this.currentSubject)} ${subjectName}</div>`;
        } else {
            // Mostrar dropdown com todas as matérias
            subjectOptions = '<select onchange="studentSystem.markNoteRowEditing(\'' + rowId + '\')">';
            subjectOptions += '<option value="">Selecionar Matéria</option>';
            this.subjects.forEach(subject => {
                const selected = note.subject === subject.id ? 'selected' : '';
                subjectOptions += `<option value="${subject.id}" ${selected}>${this.getSubjectIcon(subject.id)} ${subject.name}</option>`;
            });
            subjectOptions += '</select>';
        }

        row.innerHTML = `
            <td class="student-name">${student.name}</td>
            <td>${subjectOptions}</td>
            <td>
                <select onchange="studentSystem.markNoteRowEditing('${rowId}')">${typeOptions}</select>
            </td>
            <td>
                <input type="text" value="${note.description || ''}" placeholder="Descrição da avaliação"
                       onchange="studentSystem.markNoteRowEditing('${rowId}')">
            </td>
            <td>
                <input type="number" class="grade-input" step="0.1" min="0" max="10" 
                       value="${note.grade || ''}" placeholder="0.0"
                       onchange="studentSystem.markNoteRowEditing('${rowId}')">
            </td>
            <td>
                <input type="date" value="${note.date || ''}" 
                       onchange="studentSystem.markNoteRowEditing('${rowId}')">
            </td>
            <td class="notes-actions">
                <button class="btn-note-save" onclick="studentSystem.saveNote('${rowId}')">Salvar</button>
                <button class="btn-note-delete" onclick="studentSystem.deleteNote('${rowId}')" 
                        style="display: ${note.id ? 'inline-block' : 'none'};">Excluir</button>
            </td>
        `;

        return row;
    }

    // Marcar linha de nota como editando
    markNoteRowEditing(rowId) {
        const row = document.getElementById(`note_row_${rowId}`);
        if (row) {
            row.classList.add('editing');
        }
    }

    // Adicionar nova linha de nota (atualizado para matérias)
    addNewNoteRow() {
        if (!this.currentSubject) {
            alert('🚨 Selecione uma matéria primeiro para adicionar uma avaliação.');
            return;
        }

        const tbody = document.getElementById('notes-table-body');
        if (!tbody) return;

        // Verificar se há alunos
        const studentsTransaction = this.db.transaction(['students'], 'readonly');
        const studentsStore = studentsTransaction.objectStore('students');
        const studentsIndex = studentsStore.index('class');
        const studentsRequest = studentsIndex.getAll(this.currentClass);

        studentsRequest.onsuccess = () => {
            const students = studentsRequest.result.filter(s => s.name);

            if (students.length === 0) {
                alert('❌ Cadastre alunos primeiro na aba principal.');
                return;
            }

            // Pegar primeiro aluno como exemplo para nova linha
            const firstStudent = students[0];

            const newNote = {
                id: null,
                studentId: firstStudent.id,
                subject: this.currentSubject,
                type: '',
                description: '',
                grade: '',
                weight: 1,
                date: new Date().toISOString().split('T')[0],
                class: this.currentClass
            };

            const newRow = this.createNoteRow(firstStudent, newNote);
            tbody.appendChild(newRow);

            // Scroll para a nova linha
            newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Marcar como editando
            newRow.classList.add('editing');
        };
    }

    // Salvar nota (atualizado com validação de matéria)
    async saveNote(rowId) {
        const row = document.getElementById(`note_row_${rowId}`);
        if (!row) return;

        const noteData = this.extractNoteData(row);

        if (!noteData.subject) {
            alert('🚨 Selecione a matéria da avaliação.');
            return;
        }

        if (!noteData.type) {
            alert('🚨 Selecione o tipo da avaliação.');
            return;
        }

        if (noteData.grade !== null && (noteData.grade < 0 || noteData.grade > 10)) {
            alert('🚨 A nota deve estar entre 0 e 10.');
            return;
        }

        try {
            const savedId = await this.saveNoteToIndexedDB(noteData);
            console.log('Nota salva com ID:', savedId);

            // Atualizar a linha
            row.dataset.noteId = savedId;
            row.id = `note_row_${savedId}`;

            // Mostrar botão excluir
            const deleteBtn = row.querySelector('.btn-note-delete');
            deleteBtn.style.display = 'inline-block';

            row.classList.remove('editing');

            // Atualizar média do aluno
            await this.updateStudentSubjectGrades(noteData.studentId, noteData.subject);

            this.updateNotesSummary();
            this.showSuccessMessage('✅ Nota salva com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar nota:', error);
            alert('❌ Erro ao salvar nota: ' + error.message);
        }
    }

    // Extrair dados da nota (atualizado com matéria)
    extractNoteData(row) {
        const inputs = row.querySelectorAll('input, select');
        const noteId = row.dataset.noteId;
        const studentId = parseInt(row.dataset.studentId);

        let subjectValue;
        const subjectElement = row.querySelector('td:nth-child(2)');

        if (this.currentSubject) {
            // Matéria fixa selecionada no filtro
            subjectValue = this.currentSubject;
        } else {
            // Dropdown de matéria
            const subjectSelect = subjectElement.querySelector('select');
            subjectValue = subjectSelect ? subjectSelect.value : '';
        }

        return {
            id: noteId && noteId !== '' ? parseInt(noteId) : undefined,
            studentId: studentId,
            class: this.currentClass,
            subject: subjectValue,
            type: inputs[this.currentSubject ? 0 : 1].value, // Ajustar índice baseado na presença do select de matéria
            description: inputs[this.currentSubject ? 1 : 2].value.trim(),
            grade: inputs[this.currentSubject ? 2 : 3].value ? parseFloat(inputs[this.currentSubject ? 2 : 3].value) : null,
            weight: 1,
            date: inputs[this.currentSubject ? 3 : 4].value
        };
    }

    // Salvar nota no IndexedDB (mesmo método anterior)
    async saveNoteToIndexedDB(noteData) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!this.db) {
                    await this.initDB();
                    if (!this.db) {
                        reject(new Error('Banco de dados não disponível'));
                        return;
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 50));

                const transaction = this.db.transaction(['notes'], 'readwrite');
                const store = transaction.objectStore('notes');

                let request;
                if (noteData.id) {
                    request = store.put(noteData);
                } else {
                    const dataToSave = {...noteData };
                    delete dataToSave.id;
                    request = store.add(dataToSave);
                }

                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject(event.target.error);
                transaction.onerror = (event) => reject(event.target.error);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Atualizar médias do aluno por matéria
    async updateStudentSubjectGrades(studentId, subjectId) {
        try {
            // Buscar todas as notas do aluno nesta matéria
            const notesTransaction = this.db.transaction(['notes'], 'readonly');
            const notesStore = notesTransaction.objectStore('notes');
            const notesIndex = notesStore.index('studentId');
            const notesRequest = notesIndex.getAll(studentId);

            notesRequest.onsuccess = async() => {
                const allNotes = notesRequest.result;
                const subjectNotes = allNotes.filter(n => n.subject === subjectId && n.grade !== null && n.grade !== '');

                if (subjectNotes.length === 0) return;

                // Calcular média da matéria
                const totalGrades = subjectNotes.reduce((sum, note) => sum + parseFloat(note.grade), 0);
                const averageGrade = (totalGrades / subjectNotes.length).toFixed(1);

                console.log(`Média de ${this.getSubjectName(subjectId)} para aluno ${studentId}: ${averageGrade}`);

                // Calcular média geral do aluno (média de todas as matérias)
                const gradesBySubject = {};
                allNotes.forEach(note => {
                    if (note.grade !== null && note.grade !== '') {
                        if (!gradesBySubject[note.subject]) {
                            gradesBySubject[note.subject] = [];
                        }
                        gradesBySubject[note.subject].push(parseFloat(note.grade));
                    }
                });

                const subjectAverages = [];
                Object.keys(gradesBySubject).forEach(subject => {
                    const grades = gradesBySubject[subject];
                    const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
                    subjectAverages.push(avg);
                });

                const overallAverage = subjectAverages.length > 0 ?
                    (subjectAverages.reduce((a, b) => a + b, 0) / subjectAverages.length).toFixed(1) : 0;

                // Atualizar dados do aluno
                const studentTransaction = this.db.transaction(['students'], 'readwrite');
                const studentStore = studentTransaction.objectStore('students');
                const studentRequest = studentStore.get(studentId);

                studentRequest.onsuccess = () => {
                    const student = studentRequest.result;
                    if (student) {
                        student.grade = overallAverage;
                        // Manter dados de matérias específicas se necessário
                        if (!student.subjectGrades) student.subjectGrades = {};
                        student.subjectGrades[subjectId] = averageGrade;

                        studentStore.put(student);
                    }
                };
            };
        } catch (error) {
            console.error('Erro ao atualizar média da matéria:', error);
        }
    }

    // Excluir nota (atualizado com recálculo de médias)
    async deleteNote(rowId) {
        const row = document.getElementById(`note_row_${rowId}`);
        if (!row) return;

        const noteId = row.dataset.noteId;
        const studentId = parseInt(row.dataset.studentId);

        if (!noteId || noteId === '') {
            row.remove();
            return;
        }

        if (!confirm('🗑️ Tem certeza que deseja excluir esta avaliação?')) {
            return;
        }

        try {
            if (!this.db) {
                await this.initDB();
                if (!this.db) {
                    alert('❌ Erro: banco de dados não disponível.');
                    return;
                }
            }

            // Buscar dados da nota antes de excluir para recalcular médias
            const getTransaction = this.db.transaction(['notes'], 'readonly');
            const getStore = getTransaction.objectStore('notes');
            const getRequest = getStore.get(parseInt(noteId));

            getRequest.onsuccess = async() => {
                const noteToDelete = getRequest.result;
                const subjectToUpdate = noteToDelete ? noteToDelete.subject : null;

                // Excluir nota
                const deleteTransaction = this.db.transaction(['notes'], 'readwrite');
                const deleteStore = deleteTransaction.objectStore('notes');
                const deleteRequest = deleteStore.delete(parseInt(noteId));

                deleteRequest.onsuccess = async() => {
                    row.remove();

                    // Recalcular médias se necessário
                    if (subjectToUpdate) {
                        await this.updateStudentSubjectGrades(studentId, subjectToUpdate);
                    }

                    this.updateNotesSummary();
                    this.showSuccessMessage('✅ Avaliação excluída com sucesso!');
                };

                deleteRequest.onerror = (event) => {
                    console.error('Erro ao excluir nota:', event.target.error);
                    alert('❌ Erro ao excluir avaliação.');
                };
            };

        } catch (error) {
            console.error('Erro ao excluir nota:', error);
            alert('❌ Erro ao excluir avaliação: ' + error.message);
        }
    }

    // Atualizar resumo das notas (atualizado para matérias)
    async updateNotesSummary() {
        if (!this.db) return;

        try {
            let notesRequest;
            const notesTransaction = this.db.transaction(['notes'], 'readonly');
            const notesStore = notesTransaction.objectStore('notes');

            if (this.currentSubject) {
                // Filtrar por turma E matéria específica
                const classSubjectIndex = notesStore.index('classSubject');
                notesRequest = classSubjectIndex.getAll([this.currentClass, this.currentSubject]);
            } else {
                // Todas as matérias da turma
                const classIndex = notesStore.index('class');
                notesRequest = classIndex.getAll(this.currentClass);
            }

            notesRequest.onsuccess = async() => {
                const notes = notesRequest.result;

                // Buscar estudantes da turma
                const studentsTransaction = this.db.transaction(['students'], 'readonly');
                const studentsStore = studentsTransaction.objectStore('students');
                const studentsIndex = studentsStore.index('class');
                const studentsRequest = studentsIndex.getAll(this.currentClass);

                studentsRequest.onsuccess = () => {
                    const students = studentsRequest.result.filter(s => s.name);
                    this.calculateAndDisplaySummary(students, notes);
                };
            };
        } catch (error) {
            console.error('Erro ao atualizar resumo:', error);
        }
    }

    // Calcular e exibir resumo (atualizado para matérias)
    calculateAndDisplaySummary(students, notes) {
        const classAverageEl = document.getElementById('class-average');
        const studentsWithGradesEl = document.getElementById('students-with-grades');
        const totalAssessmentsEl = document.getElementById('total-assessments');

        if (!classAverageEl || !studentsWithGradesEl || !totalAssessmentsEl) return;

        // Calcular estatísticas
        const validNotes = notes.filter(n => n.grade !== null && n.grade !== '');
        const totalAssessments = validNotes.length;

        let totalGrades = 0;
        let studentsWithGrades = 0;

        if (this.currentSubject) {
            // Estatísticas para matéria específica
            const studentGrades = {};

            validNotes.forEach(note => {
                if (!studentGrades[note.studentId]) {
                    studentGrades[note.studentId] = [];
                }
                studentGrades[note.studentId].push(parseFloat(note.grade));
            });

            // Calcular média por aluno na matéria
            Object.keys(studentGrades).forEach(studentId => {
                const grades = studentGrades[studentId];
                const average = grades.reduce((a, b) => a + b, 0) / grades.length;
                totalGrades += average;
                studentsWithGrades++;
            });

        } else {
            // Estatísticas gerais (todas as matérias)
            const studentSubjectGrades = {};

            validNotes.forEach(note => {
                if (!studentSubjectGrades[note.studentId]) {
                    studentSubjectGrades[note.studentId] = {};
                }
                if (!studentSubjectGrades[note.studentId][note.subject]) {
                    studentSubjectGrades[note.studentId][note.subject] = [];
                }
                studentSubjectGrades[note.studentId][note.subject].push(parseFloat(note.grade));
            });

            // Calcular média geral por aluno (média de todas as matérias)
            Object.keys(studentSubjectGrades).forEach(studentId => {
                const subjects = studentSubjectGrades[studentId];
                const subjectAverages = [];

                Object.keys(subjects).forEach(subject => {
                    const grades = subjects[subject];
                    const subjectAvg = grades.reduce((a, b) => a + b, 0) / grades.length;
                    subjectAverages.push(subjectAvg);
                });

                if (subjectAverages.length > 0) {
                    const studentAverage = subjectAverages.reduce((a, b) => a + b, 0) / subjectAverages.length;
                    totalGrades += studentAverage;
                    studentsWithGrades++;
                }
            });
        }

        // Exibir resultados
        const classAverage = studentsWithGrades > 0 ? (totalGrades / studentsWithGrades).toFixed(1) : '0.0';

        classAverageEl.textContent = classAverage;
        studentsWithGradesEl.textContent = `${studentsWithGrades}/${students.length}`;
        totalAssessmentsEl.textContent = totalAssessments.toString();

        // Colorir média da turma
        const avgValue = parseFloat(classAverage);
        if (avgValue >= 7) {
            classAverageEl.style.color = '#43a047'; // Verde
        } else if (avgValue >= 5) {
            classAverageEl.style.color = '#fbc02d'; // Amarelo
        } else {
            classAverageEl.style.color = '#e53935'; // Vermelho
        }
    }

    // Extrair nome da turma da URL
    getClassFromURL() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename.replace('.html', '').replace('turma-', '');
    }

    // Criar linhas vazias para novos alunos
    createEmptyRows() {
        const tbody = document.querySelector('.students-table tbody');
        const existingRows = tbody.querySelectorAll('tr').length;
        const rowsToAdd = Math.max(0, 30 - existingRows);

        for (let i = 0; i < rowsToAdd; i++) {
            const tempId = `temp_${this.nextTempId++}`;
            const row = this.createStudentRow({
                id: null,
                tempId: tempId,
                name: '',
                grade: '',
                absences: '',
                description: '',
                disability: '',
                photo: null
            });
            tbody.appendChild(row);
        }
    }

    // Criar linha de estudante (sem colunas Nota e Faltas)
    createStudentRow(student) {
            const row = document.createElement('tr');
            const rowId = student.id || student.tempId;

            row.dataset.studentId = student.id || '';
            row.dataset.tempId = student.tempId || '';
            row.id = `row_${rowId}`;

            row.innerHTML = `
            <td>
                ${student.photo ? 
                    `<img src="${student.photo}" alt="Foto do aluno" class="student-photo" onclick="studentSystem.changePhoto('${rowId}')">` :
                    `<div class="photo-placeholder" onclick="studentSystem.changePhoto('${rowId}')">Adicionar<br>Foto</div>`
                }
                <input type="file" class="file-input" accept="image/*" onchange="studentSystem.handlePhotoUpload(event, '${rowId}')">
            </td>
            <td>
                <div class="editable-name" onclick="studentSystem.editName('${rowId}')">${student.name || 'Clique para adicionar nome'}</div>
            </td>
            <td>
                <textarea placeholder="Clique para adicionar descrição" 
                         onchange="studentSystem.updateField('${rowId}', 'description', this.value)">${student.description || ''}</textarea>
            </td>
            <td>
                <input type="text" value="${student.disability || ''}" 
                       onchange="studentSystem.updateField('${rowId}', 'disability', this.value)"
                       placeholder="Especificar deficiência">
            </td>
            <td class="actions-cell">
                <button class="btn-save" onclick="studentSystem.saveStudent('${rowId}')">Salvar</button>
                <button class="btn-delete" onclick="studentSystem.deleteStudent('${rowId}')" style="display: ${student.id ? 'inline-block' : 'none'};">Excluir</button>
            </td>
        `;

        return row;
    }

    // Encontrar linha por ID
    findRow(rowId) {
        return document.getElementById(`row_${rowId}`);
    }

    // Carregar estudantes do IndexedDB
    async loadStudents() {
        if (!this.db) {
            console.warn('Database não inicializado, tentando novamente...');
            await this.initDB();
            if (!this.db) return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 50));

            const transaction = this.db.transaction(['students'], 'readonly');
            const store = transaction.objectStore('students');
            const index = store.index('class');
            
            const request = index.getAll(this.currentClass);

            request.onsuccess = () => {
                const students = request.result || [];
                console.log(`Alunos carregados para turma ${this.currentClass}:`, students.length);
                this.displayStudents(students);
            };

            request.onerror = (event) => {
                console.error('Erro ao carregar alunos:', event.target.error);
                this.displayStudents([]);
            };

            transaction.onerror = (event) => {
                console.error('Erro na transação de carregamento:', event.target.error);
                this.displayStudents([]);
            };

        } catch (error) {
            console.error('Erro ao acessar IndexedDB:', error);
            this.displayStudents([]);
        }
    }

    // Exibir estudantes na tabela
    displayStudents(students) {
        const tbody = document.querySelector('.students-table tbody');
        tbody.innerHTML = '';

        students.forEach((student) => {
            const row = this.createStudentRow(student);
            tbody.appendChild(row);
        });

        this.createEmptyRows();
    }

    // Vincular eventos
    bindEvents() {
        const sortBtn = document.getElementById('sortBtn');
        if (sortBtn) {
            sortBtn.addEventListener('click', () => this.sortStudents());
        }

        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateDocument());
        }
    }

    // Alterar foto
    changePhoto(rowId) {
        const row = this.findRow(rowId);
        if (!row) return;
        const fileInput = row.querySelector('.file-input');
        fileInput.click();
    }

    // Manipular upload de foto
    async handlePhotoUpload(event, rowId) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const photoData = e.target.result;
            this.updatePhoto(rowId, photoData);
            this.markRowAsEditing(rowId);
        };
        reader.readAsDataURL(file);
    }

    // Atualizar foto na interface
    updatePhoto(rowId, photoData) {
        const row = this.findRow(rowId);
        if (!row) return;
        const photoCell = row.querySelector('td:first-child');
        photoCell.innerHTML = `
            <img src="${photoData}" alt="Foto do aluno" class="student-photo" onclick="studentSystem.changePhoto('${rowId}')">
            <input type="file" class="file-input" accept="image/*" onchange="studentSystem.handlePhotoUpload(event, '${rowId}')">
        `;
    }

    // Editar nome
    editName(rowId) {
        const row = this.findRow(rowId);
        if (!row) return;
        const nameDiv = row.querySelector('.editable-name');
        const currentName = nameDiv.textContent === 'Clique para adicionar nome' ? '' : nameDiv.textContent;

        const container = document.createElement('div');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.placeholder = 'Digite o nome do aluno';
        input.style.width = '100%';
        input.style.marginBottom = '5px';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'OK';
        saveBtn.className = 'btn-save';
        saveBtn.style.fontSize = '10px';
        saveBtn.style.padding = '4px 8px';

        container.appendChild(input);
        container.appendChild(saveBtn);
        
        nameDiv.innerHTML = '';
        nameDiv.appendChild(container);

        input.focus();
        this.markRowAsEditing(rowId);

        const saveName = () => {
            const newName = input.value.trim();
            nameDiv.innerHTML = newName || 'Clique para adicionar nome';
            nameDiv.onclick = () => this.editName(rowId);
            if (newName) {
                this.updateField(rowId, 'name', newName);
            }
        };

        saveBtn.addEventListener('click', saveName);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveName();
        });
    }

    // Atualizar campo
    updateField(rowId, field, value) {
        const row = this.findRow(rowId);
        if (!row) return;
        row.dataset[field] = value;
        this.markRowAsEditing(rowId);
    }

    // Marcar linha como sendo editada
    markRowAsEditing(rowId) {
        const row = this.findRow(rowId);
        if (!row) return;
        row.classList.add('editing');
    }

    // Salvar estudante
    async saveStudent(rowId) {
        console.log('Salvando aluno:', rowId);
        const row = this.findRow(rowId);
        if (!row) {
            console.error('Linha não encontrada:', rowId);
            return;
        }

        const studentData = this.extractStudentData(row);
        
        if (!studentData.name) {
            alert('O nome do aluno é obrigatório.');
            return;
        }

        try {
            const savedId = await this.saveToIndexedDB(studentData);
            console.log('Aluno salvo com ID:', savedId);
            
            row.dataset.studentId = savedId;
            row.id = `row_${savedId}`;
            
            const deleteBtn = row.querySelector('.btn-delete');
            deleteBtn.style.display = 'inline-block';
            deleteBtn.onclick = () => this.deleteStudent(savedId);
            
            row.classList.remove('editing');
            this.showSuccessMessage('✅ Aluno salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('❌ Erro ao salvar aluno.');
        }
    }

    // Extrair dados do estudante da linha
    extractStudentData(row) {
        const nameDiv = row.querySelector('.editable-name');
        let name = '';
        
        const input = nameDiv.querySelector('input');
        if (input) {
            name = input.value.trim();
        } else {
            name = nameDiv.textContent === 'Clique para adicionar nome' ? '' : nameDiv.textContent.trim();
        }

        const description = row.querySelector('textarea').value;
        const disability = row.querySelector('input[type="text"]').value;
        const photoImg = row.querySelector('.student-photo');
        const photo = photoImg ? photoImg.src : null;
        const id = row.dataset.studentId;

        return {
            id: id && id !== '' ? parseInt(id) : undefined,
            class: this.currentClass,
            name: name,
            grade: null,
            absences: null,
            description: description.trim(),
            disability: disability.trim(),
            photo: photo,
            subjectGrades: {} // Inicializar objeto para notas por matéria
        };
    }

    // Salvar no IndexedDB
    async saveToIndexedDB(studentData) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.db) {
                    console.warn('Database não disponível, reinicializando...');
                    await this.initDB();
                    if (!this.db) {
                        reject(new Error('Não foi possível inicializar o banco de dados'));
                        return;
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 50));

                const transaction = this.db.transaction(['students'], 'readwrite');
                const store = transaction.objectStore('students');
                
                let request;
                if (studentData.id) {
                    console.log('Atualizando aluno ID:', studentData.id);
                    request = store.put(studentData);
                } else {
                    console.log('Criando novo aluno');
                    const dataToSave = { ...studentData };
                    delete dataToSave.id;
                    request = store.add(dataToSave);
                }

                request.onsuccess = () => {
                    console.log('Aluno salvo com sucesso. ID:', request.result);
                    resolve(request.result);
                };

                request.onerror = (event) => {
                    console.error('Erro ao salvar no IndexedDB:', event.target.error);
                    reject(event.target.error);
                };

                transaction.onerror = (event) => {
                    console.error('Erro na transação de salvamento:', event.target.error);
                    reject(event.target.error);
                };

                transaction.onabort = (event) => {
                    console.error('Transação abortada:', event.target.error);
                    reject(new Error('Transação abortada'));
                };

            } catch (error) {
                console.error('Erro geral ao salvar:', error);
                reject(error);
            }
        });
    }

    // Deletar estudante
    async deleteStudent(rowId) {
        console.log('Tentando excluir aluno:', rowId);
        const row = this.findRow(rowId);
        if (!row) {
            console.error('Linha não encontrada para exclusão:', rowId);
            return;
        }

        const studentId = row.dataset.studentId;
        
        if (!studentId || studentId === '') {
            console.log('Removendo linha temporária');
            row.remove();
            return;
        }

        if (!confirm('🗑️ Tem certeza que deseja excluir este aluno? Todas as notas também serão excluídas.')) {
            return;
        }

        try {
            if (!this.db) {
                console.warn('Database não disponível para exclusão, reinicializando...');
                await this.initDB();
                if (!this.db) {
                    alert('❌ Erro: banco de dados não disponível.');
                    return;
                }
            }

            console.log('Excluindo do banco ID:', studentId);
            
            await new Promise(resolve => setTimeout(resolve, 50));

            // Excluir aluno e suas notas
            await new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['students', 'notes'], 'readwrite');
                
                // Excluir aluno
                const studentsStore = transaction.objectStore('students');
                const deleteStudentRequest = studentsStore.delete(parseInt(studentId));

                // Excluir notas do aluno
                const notesStore = transaction.objectStore('notes');
                const notesIndex = notesStore.index('studentId');
                const notesRequest = notesIndex.getAll(parseInt(studentId));

                notesRequest.onsuccess = () => {
                    const notes = notesRequest.result;
                    notes.forEach(note => {
                        notesStore.delete(note.id);
                    });
                };

                transaction.oncomplete = () => {
                    console.log('Aluno e notas excluídos com sucesso');
                    resolve();
                };

                transaction.onerror = (event) => {
                    console.error('Erro na transação de exclusão:', event.target.error);
                    reject(event.target.error);
                };
            });

            row.remove();
            this.showSuccessMessage('✅ Aluno excluído com sucesso!');

        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('❌ Erro ao excluir aluno: ' + error.message);
        }
    }

    // Ordenar estudantes
    async sortStudents() {
        if (!this.db) return;

        const transaction = this.db.transaction(['students'], 'readonly');
        const store = transaction.objectStore('students');
        const index = store.index('class');
        const request = index.getAll(this.currentClass);

        request.onsuccess = () => {
            const students = request.result;
            students.sort((a, b) => {
                if (!a.name && !b.name) return 0;
                if (!a.name) return 1;
                if (!b.name) return -1;
                return a.name.localeCompare(b.name, 'pt-BR');
            });
            this.displayStudents(students);
        };
    }

    // Converter foto base64 para buffer para o DOCX
    base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64.split(',')[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    // Gerar documento DOCX com relatório de notas por matéria
    async generateDocument() {
        if (!this.db) return;

        const studentsTransaction = this.db.transaction(['students', 'notes'], 'readonly');
        const studentsStore = studentsTransaction.objectStore('students');
        const studentsIndex = studentsStore.index('class');
        const studentsRequest = studentsIndex.getAll(this.currentClass);

        studentsRequest.onsuccess = () => {
            const students = studentsRequest.result.filter(student => student.name);
            if (students.length === 0) {
                alert('❌ Não há alunos cadastrados nesta turma.');
                return;
            }

            // Buscar todas as notas da turma
            const notesStore = studentsTransaction.objectStore('notes');
            const notesIndex = notesStore.index('class');
            const notesRequest = notesIndex.getAll(this.currentClass);

            notesRequest.onsuccess = () => {
                const notes = notesRequest.result;
                this.generateDocumentWithNotes(students, notes);
            };
        };
    }

    // Gerar documento DOCX com notas por matéria
    generateDocumentWithNotes(students, notes) {
        const documentChildren = [
            new docx.Paragraph({
                text: `📚 Relatório Completo da Turma ${this.currentClass}`,
                heading: docx.HeadingLevel.HEADING_1,
                alignment: docx.AlignmentType.CENTER
            }),
            new docx.Paragraph({
                text: `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
                alignment: docx.AlignmentType.CENTER,
                spacing: { after: 600 }
            })
        ];

        // Agrupar notas por aluno e matéria
        const notesByStudent = {};
        notes.forEach(note => {
            if (!notesByStudent[note.studentId]) {
                notesByStudent[note.studentId] = {};
            }
            if (!notesByStudent[note.studentId][note.subject]) {
                notesByStudent[note.studentId][note.subject] = [];
            }
            notesByStudent[note.studentId][note.subject].push(note);
        });

        students.forEach((student, index) => {
            // Foto do aluno
            if (student.photo && student.photo.startsWith('data:image/')) {
                try {
                    const imageBuffer = this.base64ToArrayBuffer(student.photo);
                    documentChildren.push(
                        new docx.Paragraph({
                            children: [
                                new docx.ImageRun({
                                    data: imageBuffer,
                                    transformation: {
                                        width: 150,
                                        height: 150,
                                    },
                                })
                            ],
                            alignment: docx.AlignmentType.CENTER,
                            spacing: { after: 200 }
                        })
                    );
                } catch (error) {
                    console.error('Erro ao processar imagem:', error);
                }
            }

            // Nome do aluno
            documentChildren.push(
                new docx.Paragraph({
                    text: `👤 ${student.name}`,
                    heading: docx.HeadingLevel.HEADING_2,
                    alignment: docx.AlignmentType.CENTER,
                    spacing: { after: 200 }
                })
            );

            // Descrição
            if (student.description && student.description.trim()) {
                documentChildren.push(
                    new docx.Paragraph({
                        text: `📝 Descrição: ${student.description.trim()}`,
                        spacing: { after: 100 }
                    })
                );
            }

            // Deficiência
            if (student.disability && student.disability.trim()) {
                documentChildren.push(
                    new docx.Paragraph({
                        text: `♿ Deficiência: ${student.disability.trim()}`,
                        spacing: { after: 200 }
                    })
                );
            }

            // Notas por matéria
            const studentNotes = notesByStudent[student.id];
            if (studentNotes) {
                documentChildren.push(
                    new docx.Paragraph({
                        text: `📊 Desempenho Acadêmico:`,
                        heading: docx.HeadingLevel.HEADING_3,
                        spacing: { after: 100 }
                    })
                );

                this.subjects.forEach(subject => {
                    const subjectNotes = studentNotes[subject.id];
                    if (subjectNotes && subjectNotes.length > 0) {
                        const validGrades = subjectNotes.filter(n => n.grade !== null && n.grade !== '');
                        
                        if (validGrades.length > 0) {
                            const average = validGrades.reduce((sum, n) => sum + parseFloat(n.grade), 0) / validGrades.length;
                            
                            documentChildren.push(
                                new docx.Paragraph({
                                    text: `${this.getSubjectIcon(subject.id)} ${subject.name}: ${average.toFixed(1)} (${validGrades.length} avaliações)`,
                                    spacing: { after: 50 }
                                })
                            );

                            // Detalhes das avaliações
                            validGrades.forEach(note => {
                                let noteDetail = `   • ${note.type || 'Avaliação'}`;
                                if (note.description) noteDetail += `: ${note.description}`;
                                noteDetail += ` - Nota: ${note.grade}`;
                                if (note.date) noteDetail += ` (${new Date(note.date).toLocaleDateString('pt-BR')})`;

                                documentChildren.push(
                                    new docx.Paragraph({
                                        text: noteDetail,
                                        spacing: { after: 25 }
                                    })
                                );
                            });
                        }
                    }
                });
            } else {
                documentChildren.push(
                    new docx.Paragraph({
                        text: `📊 Nenhuma avaliação registrada ainda.`,
                        spacing: { after: 200 }
                    })
                );
            }

            // Separador entre alunos
            if (index < students.length - 1) {
                documentChildren.push(
                    new docx.Paragraph({
                        text: "____________________________________________________________________________________",
                        alignment: docx.AlignmentType.CENTER,
                        spacing: { after: 400, before: 200 }
                    })
                );
            }
        });

        // Criar documento
        const doc = new window.docx.Document({
            sections: [{
                properties: {},
                children: documentChildren
            }]
        });

        docx.Packer.toBlob(doc).then((blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `relatorio-completo-turma-${this.currentClass}.docx`;
            link.click();
            this.showSuccessMessage('✅ Relatório completo gerado com sucesso!');
        }).catch((error) => {
            console.error('Erro ao gerar DOCX:', error);
            alert('❌ Erro ao gerar relatório.');
        });
    }

    // Mostrar mensagem de sucesso
    showSuccessMessage(message) {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
}

// Adicionar estilos para animação das mensagens
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(messageStyle);

// Limpar qualquer instância anterior
if (window.studentSystem) {
    if (window.studentSystem.db) {
        window.studentSystem.db.close();
    }
    delete window.studentSystem;
}

// Inicializar sistema com compatibilidade total para navegadores
function initializeSystem() {
    console.log('🚀 Inicializando Sistema de Gestão de Notas por Matérias com Gráficos...');
    console.log('Navegador:', navigator.userAgent.includes('OPR') ? 'Opera GX' : 'Chrome');
    
    // Para Opera GX - aguardar mais tempo
    const isOpera = navigator.userAgent.includes('OPR');
    const delay = isOpera ? 200 : 50;
    
    setTimeout(() => {
        window.studentSystem = new StudentManagementSystem();
        console.log('✅ Sistema inicializado com sucesso!');
    }, delay);
}

// Inicializar baseado no estado do DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else if (document.readyState === 'interactive') {
    // Para Opera que pode estar em interactive
    setTimeout(initializeSystem, 100);
} else {
    initializeSystem();
}
function goBack() {
    history.back();
}