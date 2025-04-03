// Server for OS Process Monitoring Dashboard
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Function to convert bytes to readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format uptime in a readable way
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor(((uptime % 86400) % 3600) / 60);
  
  return `${days} days, ${hours} hours, ${minutes} minutes`;
}

// Get system information
function getSystemInfo() {
  return {
    osType: `${os.type()} ${os.release()}`,
    hostname: os.hostname(),
    uptime: formatUptime(os.uptime()),
    arch: os.arch(),
    totalMemory: formatBytes(os.totalmem()),
    cpuCores: os.cpus().length
  };
}

// Get current CPU and memory usage
function getResourceUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsage = (usedMem / totalMem) * 100;
  
  // Get CPU idle time for each core
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  
  // Calculate average CPU usage across all cores
  const cpuUsage = 100 - (totalIdle / totalTick) * 100;
  
  return {
    cpuUsage: cpuUsage.toFixed(1),
    memoryUsage: memoryUsage.toFixed(1)
  };
}

// Windows: Get processes using tasklist command
function getWindowsProcesses() {
  return new Promise((resolve, reject) => {
    exec('tasklist /FO CSV /NH', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      const processes = [];
      const lines = stdout.trim().split('\n');
      
      lines.forEach(line => {
        // Parse CSV format from tasklist
        const match = line.match(/"([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)"/);
        if (match) {
          const name = match[1];
          const pid = parseInt(match[2], 10);
          const memUsage = match[4].replace(/,/g, '').replace(/\s+K/g, '');
          
          processes.push({
            pid,
            name,
            memory: ((parseInt(memUsage, 10) * 1024) / os.totalmem() * 100).toFixed(1),
            cpu: (Math.random() * 5).toFixed(1), // Windows doesn't provide CPU in tasklist, using random value
            status: 'Running',
            started: new Date().toLocaleString() // Windows doesn't provide start time in basic tasklist
          });
        }
      });
      
      // Sort by memory usage
      processes.sort((a, b) => parseFloat(b.memory) - parseFloat(a.memory));
      
      resolve(processes.slice(0, 50)); // Limit to top 50 processes
    });
  });
}

// Unix/Linux: Get processes using ps command
function getUnixProcesses() {
  return new Promise((resolve, reject) => {
    exec('ps -eo pid,pcpu,pmem,state,time,comm --sort=-pcpu | head -n 51', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      const processes = [];
      const lines = stdout.trim().split('\n');
      
      // Skip the header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        const parts = line.split(/\s+/);
        
        if (parts.length >= 6) {
          processes.push({
            pid: parseInt(parts[0], 10),
            cpu: parseFloat(parts[1]).toFixed(1),
            memory: parseFloat(parts[2]).toFixed(1),
            status: parts[3],
            started: parts[4], // Actually runtime, not start time
            name: parts.slice(5).join(' ')
          });
        }
      }
      
      resolve(processes);
    });
  });
}

// Get processes based on platform
async function getProcesses() {
  try {
    if (os.platform() === 'win32') {
      return await getWindowsProcesses();
    } else {
      return await getUnixProcesses();
    }
  } catch (error) {
    console.error('Error getting processes:', error);
    return [];
  }
}

// Generate Chrome performance data
function generateChromeData() {
  const chromeData = {
    performance: [],
    memory: [],
    network: []
  };
  
  // Performance tasks
  const performanceTasks = [
    { name: 'JavaScript Execution', color: '#4285F4' },
    { name: 'Rendering', color: '#34A853' },
    { name: 'Painting', color: '#FBBC05' },
    { name: 'Compositing', color: '#EA4335' },
    { name: 'Idle', color: '#9E9E9E' }
  ];
  
  // Memory tasks
  const memoryTasks = [
    { name: 'Heap Allocation', color: '#4285F4' },
    { name: 'Garbage Collection', color: '#34A853' },
    { name: 'Memory Leak', color: '#EA4335' },
    { name: 'Cache Usage', color: '#FBBC05' }
  ];
  
  // Network tasks
  const networkTasks = [
    { name: 'DNS Lookup', color: '#4285F4' },
    { name: 'TCP Connection', color: '#34A853' },
    { name: 'TLS Negotiation', color: '#FBBC05' },
    { name: 'Request/Response', color: '#EA4335' },
    { name: 'Content Download', color: '#9C27B0' }
  ];
  
  // Chrome processes
  const chromeProcesses = [
    'Chrome Main',
    'Chrome GPU',
    'Chrome Renderer',
    'Chrome Utility',
    'Chrome Extension'
  ];
  
  // Generate data for each Chrome process
  chromeProcesses.forEach(process => {
    // Performance data
    let startTime = 0;
    const performanceData = performanceTasks.map(task => {
      const duration = Math.floor(Math.random() * 500) + 100;
      const data = {
        process,
        task: task.name,
        startTime,
        duration,
        color: task.color
      };
      startTime += duration;
      return data;
    });
    chromeData.performance.push(...performanceData);
    
    // Memory data
    startTime = 0;
    const memoryData = memoryTasks.map(task => {
      const duration = Math.floor(Math.random() * 300) + 50;
      const data = {
        process,
        task: task.name,
        startTime,
        duration,
        color: task.color
      };
      startTime += duration;
      return data;
    });
    chromeData.memory.push(...memoryData);
    
    // Network data
    startTime = 0;
    const networkData = networkTasks.map(task => {
      const duration = Math.floor(Math.random() * 400) + 50;
      const data = {
        process,
        task: task.name,
        startTime,
        duration,
        color: task.color
      };
      startTime += duration;
      return data;
    });
    chromeData.network.push(...networkData);
  });
  
  return chromeData;
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send initial system info
  socket.emit('systemInfo', getSystemInfo());
  
  // Send initial Chrome data
  socket.emit('chromeData', generateChromeData());
  
  // Send resource updates at intervals
  const resourceInterval = setInterval(async () => {
    try {
      const resourceData = getResourceUsage();
      socket.emit('resourceUpdate', resourceData);
      
      // Send process list every 5 seconds
      if (Math.floor(Date.now() / 1000) % 5 === 0) {
        const processes = await getProcesses();
        socket.emit('processUpdate', processes);
      }
      
      // Send Chrome data every 10 seconds
      if (Math.floor(Date.now() / 1000) % 10 === 0) {
        socket.emit('chromeData', generateChromeData());
      }
    } catch (error) {
      console.error('Error sending updates:', error);
    }
  }, 1000);
  
  // Clean up on disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(resourceInterval);
  });
});

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
}); 