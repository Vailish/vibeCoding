import io from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

class SocketManager {
  constructor() {
    this.socket = null;
    this.currentRoom = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(WS_URL);
      
      this.socket.on('connect', () => {
        console.log('Connected to server');
      });
      
      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
    return this.socket;
  }

  joinRoom(eventCode) {
    if (this.socket && this.currentRoom !== eventCode) {
      this.socket.emit('join-room', eventCode);
      this.currentRoom = eventCode;
    }
  }

  onNewUpload(callback) {
    if (this.socket) {
      this.socket.on('new_upload', callback);
    }
  }

  onLikeUpdate(callback) {
    if (this.socket) {
      this.socket.on('like_update', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoom = null;
    }
  }
}

export default new SocketManager();