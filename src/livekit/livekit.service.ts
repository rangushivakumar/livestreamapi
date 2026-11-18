import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private get config() {
    const url = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!url || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException('LiveKit is not configured');
    }
    return { url, apiKey, apiSecret };
  }

  async createRoom(roomName: string): Promise<void> {
    const { url, apiKey, apiSecret } = this.config;
    const client = new RoomServiceClient(url, apiKey, apiSecret);
    await client.createRoom({ name: roomName });
  }

  async deleteRoom(roomName: string): Promise<void> {
    const { url, apiKey, apiSecret } = this.config;
    const client = new RoomServiceClient(url, apiKey, apiSecret);
    await client.deleteRoom(roomName);
  }

  async createStreamerToken(roomName: string, userId: number): Promise<string> {
    return this.createToken(roomName, userId, true);
  }

  async createViewerToken(roomName: string, userId: number): Promise<string> {
    return this.createToken(roomName, userId, false);
  }

  getServerUrl(): string {
    return this.config.url;
  }

  private async createToken(
    roomName: string,
    userId: number,
    canPublish: boolean,
  ): Promise<string> {
    const { apiKey, apiSecret } = this.config;
    const token = new AccessToken(apiKey, apiSecret, {
      identity: `user_${userId}`,
      ttl: '10m',
    });
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
    });
    return token.toJwt();
  }
}
