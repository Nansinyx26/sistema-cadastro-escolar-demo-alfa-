/* direcao.js
   Painel da Direção - integração com IndexedDB e Chart.js
   Autor: adaptado para Renan
*/

class DirectionDashboard {
    constructor(options = {}) {
        this.dbName = options.dbName || 'StudentsDB';
        this.dbVersion = options.dbVersion || 4;
        this.db = null;

        this.allStudents = [];
        this.allNotes = [];

        this.filtered = { class: '', subject: '' };

        this.charts = {}; // guardará instâncias Chart.js

        this.subjects = [
            { id: 'matematica', name: 'Matemática', icon: '🔢' },
            { id: 'portugues', name: 'Português', icon: '📝' },
            { id: 'geografia', name: 'Geografia', icon: '🗺️' },
            { id: 'historia', name: 'História', icon: '📜' },
            { id: 'ciencias', name: 'Ciências', icon: '🔬' },
            { id: 'ingles', name: 'Inglês', icon: '🇺🇸' },
            { id: 'educacao_fisica', name: 'Educação Física', icon: '⚽' }
        ];

        this.init();
    }

    async init() {
        try {
            this.bindUI();
            await this.initDB();
            await this.loadAllData();
            this.populateClassFilter();
            this.updateOverviewStats();
            this.generateCharts();
            console.log('Direção: inicializado');
        } catch (err) {
            console.error('Erro init:', err);
            this.showErrorState(err);
        }
    }

    bindUI() {
        document.getElementById('classFilter').addEventListener('change', (e) => {
            this.filtered.class = e.target.value;
            this.updateOverviewStats();
            this.generateCharts();
        });
        document.getElementById('subjectFilter').addEventListener('change', (e) => {
            this.filtered.subject = e.target.value;
            this.updateOverviewStats();
            this.generateCharts();
        });
        document.getElementById('generateBtn').addEventListener('click', () => this.generateReports());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // ✅ BOTÃO VOLTAR CORRIGIDO - verifica se está em subpasta
        document.getElementById('backBtn').addEventListener('click', () => {
            // Se está em uma subpasta (ex: direcao/index.html), volta com ../
            // Se está na raiz, volta sem ../
            const currentPath = window.location.pathname;
            if (currentPath.includes('/direcao/') || currentPath.includes('/admin/')) {
                window.location.href = '../selecionar.html';
            } else {
                window.location.href = 'selecionar.html';
            }
        });
    }

    initDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.dbName, this.dbVersion);

            req.onerror = (e) => {
                console.error('IndexedDB erro:', e);
                reject(e);
            };

            req.onblocked = () => {
                alert('Feche outras abas do sistema e recarregue a página (IndexedDB bloqueado).');
                reject(new Error('indexeddb-blocked'));
            };

            req.onupgradeneeded = (evt) => {
                const db = evt.target.result;
                // Cria stores se não existirem (id autogerada)
                if (!db.objectStoreNames.contains('students')) {
                    const s = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
                    s.createIndex('class', 'class', { unique: false });
                    s.createIndex('name', 'name', { unique: false });
                }
                if (!db.objectStoreNames.contains('notes')) {
                    const n = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
                    // campos esperados: studentId, class, subject, grade, type, description, date
                    n.createIndex('studentId', 'studentId', { unique: false });
                    n.createIndex('class', 'class', { unique: false });
                    n.createIndex('subject', 'subject', { unique: false });
                    n.createIndex('date', 'date', { unique: false });
                }
            };

            req.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
        });
    }

    async loadAllData() {
        try {
            this.allStudents = await this._getAllFromStore('students');
            // garantir que students tenham id, name e class
            this.allStudents = this.allStudents.filter(s => s && (s.name || s.nome) && (s.class || s.turma || s.grade === undefined));
            // padronizar o campo name/class
            this.allStudents = this.allStudents.map(s => ({
                id: s.id,
                name: s.name || s.nome || ('Aluno ' + s.id),
                class: s.class || s.turma || ''
            }));

            this.allNotes = await this._getAllFromStore('notes');
            // filtrar e padronizar notas
            this.allNotes = this.allNotes.filter(n => n && (n.grade !== null && n.grade !== undefined && n.grade !== ''));
            this.allNotes = this.allNotes.map(n => ({
                id: n.id,
                studentId: n.studentId,
                class: n.class || n.turma || '',
                subject: n.subject || n.materia || '',
                grade: parseFloat(n.grade),
                type: n.type || n.tipo || '',
                description: n.description || n.descricao || '',
                date: n.date || n.data || new Date().toISOString()
            }));
        } catch (err) {
            console.error('Erro loadAllData:', err);
        }
    }

    _getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve([]);
            try {
                const tx = this.db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = (e) => {
                    console.error('Erro getAll', e);
                    resolve([]);
                };
            } catch (err) {
                console.error('_getAllFromStore erro:', err);
                resolve([]);
            }
        });
    }

    populateClassFilter() {
        const classFilter = document.getElementById('classFilter');
        const classes = [...new Set(this.allStudents.map(s => s.class).filter(Boolean))].sort();
        classFilter.innerHTML = '<option value="">Todas as Turmas</option>';
        classes.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = `Turma ${c}`;
            classFilter.appendChild(opt);
        });
    }

    getFilteredNotes() {
        return this.allNotes.filter(note => {
            if (this.filtered.class && note.class !== this.filtered.class) return false;
            if (this.filtered.subject && note.subject !== this.filtered.subject) return false;
            return true;
        });
    }

    getFilteredStudents() {
        if (!this.filtered.class) return this.allStudents.slice();
        return this.allStudents.filter(s => s.class === this.filtered.class);
    }

    getActiveClasses() {
        return [...new Set(this.allStudents.map(s => s.class).filter(Boolean))];
    }

    calculateOverallAverage() {
        const notes = this.getFilteredNotes();
        if (notes.length === 0) return 0;

        // média por aluno (em todas as matérias) e depois média geral entre alunos
        const map = {};
        notes.forEach(n => {
            if (!map[n.studentId]) map[n.studentId] = [];
            map[n.studentId].push(n.grade);
        });

        let total = 0;
        let count = 0;
        Object.values(map).forEach(arr => {
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            total += avg;
            count++;
        });
        return count ? (total / count) : 0;
    }

    updateOverviewStats() {
        try {
            const students = this.getFilteredStudents();
            const notes = this.getFilteredNotes();
            const classes = this.getActiveClasses();
            const overallAverage = this.calculateOverallAverage();

            document.getElementById('totalStudents').textContent = students.length;
            document.getElementById('totalClasses').textContent = classes.length;
            document.getElementById('totalAssessments').textContent = notes.length;
            const elAvg = document.getElementById('overallAverage');
            elAvg.textContent = (typeof overallAverage === 'number' && !isNaN(overallAverage)) ? overallAverage.toFixed(1) : '0.0';

            // color according to value
            const avgNum = parseFloat(elAvg.textContent);
            elAvg.style.color = avgNum >= 7 ? '#10b981' : (avgNum >= 5 ? '#f59e0b' : '#ef4444');
        } catch (err) {
            console.error('updateOverviewStats erro:', err);
        }
    }

    generateCharts() {
        // destruir charts anteriores
        Object.values(this.charts).forEach(c => {
            try { if (c) c.destroy(); } catch (e) {}
        });
        this.charts = {};

        const container = document.getElementById('chartsContainer');
        container.innerHTML = `
            <div class="comparison-grid">
                <div class="chart-section">
                    <h3 class="chart-title">📊 Desempenho por Turma</h3>
                    <div class="chart-container"><canvas id="classPerformanceChart"></canvas></div>
                </div>
                <div class="chart-section">
                    <h3 class="chart-title">📚 Comparação por Matéria</h3>
                    <div class="chart-container"><canvas id="subjectComparisonChart"></canvas></div>
                </div>
            </div>

            <div class="chart-section">
                <h3 class="chart-title">📈 Tendências de Desempenho</h3>
                <div class="chart-container"><canvas id="trendsChart"></canvas></div>
            </div>

            <div class="chart-section">
                <h3 class="chart-title">🎯 Distribuição de Notas</h3>
                <div class="chart-container"><canvas id="gradeDistributionChart"></canvas></div>
            </div>
        `;

        // aguarda pequeno delay p/ DOM render
        setTimeout(() => {
            this.renderClassPerformanceChart();
            this.renderSubjectComparisonChart();
            this.renderTrendsChart();
            this.renderGradeDistributionChart();
        }, 80);
    }

    renderClassPerformanceChart() {
        const ctxEl = document.getElementById('classPerformanceChart');
        if (!ctxEl) return;
        const ctx = ctxEl.getContext('2d');
        const notes = this.getFilteredNotes();

        const classMap = {};
        notes.forEach(n => {
            if (!classMap[n.class]) classMap[n.class] = { grades: [], students: new Set() };
            classMap[n.class].grades.push(n.grade);
            classMap[n.class].students.add(n.studentId);
        });

        const chartData = Object.keys(classMap).map(c => {
            const avg = classMap[c].grades.reduce((a, b) => a + b, 0) / classMap[c].grades.length;
            return { class: c, average: parseFloat(avg.toFixed(1)), students: classMap[c].students.size, assessments: classMap[c].grades.length };
        }).sort((a, b) => a.class.localeCompare(b.class));

        if (chartData.length === 0) {
            ctx.fillStyle = '#9095a1';
            ctx.font = '16px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Nenhum dado encontrado', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        const colors = chartData.map((d, i) => {
            const palette = ['rgba(124,58,237,0.9)', 'rgba(167,139,250,0.9)', 'rgba(45,212,191,0.9)', 'rgba(139,92,246,0.85)'];
            return palette[i % palette.length];
        });

        this.charts.classPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.map(d => `Turma ${d.class}`),
                datasets: [{
                    label: 'Média da Turma',
                    data: chartData.map(d => d.average),
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.9', '1')),
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        backgroundColor: '#0b0b10',
                        titleColor: '#e6eef6',
                        bodyColor: '#e6eef6',
                        callbacks: {
                            label: (ctx) => {
                                const d = chartData[ctx.dataIndex];
                                return [`Média: ${d.average}`, `Alunos: ${d.students}`, `Avaliações: ${d.assessments}`];
                            }
                        }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: '#dbeafe' }, grid: { color: 'rgba(255,255,255,0.03)' } },
                    y: { min: 0, max: 10, ticks: { stepSize: 1, color: '#dbeafe' }, grid: { color: 'rgba(255,255,255,0.03)' } }
                }
            }
        });
    }

    renderSubjectComparisonChart() {
        const el = document.getElementById('subjectComparisonChart');
        if (!el) return;
        const ctx = el.getContext('2d');
        const notes = this.getFilteredNotes();

        const subj = {};
        notes.forEach(n => {
            if (!n.subject) return;
            if (!subj[n.subject]) subj[n.subject] = [];
            subj[n.subject].push(n.grade);
        });

        const chartData = this.subjects.map(s => {
            const arr = subj[s.id] || [];
            if (arr.length === 0) return null;
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            return { subject: s.name, icon: s.icon, average: parseFloat(avg.toFixed(1)), count: arr.length };
        }).filter(Boolean);

        if (chartData.length === 0) {
            ctx.fillStyle = '#9095a1';
            ctx.font = '16px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Nenhum dado encontrado', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        const colors = [
            'rgba(124,58,237,0.9)',
            'rgba(167,139,250,0.9)',
            'rgba(45,212,191,0.9)',
            'rgba(99,102,241,0.85)',
            'rgba(168,85,247,0.85)',
            'rgba(99,102,241,0.75)'
        ];

        this.charts.subjectComparison = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartData.map(d => `${d.icon} ${d.subject}`),
                datasets: [{
                    data: chartData.map(d => d.average),
                    backgroundColor: chartData.map((_, i) => colors[i % colors.length]),
                    borderColor: chartData.map((_, i) => colors[i % colors.length].replace('0.9', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#e6eef6' } },
                    tooltip: {
                        backgroundColor: '#0b0b10',
                        callbacks: {
                            label: (ctx) => {
                                const d = chartData[ctx.dataIndex];
                                return [`Média: ${d.average}`, `Avaliações: ${d.count}`];
                            }
                        }
                    }
                }
            }
        });
    }

    renderTrendsChart() {
        const el = document.getElementById('trendsChart');
        if (!el) return;
        const ctx = el.getContext('2d');
        const notes = this.getFilteredNotes();
        if (notes.length === 0) {
            ctx.fillStyle = '#9095a1';
            ctx.font = '16px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Nenhum dado encontrado', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        const monthly = {};
        notes.forEach(n => {
            const date = new Date(n.date);
            if (isNaN(date)) return;
            const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
            if (!monthly[key]) monthly[key] = [];
            monthly[key].push(n.grade);
        });

        const sorted = Object.keys(monthly).sort();
        const trend = sorted.map(k => {
            const arr = monthly[k];
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            return { month: k, average: parseFloat(avg.toFixed(1)), count: arr.length };
        });

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trend.map(t => t.month.split('-').reverse().join('/')),
                datasets: [{
                    label: 'Média Mensal',
                    data: trend.map(t => t.average),
                    borderColor: 'rgba(124,58,237,0.95)',
                    backgroundColor: 'rgba(124,58,237,0.18)',
                    tension: 0.35,
                    pointRadius: 4,
                    fill: true,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: { backgroundColor: '#0b0b10' }
                },
                scales: {
                    x: { ticks: { color: '#e6eef6' }, grid: { color: 'rgba(255,255,255,0.02)' } },
                    y: { min: 0, max: 10, ticks: { color: '#e6eef6', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.02)' } }
                }
            }
        });
    }

    renderGradeDistributionChart() {
        const el = document.getElementById('gradeDistributionChart');
        if (!el) return;
        const ctx = el.getContext('2d');
        const notes = this.getFilteredNotes();
        if (notes.length === 0) {
            ctx.fillStyle = '#9095a1';
            ctx.font = '16px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Nenhum dado encontrado', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        const ranges = {
            '0-2': { min: 0, max: 2, count: 0, color: 'rgba(239,68,68,0.85)' },
            '2-4': { min: 2, max: 4, count: 0, color: 'rgba(249,115,22,0.85)' },
            '4-6': { min: 4, max: 6, count: 0, color: 'rgba(250,204,21,0.85)' },
            '6-8': { min: 6, max: 8, count: 0, color: 'rgba(34,197,94,0.85)' },
            '8-10': { min: 8, max: 10, count: 0, color: 'rgba(124,58,237,0.9)' }
        };

        notes.forEach(n => {
            const g = parseFloat(n.grade);
            Object.keys(ranges).forEach(key => {
                const r = ranges[key];
                if (key === '8-10') {
                    if (g >= r.min && g <= r.max) r.count++;
                } else {
                    if (g >= r.min && g < r.max) r.count++;
                }
            });
        });

        const distribution = Object.keys(ranges).map(k => ({
            range: k,
            count: ranges[k].count,
            percent: ((ranges[k].count / notes.length) * 100).toFixed(1),
            color: ranges[k].color
        }));

        this.charts.gradeDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: distribution.map(d => `${d.range} (${d.percent}%)`),
                datasets: [{
                    label: 'Quantidade',
                    data: distribution.map(d => d.count),
                    backgroundColor: distribution.map(d => d.color),
                    borderColor: distribution.map(d => d.color.replace('0.85', '1').replace('0.9', '1')),
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#e6eef6' }, grid: { color: 'rgba(255,255,255,0.02)' } },
                    y: { beginAtZero: true, ticks: { color: '#e6eef6' } }
                }
            }
        });
    }

    generateTextReport() {
        const students = this.getFilteredStudents();
        const notes = this.getFilteredNotes();
        const classes = this.getActiveClasses();
        const overallAverage = this.calculateOverallAverage();

        let rpt = `🏛️ RELATÓRIO EXECUTIVO DA DIREÇÃO\n`;
        rpt += `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
        rpt += `Total de Alunos: ${students.length}\n`;
        rpt += `Turmas Ativas: ${classes.length}\n`;
        rpt += `Total de Avaliações: ${notes.length}\n`;
        rpt += `Média Geral: ${overallAverage.toFixed(1)}\n\n`;

        // por turma
        const classStats = {};
        notes.forEach(n => {
            if (!classStats[n.class]) classStats[n.class] = [];
            classStats[n.class].push(n.grade);
        });

        rpt += `DESEMPENHO POR TURMA:\n`;
        Object.keys(classStats).sort().forEach(c => {
            const grades = classStats[c];
            const avg = (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1);
            const studentCount = students.filter(s => s.class === c).length;
            rpt += ` Turma ${c} — Média: ${avg}, Alunos: ${studentCount}, Avaliações: ${grades.length}\n`;
        });
        rpt += `\n`;

        // por matéria
        const subjStats = {};
        notes.forEach(n => {
            if (!subjStats[n.subject]) subjStats[n.subject] = [];
            subjStats[n.subject].push(n.grade);
        });

        rpt += `DESEMPENHO POR MATÉRIA:\n`;
        this.subjects.forEach(s => {
            const arr = subjStats[s.id] || [];
            if (arr.length) {
                const avg = (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
                rpt += ` ${s.icon} ${s.name} — Média: ${avg}, Avaliações: ${arr.length}\n`;
            }
        });

        rpt += `\nANÁLISE: `;
        if (overallAverage >= 7) rpt += `Desempenho excelente (média ${overallAverage.toFixed(1)})\n`;
        else if (overallAverage >= 6) rpt += `Desempenho bom (média ${overallAverage.toFixed(1)})\n`;
        else if (overallAverage >= 5) rpt += `Desempenho regular (média ${overallAverage.toFixed(1)})\n`;
        else rpt += `Desempenho baixo — recomenda-se medidas de recuperação (média ${overallAverage.toFixed(1)})\n`;

        return rpt;
    }

    async generateReports() {
        if (!this.allStudents.length || !this.allNotes.length) {
            alert('Não há dados suficientes para gerar relatórios.');
            return;
        }
        const text = this.generateTextReport();
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio-direcao-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
        alert('Relatório gerado!');
    }

    async exportData() {
        // CSV: Aluno,Turma,Materia,Tipo,Descricao,Nota,Data
        const notes = this.getFilteredNotes();
        const students = this.allStudents;
        const map = {};
        students.forEach(s => map[s.id] = s.name);

        let csv = 'Aluno,Turma,Materia,Tipo_Avaliacao,Descricao,Nota,Data\n';
        notes.forEach(n => {
            const studentName = map[n.studentId] || 'Desconhecido';
            const subjObj = this.subjects.find(s => s.id === n.subject);
            const subjectName = subjObj ? subjObj.name : n.subject || '';
            // escape quotes
            const desc = (n.description || '').replace(/"/g, '""');
            csv += `"${studentName}","${n.class}","${subjectName}","${n.type || ''}","${desc}",${n.grade},"${n.date}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `dados-direcao-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        alert('CSV exportado!');
    }

    showErrorState(err) {
        const container = document.getElementById('chartsContainer');
        if (container) container.innerHTML = `<div class="chart-section"><div class="no-data">Erro ao carregar dados: ${err && err.message ? err.message : err}</div></div>`;
    }
}

// inicialização
window.addEventListener('DOMContentLoaded', () => {
    window.directionSystem = new DirectionDashboard();
});