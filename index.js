document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard
  initializeDashboard();
});

function initializeDashboard() {
  // Create main container
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="container-fluid dashboard">
      <header class="mb-4">
        <h1 class="text-center mt-3">OS Process Monitor Dashboard</h1>
        <p class="text-center text-muted">Real-time system performance metrics</p>
      </header>
      
      <div class="row">
        <!-- System overview -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">System Overview</div>
            <div class="card-body">
              <div id="system-info" class="system-info">
                <div class="info-item">
                  <strong>OS:</strong> <span id="os-type">-</span>
                </div>
                <div class="info-item">
                  <strong>Hostname:</strong> <span id="hostname">-</span>
                </div>
                <div class="info-item">
                  <strong>Uptime:</strong> <span id="uptime">-</span>
                </div>
                <div class="info-item">
                  <strong>Architecture:</strong> <span id="arch">-</span>
                </div>
                <div class="info-item">
                  <strong>Total Memory:</strong> <span id="total-memory">-</span>
                </div>
                <div class="info-item">
                  <strong>Cores:</strong> <span id="cpu-cores">-</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Key metrics -->
          <div class="row">
            <div class="col-6">
              <div class="card metric-card">
                <div class="metric-value" id="cpu-usage">0%</div>
                <div class="metric-label">CPU Usage</div>
              </div>
            </div>
            <div class="col-6">
              <div class="card metric-card">
                <div class="metric-value" id="memory-usage">0%</div>
                <div class="metric-label">Memory Usage</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- CPU & Memory charts -->
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">CPU Usage History</div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="cpu-chart"></canvas>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">Memory Usage History</div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="memory-chart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Process table -->
      <div class="row mt-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Running Processes</span>
              <input type="text" id="process-search" class="form-control form-control-sm w-25" placeholder="Search processes...">
            </div>
            <div class="card-body p-0">
              <div class="process-list">
                <table class="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>Name</th>
                      <th>CPU %</th>
                      <th>Memory %</th>
                      <th>Status</th>
                      <th>Started</th>
                    </tr>
                  </thead>
                  <tbody id="process-table-body">
                    <!-- Process rows will be inserted here -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize charts
  initializeCharts();
  
  // Set up simulated data (since we don't have actual backend)
  simulateData();
  
  // Set up process search filtering
  document.getElementById('process-search').addEventListener('input', (e) => {
    filterProcesses(e.target.value);
  });
}

let cpuChart, memoryChart;
let processData = [];
let chartData = {
  cpuData: Array(20).fill(0),
  memoryData: Array(20).fill(0),
  labels: Array(20).fill('')
};

function initializeCharts() {
  // CPU Chart
  const cpuCtx = document.getElementById('cpu-chart').getContext('2d');
  cpuChart = new Chart(cpuCtx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'CPU Usage %',
        data: chartData.cpuData,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Percentage'
          }
        }
      },
      animation: {
        duration: 500
      }
    }
  });
  
  // Memory Chart
  const memoryCtx = document.getElementById('memory-chart').getContext('2d');
  memoryChart = new Chart(memoryCtx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Memory Usage %',
        data: chartData.memoryData,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Percentage'
          }
        }
      },
      animation: {
        duration: 500
      }
    }
  });
}

function updateCharts(cpuUsage, memoryUsage) {
  const now = new Date();
  const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0') + ':' + 
                    now.getSeconds().toString().padStart(2, '0');
  
  // Update chart data arrays
  chartData.cpuData.push(cpuUsage);
  chartData.cpuData.shift();
  
  chartData.memoryData.push(memoryUsage);
  chartData.memoryData.shift();
  
  chartData.labels.push(timeString);
  chartData.labels.shift();
  
  // Update charts
  cpuChart.update();
  memoryChart.update();
  
  // Update metric cards
  document.getElementById('cpu-usage').textContent = cpuUsage.toFixed(1) + '%';
  document.getElementById('memory-usage').textContent = memoryUsage.toFixed(1) + '%';
}

