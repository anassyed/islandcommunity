# 🏝️ The Island Community Dashboard

An interactive web dashboard to visualize community skills, explore member profiles, and build teams.

## 🚀 Quick Start

### Run the Dashboard

1. Open Terminal
2. Navigate to this folder:
   ```bash
   cd /Users/anassyed/Documents/Hadaf
   ```
3. Start the local server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and go to:
   ```
   http://localhost:8000
   ```

### Stop the Server

Press `Ctrl + C` in the terminal to stop the server.

---

## 📁 Project Files

| File                       | Description                                   |
| -------------------------- | --------------------------------------------- |
| `index.html`               | Main dashboard application                    |
| `styles.css`               | Premium styling with glassmorphism effects    |
| `app.js`                   | Interactive JavaScript functionality          |
| `community_scores.csv`     | Individual member scores across 12 categories |
| `gap_analysis.csv`         | Category participation statistics             |
| `team_recommendations.csv` | Suggested team compositions                   |
| `comprehensive_report.md`  | Full analysis report                          |
| `community_analysis.ipynb` | Jupyter notebook with detailed analysis       |

---

## 🎨 Dashboard Features

### 📊 Overview

- Community statistics at a glance
- Bar chart showing average interest by category
- Top strengths and areas needing attention

### 🗺️ Heatmap

- Interactive visualization of all members across skill categories
- Color-coded: Green = High Interest, Red = Low Interest

### 👤 Member Profiles

- Searchable list of all community members
- Click any member to see their detailed radar chart
- View top strengths and least preferred areas

### 👥 Team Builder

- Select members to build custom teams
- Real-time skill coverage visualization
- Export team compositions to CSV

### 📉 Gap Analysis

- Color-coded cards for each skill category
- Critical (red), Warning (yellow), Good (green)
- Identifies areas needing recruitment or training

---

## 🔄 Updating Data

If you add new survey responses:

1. Run the Jupyter notebook to regenerate CSV files:
   ```bash
   source .venv/bin/activate
   jupyter notebook community_analysis.ipynb
   ```
2. Execute all cells to update `community_scores.csv` and `gap_analysis.csv`
3. Refresh the dashboard in your browser

---

## 🛠️ Requirements

- Python 3.x (for local server)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for loading Plotly.js and PapaParse libraries)

---

## 📞 Support

For questions about the analysis or dashboard, refer to:

- `comprehensive_report.md` - Full analysis and recommendations
- `The_island_community.md` - Survey methodology and categories

---

🏝️ **Building our community, together!**
