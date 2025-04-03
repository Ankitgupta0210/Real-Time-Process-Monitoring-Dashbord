# OS Process Monitor Dashboard

A real-time operating system process monitoring dashboard that displays CPU usage, memory usage, and running processes.

## Features

- Real-time CPU and memory usage monitoring with historical charts
- Detailed process list with search functionality
- System information overview
- Color-coded process resource usage indicators
- Chrome performance Gantt chart showing:
  - Performance timeline (JavaScript execution, rendering, painting, etc.)
  - Memory usage timeline (heap allocation, garbage collection, etc.)
  - Network activity timeline (DNS lookup, TCP connection, etc.)
- Responsive design that works on desktop and mobile devices

## Implementation Details

This dashboard consists of two main components:

1. **Frontend**: HTML/CSS/JavaScript dashboard using Bootstrap, Chart.js, and Socket.io client
2. **Backend**: Node.js server using Express and Socket.io to gather system information

The dashboard works in two modes:

- **Connected mode**: Real-time data from the operating system (requires Node.js backend)
- **Simulation mode**: Simulated data when the backend is not available

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- npm (comes with Node.js)

### Setup

1. Clone or download this repository
2. Navigate to the project directory in your terminal
3. Install dependencies:

```bash
npm install
```

## Usage

### Start the server

```bash
npm start
```

This will start the server on http://localhost:3000. Open this URL in your browser to access the dashboard.

### Development mode with auto-restart

```bash
npm run dev
```

## How it Works

- The Node.js backend server collects system information using native Node.js modules and child processes.
- Real-time data is sent to the frontend using Socket.io WebSockets.
- The Chrome performance Gantt chart visualizes different aspects of Chrome's operation:
  - Performance timeline shows JavaScript execution, rendering, painting, and compositing
  - Memory timeline shows heap allocation, garbage collection, and cache usage
  - Network timeline shows DNS lookup, TCP connection, and content download
- If the server is not running or disconnects, the dashboard automatically falls back to simulation mode.

## Troubleshooting

- If you encounter EACCES errors when running on Linux/macOS, you may need to run the server with sudo or use a different port.
- For advanced process information on Windows, the dashboard may require additional tools or permissions.

## License

MIT 