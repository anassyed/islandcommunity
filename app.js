// ===== PASSWORD PROTECTION =====
const SITE_PASSWORD = 'hadaf2026';

function checkPassword() {
    const input = document.getElementById('passwordInput');
    const error = document.getElementById('passwordError');
    
    if (input.value === SITE_PASSWORD) {
        document.getElementById('passwordOverlay').classList.add('hidden');
        sessionStorage.setItem('authenticated', 'true');
    } else {
        error.textContent = 'Incorrect password. Please try again.';
        input.value = '';
        input.focus();
    }
}

// Check if already authenticated this session
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('authenticated') === 'true') {
        document.getElementById('passwordOverlay').classList.add('hidden');
    }
});

// ===== GLOBAL STATE =====
let communityData = [];
let scoresData = [];
let gapData = [];
let teamRecommendations = [];
let currentTeam = [];

// ===== CATEGORIES =====
const categories = [
    'Operational', 'Outdoor', 'Kids Activities', 'Physical/Sports',
    'Educational', 'Social', 'Community Service', 'Spiritual',
    'Leadership/Strategy', 'Artisan/Engineer', 'Arts & Culture', 'Economy/Resource'
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupNavigation();
    setupModalHandlers();
});

// ===== DATA LOADING =====
async function loadData() {
    try {
        // Load community scores
        const scoresResponse = await fetch('community_scores.csv');
        const scoresText = await scoresResponse.text();
        const scoresParsed = Papa.parse(scoresText, { header: true, skipEmptyLines: true });
        scoresData = scoresParsed.data.filter(row => row.Name && row.Name.trim() !== '' && row.Name !== 'Zubair');
        
        // Load gap analysis
        const gapResponse = await fetch('gap_analysis.csv');
        const gapText = await gapResponse.text();
        const gapParsed = Papa.parse(gapText, { header: true, skipEmptyLines: true });
        gapData = gapParsed.data;
        
        // Initialize UI
        updateStats();
        renderOverview();
        renderHeatmap();
        renderProfiles();
        renderGapAnalysis();
        renderTopStrengths();
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ===== STATISTICS =====
function updateStats() {
    document.getElementById('totalMembers').textContent = scoresData.length;
    
    // Calculate top category
    const categoryAverages = {};
    categories.forEach(cat => {
        const avg = scoresData.reduce((sum, member) => {
            return sum + (parseInt(member[cat]) || 0);
        }, 0) / scoresData.length;
        categoryAverages[cat] = avg;
    });
    
    const topCategory = Object.keys(categoryAverages).reduce((a, b) => 
        categoryAverages[a] > categoryAverages[b] ? a : b
    );
    document.getElementById('topCategory').textContent = topCategory;
    
    // Count critical gaps (0 members)
    const criticalGaps = gapData.filter(gap => 
        parseInt(gap['Interested Members']) === 0
    ).length;
    document.getElementById('criticalGaps').textContent = criticalGaps;
}

// ===== OVERVIEW SECTION =====
function renderOverview() {
    // Category distribution bar chart
    const categoryScores = categories.map(cat => {
        const avg = scoresData.reduce((sum, member) => {
            return sum + (parseFloat(member[cat]) || 0);
        }, 0) / scoresData.length;
        return { category: cat, score: avg };
    });
    
    categoryScores.sort((a, b) => a.score - b.score);
    
    const trace = {
        x: categoryScores.map(c => c.score),
        y: categoryScores.map(c => c.category),
        type: 'bar',
        orientation: 'h',
        marker: {
            color: categoryScores.map(c => c.score),
            colorscale: 'RdYlGn',
            showscale: true
        },
        text: categoryScores.map(c => c.score.toFixed(2)),
        textposition: 'outside'
    };
    
    const layout = {
        title: '📊 Average Interest by Category',
        xaxis: { title: 'Average Score' },
        yaxis: { title: '' },
        height: 600,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e8eaf6' }
    };
    
    Plotly.newPlot('categoryDistribution', [trace], layout, {responsive: true});
    
    // Top strengths and weak areas
    const sorted = [...categoryScores].sort((a, b) => b.score - a.score);
    
    const topStrengthsHTML = sorted.slice(0, 5).map(cat => 
        `<li><span>${cat.category}</span><span class="skill-score">+${cat.score.toFixed(2)}</span></li>`
    ).join('');
    const topStrengthsEl = document.getElementById('topStrengths');
    if (topStrengthsEl) topStrengthsEl.innerHTML = topStrengthsHTML;
}

// ===== TOP STRENGTHS (FROM DATA) =====
function renderTopStrengths() {
    // This is now handled in renderOverview
}

// ===== HEATMAP SECTION =====
function renderHeatmap() {
    const z = scoresData.map(member => 
        categories.map(cat => parseInt(member[cat]) || 0)
    );
    
    const trace = {
        z: z,
        x: categories,
        y: scoresData.map(m => m.Name),
        type: 'heatmap',
        colorscale: 'RdYlGn',
        zmid: 0,
        text: z,
        texttemplate: '%{text}',
        textfont: { size: 10 },
        colorbar: { title: 'Score' }
    };
    
    const layout = {
        title: '🗺️ Community Skills Heatmap<br><sub>Green = High Interest | Red = Low Interest</sub>',
        xaxis: { title: 'Skill Categories', tickangle: -45 },
        yaxis: { title: 'Members' },
        height: 700,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e8eaf6' }
    };
    
    Plotly.newPlot('heatmapChart', [trace], layout, {responsive: true});
}

// ===== PROFILES SECTION =====
function renderProfiles() {
    const grid = document.getElementById('profilesGrid');
    const searchInput = document.getElementById('memberSearch');
    
    function displayProfiles(filter = '') {
        // Filter out Zubair and apply search filter
        const filtered = scoresData.filter(member => 
            member.Name.toLowerCase().includes(filter.toLowerCase()) &&
            member.Name !== 'Zubair'
        );
        
        grid.innerHTML = filtered.map((member, index) => {
            const scores = categories.map(cat => ({
                category: cat,
                score: parseInt(member[cat]) || 0
            })).sort((a, b) => b.score - a.score);
            
            const topSkills = scores.slice(0, 3);
            const chartId = `radar-${index}-${member.Name.replace(/\s+/g, '')}`;
            
            return `
                <div class="profile-card" onclick="showProfile('${member.Name}')">
                    <div class="profile-name">${member.Name}</div>
                    <div class="profile-radar" id="${chartId}"></div>
                    <div class="profile-skills">
                        <strong>Top Skills:</strong>
                        <ul class="profile-skills-list">
                            ${topSkills.map(s => `
                                <li>
                                    <span>${s.category}</span>
                                    <span class="skill-score">${s.score > 0 ? '+' : ''}${s.score}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }).join('');
        
        // Render mini radar charts for each profile
        filtered.forEach((member, index) => {
            const chartId = `radar-${index}-${member.Name.replace(/\s+/g, '')}`;
            const scores = categories.map(cat => parseInt(member[cat]) || 0);
            
            const trace = {
                r: scores,
                theta: categories.map(c => c.substring(0, 8)), // Shortened labels
                fill: 'toself',
                type: 'scatterpolar',
                line: { color: '#00d4ff', width: 1 },
                fillcolor: 'rgba(0, 212, 255, 0.3)'
            };
            
            const layout = {
                polar: {
                    radialaxis: {
                        visible: false,
                        range: [-5, 10]
                    },
                    angularaxis: {
                        visible: false
                    }
                },
                showlegend: false,
                margin: { l: 5, r: 5, t: 5, b: 5 },
                width: 140,
                height: 140,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
            };
            
            Plotly.newPlot(chartId, [trace], layout, {
                responsive: false,
                displayModeBar: false
            });
        });
    }
    
    displayProfiles();
    
    searchInput.addEventListener('input', (e) => {
        displayProfiles(e.target.value);
    });
}

// ===== PROFILE MODAL =====
function showProfile(memberName) {
    const member = scoresData.find(m => m.Name === memberName);
    if (!member) return;
    
    const modal = document.getElementById('profileModal');
    document.getElementById('modalMemberName').textContent = `🎯 ${memberName}`;
    
    // Radar chart
    const scores = categories.map(cat => parseInt(member[cat]) || 0);
    
    const trace = {
        r: scores,
        theta: categories,
        fill: 'toself',
        type: 'scatterpolar',
        name: memberName,
        line: { color: '#00d4ff', width: 2 },
        fillcolor: 'rgba(0, 212, 255, 0.3)'
    };
    
    const layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [-10, 20]
            }
        },
        title: `Skills Profile`,
        showlegend: false,
        height: 500,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e8eaf6' }
    };
    
    Plotly.newPlot('modalRadarChart', [trace], layout, {responsive: true});
    
    // Top strengths and weaknesses
    const skillsList = categories.map(cat => ({
        category: cat,
        score: parseInt(member[cat]) || 0
    })).sort((a, b) => b.score - a.score);
    
    document.getElementById('modalStrengths').innerHTML = skillsList.slice(0, 3).map(s => 
        `<li>${s.category}: <strong>${s.score > 0 ? '+' : ''}${s.score}</strong></li>`
    ).join('');
    
    document.getElementById('modalWeaknesses').innerHTML = skillsList.slice(-3).reverse().map(s => 
        `<li>${s.category}: <strong>${s.score > 0 ? '+' : ''}${s.score}</strong></li>`
    ).join('');
    
    // Add to team button
    document.getElementById('addToTeamBtn').onclick = () => {
        addToTeam(memberName);
        modal.style.display = 'none';
    };
    
    modal.style.display = 'block';
}

