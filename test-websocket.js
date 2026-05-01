// WebSocket Connection Test
// Run this in browser console to test WebSocket connection

import { io } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

console.log('Testing WebSocket connection to:', WS_URL);

const socket = io(WS_URL, {
  auth: { token: 'test-token' }, // Replace with real JWT token
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully');
  console.log('Socket ID:', socket.id);
});

socket.on('connected', (data) => {
  console.log('✅ Server confirmed connection:', data);
});

socket.on('disconnect', (reason) => {
  console.log('❌ WebSocket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error);
});

// Test event emission
setTimeout(() => {
  console.log('Testing event emission...');
  socket.emit('test', { message: 'Hello from client' });
}, 2000);

// Listen for test response
socket.on('test_response', (data) => {
  console.log('✅ Received test response:', data);
});

// Export for manual testing
window.testSocket = socket;