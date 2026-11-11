import Dexie, { type Table } from 'dexie';
import type { Song, Setlist, Workspace, Member, EventSchedule, ImportJob } from '../types';
import { initialSongs, initialSetlists, initialWorkspaces, initialMembers, initialEvents } from './seed';

export class CifraVivaDatabase extends Dexie {
  songs!: Table<Song, string>;
  setlists!: Table<Setlist, string>;
  workspaces!: Table<Workspace, string>;
  members!: Table<Member, string>;
  events!: Table<EventSchedule, string>;
  importJobs!: Table<ImportJob, string>;

  constructor() {
    super('CifraVivaDB');
    this.version(1).stores({
      songs: 'id, title, artist, originalKey, type, status, block, workspaceId, isFavorite, updatedAt',
      setlists: 'id, name, date, workspaceId, updatedAt',
      workspaces: 'id, name, plan, isCurrent',
      members: 'id, name, email, role, status, workspaceId',
      events: 'id, title, date, setlistId, workspaceId',
      importJobs: 'id, fileName, status, createdAt',
    });
  }
}

export const db = new CifraVivaDatabase();

// Initialize database with initial seeds if empty
export async function initializeDatabase() {
  try {
    const workspaceCount = await db.workspaces.count();
    if (workspaceCount === 0) {
      console.log('Populando banco inicial CifraViva com sementes...');
      await db.workspaces.bulkAdd(initialWorkspaces);
      await db.songs.bulkAdd(initialSongs);
      await db.setlists.bulkAdd(initialSetlists);
      await db.members.bulkAdd(initialMembers);
      await db.events.bulkAdd(initialEvents);
      console.log('Banco de dados inicializado com sucesso.');
    }
  } catch (error) {
    console.error('Erro ao inicializar banco Dexie:', error);
  }
}


