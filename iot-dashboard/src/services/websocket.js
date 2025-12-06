import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.subscribers = new Map();
    this.API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(this.API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      toast.error('Failed to connect to real-time updates');
    });

    // Set up event listeners for subscribed events
    this.subscribers.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, callback);
      if (this.socket?.connected) {
        this.socket.on(event, callback);
      }
    }
  }

  unsubscribe(event) {
    if (this.subscribers.has(event)) {
      if (this.socket?.connected) {
        this.socket.off(event, this.subscribers.get(event));
      }
      this.subscribers.delete(event);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }
}

export default new WebSocketService(); 