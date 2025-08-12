# WebSocket Implementation for Real-time Pricing Updates

This module provides real-time pricing updates via WebSocket connections, allowing the frontend to receive instant notifications when prices change.

## Architecture

### Components

1. **PricingGateway** (`pricing.gateway.ts`)
   - Main WebSocket gateway handling connections and message routing
   - Manages client subscriptions and room-based broadcasting
   - Implements connection lifecycle hooks

2. **WsJwtGuard** (`../auth/guards/ws-jwt.guard.ts`)
   - Authenticates WebSocket connections using JWT tokens
   - Supports multiple token sources (headers, query params, auth object)

3. **WsThrottlerGuard** (`../common/guards/ws-throttler.guard.ts`)
   - Rate limits connections, messages, and subscriptions
   - Prevents abuse and ensures system stability

### Connection Flow

1. Client connects with JWT token
2. Token is validated by `WsJwtGuard`
3. Connection is rate-limited by `WsThrottlerGuard`
4. Client subscribes to specific channels (marketplace, product, or general)
5. Client receives real-time updates via subscribed channels

## API Reference

### Connection

```javascript
// Connect to WebSocket with JWT token
const socket = io('http://localhost:3001/pricing', {
  auth: { token: 'your-jwt-token' }
});
```

### Subscription

```javascript
// Subscribe to all pricing updates
socket.emit('subscribe', {}, callback);

// Subscribe to specific marketplace
socket.emit('subscribe', { marketplaceId: 'kaspi' }, callback);

// Subscribe to specific product
socket.emit('subscribe', { productId: 'product-123' }, callback);

// Subscribe to marketplace + product combination
socket.emit('subscribe', { 
  marketplaceId: 'kaspi', 
  productId: 'product-123' 
}, callback);
```

### Unsubscription

```javascript
// Unsubscribe from specific channel
socket.emit('unsubscribe', { marketplaceId: 'kaspi' }, callback);
```

### Events

#### Incoming Events

- `pricing:update` - General pricing update
- `pricing:personal` - Personal pricing update for specific user

#### Event Payload

```typescript
interface PricingUpdate {
  offerId: string;
  oldPrice: number;
  newPrice: number;
  reasonCode: string;
  timestamp: Date;
  marketplaceId: string;
  productId: string;
}
```

### Utility

```javascript
// Ping the server
socket.emit('ping', {}, (response) => {
  console.log('Server time:', response.pong);
});
```

## Room Management

The gateway uses Socket.IO rooms for efficient message routing:

- `pricing:general` - All pricing updates
- `marketplace:{id}` - Updates for specific marketplace
- `product:{id}` - Updates for specific product
- `marketplace:{id}:product:{id}` - Updates for specific marketplace + product

## Security Features

### Authentication
- JWT token validation on connection
- User ID extraction and attachment to socket
- Automatic disconnection for unauthenticated clients

### Rate Limiting
- Max 5 connections per IP per minute
- Max 100 messages per client per minute
- Max 50 subscriptions per client
- Automatic cleanup of old connection records

### Throttling
- Connection throttling per IP address
- Message throttling per client
- Subscription count limiting

## Integration

### Backend Integration

The `PriceApplyService` automatically broadcasts updates:

```typescript
// In PriceApplyService.applyPrice()
const pricingUpdate: PricingUpdate = {
  offerId: offer.id,
  oldPrice: oldPrice,
  newPrice: appliedPrice,
  reasonCode: 'PRICE_APPLIED',
  timestamp: new Date(),
  marketplaceId: offer.marketplaceAccountId,
  productId: offer.productId,
};

this.pricingGateway.broadcastPricingUpdate(pricingUpdate);
```

### Frontend Integration

Use the provided `PricingWebSocketClient` class:

```javascript
import PricingWebSocketClient from './websocket-client';

const client = new PricingWebSocketClient('jwt-token', {
  onPriceUpdate: (update) => {
    // Handle price updates
    showPriceChangeNotification(update);
    updatePriceDisplay(update.offerId, update.newPrice);
  }
});

client.connect();
client.subscribe('kaspi'); // Subscribe to Kaspi updates
```

## Configuration

### Environment Variables

```bash
# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT secret
JWT_SECRET=your-secret-key
```

### CORS Settings

The gateway is configured with CORS support for development and production:

```typescript
@WebSocketGateway({
  namespace: '/pricing',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
```

## Monitoring

### Connection Statistics

```typescript
// Get connected clients count
const clientCount = gateway.getConnectedClientsCount();

// Get user subscriptions
const subscriptions = gateway.getUserSubscriptions('user-id');

// Get throttling statistics
const throttlingStats = throttlerGuard.getThrottlingStats();
```

### Logging

The gateway provides comprehensive logging:
- Connection/disconnection events
- Subscription changes
- Broadcasting events
- Error conditions

## Testing

Run the WebSocket tests:

```bash
npm test -- pricing.gateway.spec.ts
```

The tests cover:
- Connection lifecycle
- Subscription management
- Broadcasting functionality
- Error handling

## Performance Considerations

### Scalability
- Room-based broadcasting for efficient message routing
- Automatic cleanup of disconnected clients
- Rate limiting to prevent abuse

### Memory Management
- Automatic cleanup of old connection records
- Subscription count limits
- Cache size management for idempotency

### Network Optimization
- Efficient room-based message distribution
- Minimal payload size
- Connection pooling support

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check JWT token validity
   - Verify CORS settings
   - Check network connectivity

2. **No Updates Received**
   - Verify subscription to correct channels
   - Check authentication status
   - Verify backend broadcasting

3. **Rate Limiting**
   - Reduce connection frequency
   - Implement exponential backoff
   - Check subscription limits

### Debug Mode

Enable debug logging:

```typescript
// In PricingGateway
this.logger.setLogLevel('debug');
```

## Future Enhancements

- Redis adapter for horizontal scaling
- Message persistence for offline clients
- Advanced filtering and querying
- Metrics and analytics dashboard
- Webhook integration for external systems