function setupModalHandlers() {
    const modal = document.getElementById('profileModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// ===== TEAM BUILDER =====
function setupTeamBuilder() {
    document.getElementById('clearTeam').onclick = clearTeam;
    document.getElementById('exportTeam').onclick = exportTeam;
}

function renderAvailableMembers() {
    const container = document.getElementById('availableMembers');
    container.innerHTML = scoresData.map(member => `
        <div class="member-item ${currentTeam.includes(member.Name) ? 'in-team' : ''}" 
             onclick="addToTeam('${member.Name}')">
            <span>${member.Name}</span>
            <span>+</span>
        </div>
    `).join('');
}

function addToTeam(memberName) {
    if (!currentTeam.includes(memberName)) {
        currentTeam.push(memberName);
        updateTeamDisplay();
        renderAvailableMembers();
    }
}

function removeFromTeam(memberName) {
    currentTeam = currentTeam.filter(name => name !== memberName);
    updateTeamDisplay();
    renderAvailableMembers();
}

function updateTeamDisplay() {
    const container = document.getElementById('teamMembers');
    
    if (currentTeam.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No members added yet. Click on members from the left to add them.</p>';
        document.getElementById('teamCoverage').innerHTML = '';
        return;
    }
    
    container.innerHTML = currentTeam.map(name => `
        <div class="member-item" onclick="removeFromTeam('${name}')">
            <span>${name}</span>
            <span style="color: #f472b6;">×</span>
        </div>
    `).join('');
    
    // Calculate team coverage
    const coverage = {};
    categories.forEach(cat => {
        const total = currentTeam.reduce((sum, name) => {
            const member = scoresData.find(m => m.Name === name);
            return sum + (parseInt(member[cat]) || 0);
        }, 0);
        coverage[cat] = total;
    });
    
    const maxCoverage = Math.max(...Object.values(coverage), 1);
    
    const coverageHTML = `
        <h4 style="color: var(--accent-cyan); margin-bottom: 1rem;">Team Skill Coverage</h4>
        ${Object.entries(coverage).map(([cat, score]) => `
            <div class="coverage-item">
                <span style="font-size: 0.9rem;">${cat}</span>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${(score / maxCoverage) * 100}%"></div>
                </div>
                <span style="font-weight: bold; min-width: 40px; text-align: right;">${score > 0 ? '+' : ''}${score}</span>
            </div>
        `).join('')}
    `;
    
    document.getElementById('teamCoverage').innerHTML = coverageHTML;
}

function clearTeam() {
    currentTeam = [];
    updateTeamDisplay();
    renderAvailableMembers();
}

function exportTeam() {
    if (currentTeam.length === 0) {
        alert('No members in the team to export!');
        return;
    }
    
    const teamData = currentTeam.map(name => {
        const member = scoresData.find(m => m.Name === name);
        return member;
    });
    
    const csv = Papa.unparse(teamData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// ===== GAP ANALYSIS =====
function renderGapAnalysis() {
    const container = document.getElementById('gapAnalysisGrid');
    
    container.innerHTML = gapData.map(gap => {
        const interested = parseInt(gap['Interested Members']) || 0;
        const highly = parseInt(gap['Highly Interested']) || 0;
        
        let severity, badge;
        if (interested === 0) {
            severity = 'critical';
            badge = 'Critical';
        } else if (interested < 5) {
            severity = 'warning';
            badge = 'Warning';
        } else {
            severity = 'ok';
            badge = 'Good';
        }
        
        return `
            <div class="gap-card ${severity}">
                <div class="gap-header">
                    <div class="gap-title">${gap.Category}</div>
                    <div class="gap-badge ${severity}">${badge}</div>
                </div>
                <div class="gap-stats">
                    <div class="gap-stat">
                        <span>Interested Members:</span>
                        <strong>${interested}</strong>
                    </div>
                    <div class="gap-stat">
                        <span>Highly Interested:</span>
                        <strong>${highly}</strong>
                    </div>
                    <div class="gap-stat">
                        <span>Average Score:</span>
                        <strong>${parseFloat(gap['Avg Score']).toFixed(2)}</strong>
                    </div>
                </div>
                ${severity === 'critical' ? '<p style="margin-top: 1rem; color: #f472b6; font-size: 0.9rem;">⚠️ Urgent: No members interested. Consider recruitment or training.</p>' : ''}
                ${severity === 'warning' ? '<p style="margin-top: 1rem; color: #fbbf24; font-size: 0.9rem;">⚡ Low participation. Encourage more involvement.</p>' : ''}
            </div>
        `;
    }).join('');
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
        });
    });
}
