import type { Song, Setlist, Workspace, Member, EventSchedule } from '../types';

export const WORKSPACE_ID = 'ws-my-band';

export const initialWorkspaces: Workspace[] = [
  {
    id: WORKSPACE_ID,
    name: 'Minha Banda',
    plan: 'free',
    isCurrent: true,
    createdAt: new Date().toISOString(),
  },
];

export const initialSongs: Song[] = [];
export const initialSetlists: Setlist[] = [];
export const initialMembers: Member[] = [];
export const initialEvents: EventSchedule[] = [];
