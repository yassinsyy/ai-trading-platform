import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { WsThrottlerGuard } from '../common/guards/ws-throttler.guard';

export interface PricingUpdate {
  offerId: string;
  oldPrice: number;
  newPrice: number;
  reasonCode: string;
  timestamp: Date;
  marketplaceId: string;
  productId: string;
}

@WebSocketGateway({
  namespace: '/pricing',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@UseGuards(WsJwtGuard, WsThrottlerGuard)
export class PricingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PricingGateway.name);
  private readonly connectedClients = new Map<string, { socket: Socket; userId: string; subscriptions: Set<string> }>();

  afterInit(server: Server) {
    this.logger.log('Pricing WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId || client.handshake.query.userId;
    if (!userId) {
      this.logger.warn('Client connected without userId, disconnecting');
      client.disconnect();
      return;
    }

    this.connectedClients.set(client.id, {
      socket: client,
      userId: userId as string,
      subscriptions: new Set(),
    });

    this.logger.log(`Client ${client.id} (User: ${userId}) connected to pricing gateway`);
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(`Client ${client.id} (User: ${clientInfo.userId}) disconnected from pricing gateway`);
      this.connectedClients.delete(client.id);
      
      // Clean up throttler data
      // TODO: Implement proper throttling cleanup
      this.logger.debug(`Cleaning up client ${client.id} throttling data`);
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { marketplaceId?: string; productId?: string }) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) {
      return { error: 'Client not authenticated' };
    }

    // Check throttling limits
    // TODO: Implement proper throttling check
    const subscriptionCount = clientInfo.subscriptions.size;
    if (subscriptionCount > 10) {
      return { error: 'Too many subscriptions' };
    }

    const subscriptionKey = this.getSubscriptionKey(payload);
    clientInfo.subscriptions.add(subscriptionKey);
    
    // Join the room for this subscription
    client.join(subscriptionKey);
    
    this.logger.log(`Client ${client.id} subscribed to ${subscriptionKey}`);
    return { success: true, subscription: subscriptionKey };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { marketplaceId?: string; productId?: string }) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) {
      return { error: 'Client not authenticated' };
    }

    const subscriptionKey = this.getSubscriptionKey(payload);
    clientInfo.subscriptions.delete(subscriptionKey);
    
    // Leave the room for this subscription
    client.leave(subscriptionKey);
    
    // Update throttler counts
    this.updateThrottlingCounts(client.id, 'unsubscribe');
    this.logger.debug(`Updated throttling for client ${client.id}`);
    
    this.logger.log(`Client ${client.id} unsubscribed from ${subscriptionKey}`);
    return { success: true, subscription: subscriptionKey };
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    return { pong: Date.now() };
  }

  /**
   * Broadcast pricing update to all subscribed clients
   * This method is called by the PriceApplyService when prices change
   */
  broadcastPricingUpdate(update: PricingUpdate) {
    const { offerId, marketplaceId, productId } = update;
    
    // Broadcast to all clients subscribed to this marketplace
    if (marketplaceId) {
      const marketplaceRoom = `marketplace:${marketplaceId}`;
      this.server.to(marketplaceRoom).emit('pricing:update', update);
      this.logger.debug(`Broadcasted pricing update to marketplace room: ${marketplaceRoom}`);
    }
    
    // Broadcast to all clients subscribed to this product
    if (productId) {
      const productRoom = `product:${productId}`;
      this.server.to(productRoom).emit('pricing:update', update);
      this.logger.debug(`Broadcasted pricing update to product room: ${productRoom}`);
    }
    
    // Broadcast to all clients subscribed to general pricing updates
    this.server.to('pricing:general').emit('pricing:update', update);
    
    this.logger.log(`Broadcasted pricing update for offer ${offerId}: ${update.oldPrice} → ${update.newPrice}`);
  }

  /**
   * Broadcast pricing update to specific user (for personal notifications)
   */
  broadcastToUser(userId: string, update: PricingUpdate) {
    // Find all connected clients for this user
    for (const [clientId, clientInfo] of this.connectedClients.entries()) {
      if (clientInfo.userId === userId) {
        clientInfo.socket.emit('pricing:personal', update);
      }
    }
  }

  /**
   * Get subscription key for room management
   */
  private getSubscriptionKey(payload: { marketplaceId?: string; productId?: string }): string {
    if (payload.marketplaceId && payload.productId) {
      return `marketplace:${payload.marketplaceId}:product:${payload.productId}`;
    } else if (payload.marketplaceId) {
      return `marketplace:${payload.marketplaceId}`;
    } else if (payload.productId) {
      return `product:${payload.productId}`;
    } else {
      return 'pricing:general';
    }
  }

  /**
   * Get connected clients count for monitoring
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get user subscriptions for debugging
   */
  getUserSubscriptions(userId: string): string[] {
    const subscriptions: string[] = [];
    for (const clientInfo of this.connectedClients.values()) {
      if (clientInfo.userId === userId) {
        subscriptions.push(...Array.from(clientInfo.subscriptions));
      }
    }
    return subscriptions;
  }

  /**
   * Update throttling counts for client actions
   */
  private updateThrottlingCounts(clientId: string, action: 'subscribe' | 'unsubscribe'): void {
    // This method can be used to track client actions for throttling purposes
    // Currently a placeholder for future throttling implementation
    this.logger.debug(`Throttling count updated for client ${clientId}, action: ${action}`);
  }
}
