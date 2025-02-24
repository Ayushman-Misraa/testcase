let peer = null;
let conn = null;

// Valid ICE servers configuration
const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
];

function initPeer() {
    peer = new Peer({
        config: { iceServers },
        debug: 2
    });

    peer.on('open', id => {
        document.getElementById('peerId').textContent = id;
        logSystem('Ready to connect');
    });

    peer.on('connection', newConn => {
        conn = newConn;
        setupConnection();
        logSystem(`Connected to ${newConn.peer}`);
    });

    peer.on('error', err => {
        logSystem(`Error: ${err.type}`, true);
    });
}

function setupConnection() {
    conn.on('data', data => {
        logMessage(`Peer: ${data}`);
    });

    conn.on('close', () => {
        logSystem('Connection closed', true);
        conn = null;
    });

    conn.on('error', err => {
        logSystem(`Connection error: ${err}`, true);
    });
}

function connect() {
    const remoteId = document.getElementById('remoteId').value.trim();
    if (!remoteId) return;

    if (conn) conn.close();
    
    conn = peer.connect(remoteId, {
        reliable: true,
        serialization: 'json'
    });

    conn.on('open', () => {
        setupConnection();
        logSystem(`Connected to ${remoteId}`);
    });

    setTimeout(() => {
        if (!conn?.open) {
            logSystem('Connection timeout', true);
            conn?.close();
        }
    }, 15000);
}

// Rest of the code remains unchanged

// Send messages
function send() {
    const msg = document.getElementById('message').value.trim();
    if (!msg || !conn) return;

    conn.send(msg);
    logMessage(`You: ${msg}`);
    document.getElementById('message').value = '';
}

// Logging utilities
function logMessage(text) {
    const messages = document.getElementById('messages');
    const timestamp = new Date().toLocaleTimeString();
    messages.innerHTML += `<div class="message"><span class="timestamp">${timestamp}</span> ${text}</div>`;
    messages.scrollTop = messages.scrollHeight;
}

function logSystem(text, isError = false) {
    const messages = document.getElementById('messages');
    const timestamp = new Date().toLocaleTimeString();
    const color = isError ? 'var(--error)' : 'var(--success)';
    messages.innerHTML += `
        <div class="system-message" style="color:${color}">
            <span class="timestamp">${timestamp}</span>
            <span class="system-icon">${isError ? '⚠️' : 'ℹ️'}</span>
            ${text}
        </div>
    `;
    messages.scrollTop = messages.scrollHeight;
}

// Initialize
document.addEventListener('DOMContentLoaded', initPeer);