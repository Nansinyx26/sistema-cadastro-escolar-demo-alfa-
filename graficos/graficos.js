        class GraphicsSystem {
            constructor() {
                this.dbName = 'StudentsDB';
                this.version = 4;
                this.db = null;
                this.currentStudent = null;
                this.currentClass = null;
                this.studentNotes = [];
                this.charts = {}; // Armazenar instâncias dos gráficos

                this.subjects = [{
                    id: 'matematica',
                    name: 'Matemática',
                    icon: '🔢'
                }, {
                    id: 'portugues',
                    name: 'Português',
                    icon: '📝'
                }, {
                    id: 'geografia',
                    name: 'Geografia',
                    icon: '🗺️'
                }, {
                    id: 'historia',
                    name: 'História',
                    icon: '📜'
                }, {
                    id: 'ciencias',
                    name: 'Ciências',
                    icon: '🔬'
                }, {
                    id: 'ingles',
                    name: 'Inglês',
                    icon: '🇺🇸'
                }, {
                    id: 'educacao_fisica',
                    name: 'Educação Física',
                    icon: '⚽'
                }];

                this.init();
            }

            async init() {
                console.log('🚀 Inicializando Sistema de Gráficos...');
                await this.initDB();
                await this.loadClasses();
                console.log('✅ Sistema de Gráficos inicializado!');
            }

            async initDB() {
                return new Promise((resolve, reject) => {
                    console.log('📂 Conectando ao IndexedDB...');
                    const request = indexedDB.open(this.dbName, this.version);

                    request.onsuccess = (event) => {
                        this.db = event.target.result;
                        console.log('✅ Conectado ao IndexedDB com sucesso');
                        resolve();
                    };

                    request.onerror = (event) => {
                        console.error('❌ Erro ao conectar ao IndexedDB:', event.target.error);
                        reject(event.target.error);
                    };

                    request.onblocked = () => {
                        console.warn('⚠️ IndexedDB bloqueado');
                        alert('🚨 Feche outras abas do sistema e recarregue a página.');
                        reject(new Error('IndexedDB bloqueado'));
                    };
                });
            }

            async loadClasses() {
                if (!this.db) {
                    console.error('❌ Database não disponível');
                    return;
                }

                try {
                    console.log('📚 Carregando turmas...');
                    const transaction = this.db.transaction(['students'], 'readonly');
                    const store = transaction.objectStore('students');
                    const request = store.getAll();

                    request.onsuccess = () => {
                        const students = request.result || [];
                        const classes = [...new Set(students.map(s => s.class))].filter(c => c);
                        console.log('📚 Turmas encontradas:', classes);

                        const classSelect = document.getElementById('classSelect');
                        classSelect.innerHTML = '<option value="">Selecione uma turma</option>';

                        classes.forEach(className => {
                            const option = document.createElement('option');
                            option.value = className;
                            option.textContent = `Turma ${className}`;
                            classSelect.appendChild(option);
                        });

                        if (classes.length === 0) {
                            console.warn('⚠️ Nenhuma turma encontrada');
                            classSelect.innerHTML = '<option value="">Nenhuma turma encontrada</option>';
                        }
                    };

                    request.onerror = (event) => {
                        console.error('❌ Erro ao carregar turmas:', event.target.error);
                    };
                } catch (error) {
                    console.error('❌ Erro ao acessar turmas:', error);
                }
            }

            async loadStudents() {
                const classSelect = document.getElementById('classSelect');
                const studentSelect = document.getElementById('studentSelect');
                const generateBtn = document.getElementById('generateBtn');

                this.currentClass = classSelect.value;
                studentSelect.innerHTML = '<option value="">Selecione um aluno</option>';
                generateBtn.disabled = true;

                if (!this.currentClass) {
                    console.log('⚠️ Nenhuma turma selecionada');
                    return;
                }

                console.log(`👥 Carregando alunos da turma ${this.currentClass}...`);

                try {
                    const transaction = this.db.transaction(['students'], 'readonly');
                    const store = transaction.objectStore('students');
                    const index = store.index('class');
                    const request = index.getAll(this.currentClass);

                    request.onsuccess = () => {
                        const students = request.result.filter(s => s.name && s.name.trim() !== '');
                        console.log(`👥 Encontrados ${students.length} alunos na turma ${this.currentClass}`);

                        if (students.length === 0) {
                            studentSelect.innerHTML = '<option value="">Nenhum aluno encontrado</option>';
                            return;
                        }

                        students.sort((a, b) => a.name.localeCompare(b.name));

                        students.forEach(student => {
                            const option = document.createElement('option');
                            option.value = student.id;
                            option.textContent = student.name;
                            studentSelect.appendChild(option);
                        });
                    };

                    request.onerror = (event) => {
                        console.error('❌ Erro ao carregar alunos:', event.target.error);
                    };
                } catch (error) {
                    console.error('❌ Erro ao acessar alunos:', error);
                }
            }

            async loadStudentData() {
                const studentSelect = document.getElementById('studentSelect');
                const generateBtn = document.getElementById('generateBtn');

                const studentId = parseInt(studentSelect.value);
                generateBtn.disabled = !studentId;

                if (!studentId) {
                    console.log('⚠️ Nenhum aluno selecionado');
                    this.currentStudent = null;
                    this.studentNotes = [];
                    return;
                }

                console.log(`📊 Carregando dados do aluno ID: ${studentId}...`);

                try {
                    const studentTransaction = this.db.transaction(['students'], 'readonly');
                    const studentStore = studentTransaction.objectStore('students');
                    const studentRequest = studentStore.get(studentId);

                    studentRequest.onsuccess = async() => {
                        this.currentStudent = studentRequest.result;
                        console.log('👤 Dados do aluno carregados:', this.currentStudent.name);
                        await this.loadStudentNotes(studentId);
                    };

                    studentRequest.onerror = (event) => {
                        console.error('❌ Erro ao carregar dados do aluno:', event.target.error);
                    };
                } catch (error) {
                    console.error('❌ Erro ao acessar dados do aluno:', error);
                }
            }

            async loadStudentNotes(studentId) {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(['notes'], 'readonly');
                    const store = transaction.objectStore('notes');
                    const index = store.index('studentId');
                    const request = index.getAll(studentId);

                    request.onsuccess = () => {
                        this.studentNotes = request.result
                            .filter(note => note.grade !== null && note.grade !== '' && note.grade !== undefined)
                            .sort((a, b) => new Date(a.date) - new Date(b.date));

                        console.log(`📝 Encontradas ${this.studentNotes.length} notas válidas para o aluno`);

                        if (this.studentNotes.length === 0) {
                            console.warn('⚠️ Nenhuma nota válida encontrada para este aluno');
                        }

                        resolve();
                    };

                    request.onerror = (event) => {
                        console.error('❌ Erro ao carregar notas do aluno:', event.target.error);
                        reject(event.target.error);
                    };
                });
            }

            generateCharts() {
                if (!this.currentStudent) {
                    alert('⚠️ Selecione um aluno primeiro.');
                    return;
                }

                if (this.studentNotes.length === 0) {
                    alert('⚠️ O aluno selecionado não possui notas cadastradas ainda.\n\nCadastre algumas avaliações usando o sistema de notas por matéria.');
                    return;
                }

                console.log('📊 Gerando gráficos...');
                this.displayStudentInfo();
                this.renderCharts();
                document.getElementById('exportBtn').disabled = false;
                console.log('✅ Gráficos gerados com sucesso!');
            }

            displayStudentInfo() {
                const container = document.getElementById('studentInfo');

                const subjectStats = {};
                this.studentNotes.forEach(note => {
                    if (!subjectStats[note.subject]) {
                        subjectStats[note.subject] = {
                            grades: [],
                            count: 0
                        };
                    }
                    subjectStats[note.subject].grades.push(parseFloat(note.grade));
                    subjectStats[note.subject].count++;
                });

                Object.keys(subjectStats).forEach(subject => {
                    const stats = subjectStats[subject];
                    stats.average = stats.grades.reduce((a, b) => a + b, 0) / stats.grades.length;
                });

                const allGrades = this.studentNotes.map(n => parseFloat(n.grade));
                const overallAverage = allGrades.reduce((a, b) => a + b, 0) / allGrades.length;
                const maxGrade = Math.max(...allGrades);
                const minGrade = Math.min(...allGrades);

                container.innerHTML = `
                    <div class="student-info">
                        <div class="student-name">${this.currentStudent.name}</div>
                        <div class="student-stats">
                            <div class="stat-item">
                                <div class="stat-value">${overallAverage.toFixed(1)}</div>
                                <div class="stat-label">Média Geral</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${this.studentNotes.length}</div>
                                <div class="stat-label">Total de Avaliações</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${Object.keys(subjectStats).length}</div>
                                <div class="stat-label">Matérias com Notas</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${maxGrade.toFixed(1)}</div>
                                <div class="stat-label">Maior Nota</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${minGrade.toFixed(1)}</div>
                                <div class="stat-label">Menor Nota</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            renderCharts() {
                const container = document.getElementById('chartsContainer');
                const selectedSubject = document.getElementById('subjectSelect').value;

                let filteredNotes = this.studentNotes;
                if (selectedSubject) {
                    filteredNotes = this.studentNotes.filter(note => note.subject === selectedSubject);
                }

                // Destruir gráficos anteriores
                Object.values(this.charts).forEach(chart => {
                    if (chart) chart.destroy();
                });
                this.charts = {};

                container.innerHTML = `
                    <div class="chart-section grade-trend">
                        <h3 class="chart-title">📈 Evolução das Notas ao Longo do Tempo</h3>
                        <div class="chart-container">
                            <canvas id="trendChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-section subject-comparison">
                        <h3 class="chart-title">📊 Comparação por Matéria</h3>
                        <div class="chart-container">
                            <canvas id="subjectChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-section performance-radar">
                        <h3 class="chart-title">🎯 Radar de Performance</h3>
                        <div class="chart-container">
                            <canvas id="radarChart"></canvas>
                        </div>
                    </div>
                `;

                setTimeout(() => {
                    this.renderTrendChart(filteredNotes);
                    this.renderSubjectChart();
                    this.renderRadarChart();
                }, 100);
            }

            renderTrendChart(notes) {
                const ctx = document.getElementById('trendChart').getContext('2d');

                if (notes.length === 0) {
                    ctx.fillStyle = '#666';
                    ctx.font = '18px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('📈 Nenhuma nota encontrada para o filtro selecionado',
                        ctx.canvas.width / 2, ctx.canvas.height / 2);
                    return;
                }

                const trendData = notes.map((note, index) => ({
                    x: index + 1,
                    y: parseFloat(note.grade),
                    date: new Date(note.date).toLocaleDateString('pt-BR'),
                    subject: this.getSubjectName(note.subject),
                    description: note.description || note.type || 'Avaliação',
                    type: note.type || 'avaliação'
                }));

                this.charts.trend = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: trendData.map(d => `Aval. ${d.x}`),
                        datasets: [{
                            label: 'Notas',
                            data: trendData.map(d => d.y),
                            borderColor: '#00bcd4',
                            backgroundColor: 'rgba(0, 188, 212, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.1,
                            pointBackgroundColor: '#00bcd4',
                            pointBorderColor: '#26c6da',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                backgroundColor: '#333333',
                                borderColor: '#00bcd4',
                                borderWidth: 1,
                                titleColor: '#e0e0e0',
                                bodyColor: '#e0e0e0',
                                callbacks: {
                                    title: function(context) {
                                        const index = context[0].dataIndex;
                                        const data = trendData[index];
                                        return `${data.description} - ${data.subject}`;
                                    },
                                    afterTitle: function(context) {
                                        const index = context[0].dataIndex;
                                        return trendData[index].date;
                                    },
                                    label: function(context) {
                                        return `Nota: ${context.parsed.y.toFixed(1)}`;
                                    }
                                }
                            },
                            legend: {
                                labels: {
                                    color: '#e0e0e0'
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: '#e0e0e0'
                                },
                                grid: {
                                    color: '#444444'
                                }
                            },
                            y: {
                                min: 0,
                                max: 10,
                                ticks: {
                                    color: '#e0e0e0',
                                    stepSize: 1
                                },
                                grid: {
                                    color: '#444444'
                                }
                            }
                        }
                    }
                });
            }

            renderSubjectChart() {
                const ctx = document.getElementById('subjectChart').getContext('2d');

                const subjectAverages = {};
                this.studentNotes.forEach(note => {
                    if (!subjectAverages[note.subject]) {
                        subjectAverages[note.subject] = {
                            grades: [],
                            name: this.getSubjectName(note.subject),
                            icon: this.getSubjectIcon(note.subject)
                        };
                    }
                    subjectAverages[note.subject].grades.push(parseFloat(note.grade));
                });

                const chartData = Object.keys(subjectAverages).map(subject => {
                    const data = subjectAverages[subject];
                    const average = data.grades.reduce((a, b) => a + b, 0) / data.grades.length;
                    return {
                        subject: data.name,
                        average: parseFloat(average.toFixed(1)),
                        count: data.grades.length,
                        icon: data.icon
                    };
                }).sort((a, b) => b.average - a.average);

                if (chartData.length === 0) {
                    ctx.fillStyle = '#666';
                    ctx.font = '18px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('📊 Nenhuma nota cadastrada ainda',
                        ctx.canvas.width / 2, ctx.canvas.height / 2);
                    return;
                }

                const colors = [
                    '#00bcd4', '#4caf50', '#ff9800', '#9c27b0',
                    '#f44336', '#2196f3', '#ffeb3b', '#795548'
                ];

                this.charts.subject = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartData.map(d => `${d.icon} ${d.subject}`),
                        datasets: [{
                            label: 'Média da Matéria',
                            data: chartData.map(d => d.average),
                            backgroundColor: colors.slice(0, chartData.length),
                            borderColor: colors.slice(0, chartData.length),
                            borderWidth: 1,
                            borderRadius: 4,
                            borderSkipped: false,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                backgroundColor: '#333333',
                                borderColor: '#00bcd4',
                                borderWidth: 1,
                                titleColor: '#e0e0e0',
                                bodyColor: '#e0e0e0',
                                callbacks: {
                                    label: function(context) {
                                        const index = context.dataIndex;
                                        const data = chartData[index];
                                        return [
                                            `Média: ${data.average}`,
                                            `Avaliações: ${data.count}`
                                        ];
                                    }
                                }
                            },
                            legend: {
                                labels: {
                                    color: '#e0e0e0'
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: '#e0e0e0',
                                    maxRotation: 45,
                                    minRotation: 45
                                },
                                grid: {
                                    color: '#444444'
                                }
                            },
                            y: {
                                min: 0,
                                max: 10,
                                ticks: {
                                    color: '#e0e0e0',
                                    stepSize: 1
                                },
                                grid: {
                                    color: '#444444'
                                }
                            }
                        }
                    }
                });
            }

            renderRadarChart() {
                const ctx = document.getElementById('radarChart').getContext('2d');

                const subjectAverages = {};
                this.studentNotes.forEach(note => {
                    if (!subjectAverages[note.subject]) {
                        subjectAverages[note.subject] = {
                            grades: [],
                            name: this.getSubjectName(note.subject)
                        };
                    }
                    subjectAverages[note.subject].grades.push(parseFloat(note.grade));
                });

                const radarData = Object.keys(subjectAverages).map(subject => {
                    const data = subjectAverages[subject];
                    const average = data.grades.reduce((a, b) => a + b, 0) / data.grades.length;
                    return {
                        subject: data.name,
                        average: parseFloat(average.toFixed(1))
                    };
                });

                if (radarData.length === 0) {
                    ctx.fillStyle = '#666';
                    ctx.font = '18px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('🎯 Nenhuma nota cadastrada ainda',
                        ctx.canvas.width / 2, ctx.canvas.height / 2);
                    return;
                }

                this.charts.radar = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: radarData.map(d => d.subject),
                        datasets: [{
                            label: 'Desempenho',
                            data: radarData.map(d => d.average),
                            borderColor: '#00bcd4',
                            backgroundColor: 'rgba(0, 188, 212, 0.3)',
                            borderWidth: 2,
                            pointBackgroundColor: '#00bcd4',
                            pointBorderColor: '#26c6da',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                backgroundColor: '#333333',
                                borderColor: '#00bcd4',
                                borderWidth: 1,
                                titleColor: '#e0e0e0',
                                bodyColor: '#e0e0e0',
                                callbacks: {
                                    label: function(context) {
                                        return `Desempenho: ${context.parsed.r.toFixed(1)}`;
                                    }
                                }
                            },
                            legend: {
                                labels: {
                                    color: '#e0e0e0'
                                }
                            }
                        },
                        scales: {
                            r: {
                                beginAtZero: true,
                                min: 0,
                                max: 10,
                                ticks: {
                                    color: '#e0e0e0',
                                    backdropColor: 'transparent',
                                    stepSize: 2
                                },
                                grid: {
                                    color: '#444444'
                                },
                                angleLines: {
                                    color: '#444444'
                                },
                                pointLabels: {
                                    color: '#e0e0e0',
                                    font: {
                                        size: 12
                                    }
                                }
                            }
                        }
                    }
                });
            }

            updateCharts() {
                if (this.currentStudent && this.studentNotes.length > 0) {
                    console.log('🔄 Atualizando gráficos...');
                    this.renderCharts();
                }
            }

            getSubjectName(subjectId) {
                const subject = this.subjects.find(s => s.id === subjectId);
                return subject ? subject.name : subjectId;
            }

            getSubjectIcon(subjectId) {
                const subject = this.subjects.find(s => s.id === subjectId);
                return subject ? subject.icon : '📚';
            }

            async exportCharts() {
                if (!this.currentStudent) {
                    alert('⚠️ Selecione um aluno primeiro.');
                    return;
                }

                // Gerar relatório em texto
                let report = `📊 RELATÓRIO DE DESEMPENHO\n\n`;
                report += `👤 Aluno: ${this.currentStudent.name}\n`;
                report += `🏫 Turma: ${this.currentClass}\n`;
                report += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;

                report += `📈 RESUMO GERAL:\n`;
                const allGrades = this.studentNotes.map(n => parseFloat(n.grade));
                const overallAverage = allGrades.reduce((a, b) => a + b, 0) / allGrades.length;
                report += `• Média Geral: ${overallAverage.toFixed(1)}\n`;
                report += `• Total de Avaliações: ${this.studentNotes.length}\n`;
                report += `• Maior Nota: ${Math.max(...allGrades).toFixed(1)}\n`;
                report += `• Menor Nota: ${Math.min(...allGrades).toFixed(1)}\n\n`;

                // Análise por matéria
                const subjectStats = {};
                this.studentNotes.forEach(note => {
                    if (!subjectStats[note.subject]) {
                        subjectStats[note.subject] = [];
                    }
                    subjectStats[note.subject].push(parseFloat(note.grade));
                });

                report += `📚 DESEMPENHO POR MATÉRIA:\n`;
                Object.keys(subjectStats).forEach(subject => {
                    const grades = subjectStats[subject];
                    const average = grades.reduce((a, b) => a + b, 0) / grades.length;
                    const subjectName = this.getSubjectName(subject);
                    const icon = this.getSubjectIcon(subject);

                    report += `${icon} ${subjectName}:\n`;
                    report += `  • Média: ${average.toFixed(1)}\n`;
                    report += `  • Avaliações: ${grades.length}\n`;
                    report += `  • Notas: ${grades.map(g => g.toFixed(1)).join(', ')}\n\n`;
                });

                // Download do relatório
                const blob = new Blob([report], {
                    type: 'text/plain;charset=utf-8'
                });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `relatorio-${this.currentStudent.name.replace(/\s+/g, '-').toLowerCase()}-${this.currentClass}.txt`;
                link.click();

                alert('📄 Relatório exportado com sucesso!');
            }
        }

        // Funções globais
        let graphicsSystem;

        function goBack() {
            window.history.back();
        }

        function loadStudents() {
            if (graphicsSystem) {
                graphicsSystem.loadStudents();
            }
        }

        function loadStudentData() {
            if (graphicsSystem) {
                graphicsSystem.loadStudentData();
            }
        }

        function generateCharts() {
            if (graphicsSystem) {
                graphicsSystem.generateCharts();
            }
        }

        function updateCharts() {
            if (graphicsSystem) {
                graphicsSystem.updateCharts();
            }
        }

        function exportCharts() {
            if (graphicsSystem) {
                graphicsSystem.exportCharts();
            }
        }

        // Inicializar quando a página carregar
        window.addEventListener('DOMContentLoaded', () => {
            console.log('🌟 Página de gráficos carregada');
            graphicsSystem = new GraphicsSystem();
        });

        // Fallback para garantir inicialização
        if (document.readyState !== 'loading') {
            console.log('🌟 Inicializando sistema imediatamente');
            graphicsSystem = new GraphicsSystem();
        }



        function goBack() {
            if (document.referrer && document.referrer !== '') {
                // Volta para a página anterior REAL
                window.location.href = document.referrer;
            } else {
                // Se não tiver anterior, volta um nível na pasta
                window.location.href = 'index.html'; // troque para sua página inicial
            }
        }