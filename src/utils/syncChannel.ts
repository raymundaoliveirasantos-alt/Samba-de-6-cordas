// Real-time synchronization between browser tabs/windows using BroadcastChannel (Local Demo)

export interface SyncMessage {
  type: 'CURRENT_SONG_CHANGED' | 'SLIDE_CHANGED' | 'SETLIST_UPDATED' | 'SCROLL_SYNC';
  payload: any;
  senderTabId: string;
  timestamp: number;
}

const CHANNEL_NAME = 'cifraviva_live_sync';
const currentTabId = 'tab_' + Math.random().toString(36).substring(2, 9);

class LiveSyncChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        const msg = event.data as SyncMessage;
        // Ignore messages sent by self
        if (msg && msg.senderTabId !== currentTabId) {
          this.listeners.forEach((fn) => fn(msg));
        }
      };
    }
  }

  public broadcast(type: SyncMessage['type'], payload: any) {
    if (!this.channel) return;
    const message: SyncMessage = {
      type,
      payload,
      senderTabId: currentTabId,
      timestamp: Date.now(),
    };
    try {
      this.channel.postMessage(message);
    } catch (e) {
      console.warn('BroadcastChannel send error:', e);
    }
  }

  public subscribe(callback: (msg: SyncMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }

  public getTabId(): string {
    return currentTabId;
  }
}

export const liveSync = new LiveSyncChannel();