function simulateData() {
  // System info - simulated
  const systemInfo = {
    osType: 'Windows 10 Pro',
    hostname: 'USER-PC',
    uptime: '2 days, 5 hours',
    arch: 'x64',
    totalMemory: '16 GB',
    cpuCores: '8'
  };
  
  // Update system info
  document.getElementById('os-type').textContent = systemInfo.osType;
  document.getElementById('hostname').textContent = systemInfo.hostname;
  document.getElementById('uptime').textContent = systemInfo.uptime;
  document.getElementById('arch').textContent = systemInfo.arch;
  document.getElementById('total-memory').textContent = systemInfo.totalMemory;
  document.getElementById('cpu-cores').textContent = systemInfo.cpuCores;
  
  // Generate random process data initially
  generateProcessData();
  updateProcessTable();
  
  // Update data every 2 seconds
  setInterval(() => {
    // Generate new CPU and memory usage values
    const cpuUsage = Math.min(95, Math.max(5, Math.random() * 50 + (Math.sin(Date.now() / 10000) * 20 + 20)));
    const memoryUsage = Math.min(95, Math.max(10, Math.random() * 30 + (Math.cos(Date.now() / 12000) * 15 + 40)));
    
    // Update charts
    updateCharts(cpuUsage, memoryUsage);
    
    // Update process data
    updateProcessData();
    updateProcessTable();
  }, 2000);
}

function generateProcessData() {
  const processNames = [
    'chrome.exe', 'firefox.exe', 'explorer.exe', 'svchost.exe', 
    'devenv.exe', 'node.exe', 'postgres.exe', 'slack.exe',
    'code.exe', 'outlook.exe', 'teams.exe', 'discord.exe', 
    'spotify.exe', 'msedge.exe', 'powershell.exe', 'cmd.exe',
    'winword.exe', 'excel.exe', 'photoshop.exe', 'notepad.exe'
  ];
  
  processData = [];
  const now = new Date();
  
  // Generate 30-40 processes
  const processCount = Math.floor(Math.random() * 10) + 30;
  
  for (let i = 0; i < processCount; i++) {
    const startTime = new Date(now - Math.random() * 86400000 * 3); // Up to 3 days ago
    const startTimeStr = startTime.toLocaleString();
    
    processData.push({
      pid: Math.floor(Math.random() * 10000) + 1000,
      name: processNames[Math.floor(Math.random() * processNames.length)],
      cpu: Math.random() * 5, // Most processes use very little CPU
      memory: Math.random() * 2,
      status: Math.random() > 0.9 ? 'Suspended' : 'Running',
      started: startTimeStr
    });
  }
  
  // Add a few high-usage processes
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * processData.length);
    processData[idx].cpu = Math.random() * 20 + 15; // 15-35%
    processData[idx].memory = Math.random() * 10 + 5; // 5-15%
  }
  
  // Sort by CPU usage, descending
  processData.sort((a, b) => b.cpu - a.cpu);
}

function updateProcessData() {
  // Update CPU and memory values for each process
  processData.forEach(process => {
    // CPU usage changes more rapidly
    const cpuChange = (Math.random() * 6) - 3; // -3 to +3 percent change
    process.cpu = Math.max(0.1, Math.min(95, process.cpu + cpuChange));
    
    // Memory changes more slowly
    const memoryChange = (Math.random() * 2) - 0.5; // -0.5 to +1.5 percent change
    process.memory = Math.max(0.1, Math.min(50, process.memory + memoryChange));
    
    // Occasionally change status
    if (Math.random() > 0.98) {
      process.status = process.status === 'Running' ? 'Suspended' : 'Running';
    }
  });
  
  // Sort by CPU usage, descending
  processData.sort((a, b) => b.cpu - a.cpu);
}

function updateProcessTable() {
  const tableBody = document.getElementById('process-table-body');
  const searchTerm = document.getElementById('process-search').value.toLowerCase();
  tableBody.innerHTML = '';
  
  const filteredProcesses = processData.filter(process => 
    process.name.toLowerCase().includes(searchTerm) || 
    process.pid.toString().includes(searchTerm)
  );
  
  filteredProcesses.forEach(process => {
    const row = document.createElement('tr');
    
    // Determine CSS class based on resource usage
    let cpuClass = '';
    if (process.cpu > 20) cpuClass = 'high-usage';
    else if (process.cpu > 10) cpuClass = 'medium-usage';
    else cpuClass = 'low-usage';
    
    let memoryClass = '';
    if (process.memory > 10) memoryClass = 'high-usage';
    else if (process.memory > 5) memoryClass = 'medium-usage';
    else memoryClass = 'low-usage';
    
    row.innerHTML = `
      <td>${process.pid}</td>
      <td>${process.name}</td>
      <td class="${cpuClass}">${process.cpu.toFixed(1)}%</td>
      <td class="${memoryClass}">${process.memory.toFixed(1)}%</td>
      <td>${process.status}</td>
      <td>${process.started}</td>
    `;
    
    tableBody.appendChild(row);
  });
}

function filterProcesses(searchTerm) {
  updateProcessTable(); // The search logic is handled in updateProcessTable
} 