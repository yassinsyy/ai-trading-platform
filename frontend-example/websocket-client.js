// Frontend WebSocket client example for real-time pricing updates
// This demonstrates how to connect to the pricing WebSocket gateway

import { io } from 'socket.io-client';

class PricingWebSocketClient {
  constructor(token, options = {}) {
    this.token = token;
    this.socket = null;
    this.isConnected = false;
    this.subscriptions = new Set();
    this.options = {
      url: process.env.REACT_APP_WS_URL || 'http://localhost:3001',
      namespace: '/pricing',
      ...options,
    };
    
    this.onPriceUpdate = options.onPriceUpdate || this.defaultPriceUpdateHandler;
    this.onConnect = options.onConnect || this.defaultConnectHandler;
    this.onDisconnect = options.onDisconnect || this.defaultDisconnectHandler;
    this.onError = options.onError || this.defaultErrorHandler;
  }

  connect() {
    if (this.socket && this.isConnected) {
      console.log('Already connected');
      return;
    }

    try {
      this.socket = io(`${this.options.url}${this.options.namespace}`, {
        auth: {
          token: this.token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.onError(error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.subscriptions.clear();
    }
  }

  subscribe(marketplaceId = null, productId = null) {
    if (!this.socket || !this.isConnected) {
      console.error('Not connected to WebSocket');
      return false;
    }

    const payload = {};
    if (marketplaceId) payload.marketplaceId = marketplaceId;
    if (productId) payload.productId = productId;

    this.socket.emit('subscribe', payload, (response) => {
      if (response.success) {
        const subscriptionKey = response.subscription;
        this.subscriptions.add(subscriptionKey);
        console.log(`Subscribed to: ${subscriptionKey}`);
      } else {
        console.error('Subscription failed:', response.error);
      }
    });

    return true;
  }

  unsubscribe(marketplaceId = null, productId = null) {
    if (!this.socket || !this.isConnected) {
      return false;
    }

    const payload = {};
    if (marketplaceId) payload.marketplaceId = marketplaceId;
    if (productId) payload.productId = productId;

    this.socket.emit('unsubscribe', payload, (response) => {
      if (response.success) {
        const subscriptionKey = response.subscription;
        this.subscriptions.delete(subscriptionKey);
        console.log(`Unsubscribed from: ${subscriptionKey}`);
      }
    });

    return true;
  }

  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping', {}, (response) => {
        console.log('Ping response:', response.pong);
      });
    }
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to pricing WebSocket');
      this.onConnect();
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Disconnected from pricing WebSocket:', reason);
      this.onDisconnect(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.onError(error);
    });

    this.socket.on('pricing:update', (update) => {
      console.log('Received pricing update:', update);
      this.onPriceUpdate(update);
    });

    this.socket.on('pricing:personal', (update) => {
      console.log('Received personal pricing update:', update);
      this.onPriceUpdate(update, true);
    });
  }

  // Default event handlers
  defaultPriceUpdateHandler(update, isPersonal = false) {
    const { offerId, oldPrice, newPrice, reasonCode, timestamp } = update;
    
    // Show toast notification
    this.showToast({
      title: 'Price Update',
      message: `Offer ${offerId}: ${oldPrice} → ${newPrice}`,
      type: 'info',
      timestamp,
    });

    // Update UI if needed
    this.updatePriceInUI(offerId, newPrice, reasonCode);
  }

  defaultConnectHandler() {
    console.log('WebSocket connected successfully');
    // Auto-subscribe to general pricing updates
    this.subscribe();
  }

  defaultDisconnectHandler(reason) {
    console.log('WebSocket disconnected:', reason);
    // Could implement reconnection logic here
  }

  defaultErrorHandler(error) {
    console.error('WebSocket error:', error);
    // Could implement error handling UI updates here
  }

  // UI update methods (to be implemented by the consuming application)
  showToast(toastData) {
    // Implementation depends on your UI framework
    // Example for React with react-toastify:
    // toast.info(toastData.message, { title: toastData.title });
    console.log('Toast:', toastData);
  }

  updatePriceInUI(offerId, newPrice, reasonCode) {
    // Implementation depends on your UI framework
    // Example: Update price in a table, card, or list
    console.log(`Updating UI: Offer ${offerId} = ${newPrice} (${reasonCode})`);
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      subscriptions: Array.from(this.subscriptions),
      socketId: this.socket?.id,
    };
  }

  getSubscriptions() {
    return Array.from(this.subscriptions);
  }
}

// Usage example:
/*
const pricingClient = new PricingWebSocketClient('your-jwt-token', {
  onPriceUpdate: (update, isPersonal) => {
    // Custom price update handling
    if (isPersonal) {
      // Handle personal updates differently
      showPersonalNotification(update);
    } else {
      // Handle general updates
      updatePriceDisplay(update);
    }
  },
  onConnect: () => {
    // Subscribe to specific marketplaces/products
    pricingClient.subscribe('kaspi'); // Subscribe to Kaspi updates
    pricingClient.subscribe(null, 'product-123'); // Subscribe to specific product
  },
});

// Connect to WebSocket
pricingClient.connect();

// Later, disconnect
// pricingClient.disconnect();
*/

export default PricingWebSocketClient;
