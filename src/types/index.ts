export type SongType = 'autoral' | 'repertorio' | 'instrumental' | 'a_definir';
export type SongStatus = 'pendente' | 'rascunho' | 'revisado' | 'pronto';
export type SongOrigin = 'manual' | 'file' | 'scan' | 'sugestao_ia' | 'repertorio_pdf';

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  currentKey: string;
  mode: 'major' | 'minor';
  bpm: number;
  timeSignature: string;
  capo: number;
  instrument?: string;
  chordProContent: string;
  tags: string[];
  origin: SongOrigin;
  type: SongType;
  status: SongStatus;
  block?: 'I' | 'II' | 'III';
  orderInBlock?: number;
  notes?: string;
  isFavorite: boolean;
  youtubeUrl?: string;
  audioPlaybackUrl?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SetlistItem {
  songId: string;
  selectedKey: string;
  capo: number;
  leaderNotes?: string;
  order: number;
  block?: string;
}

export interface Setlist {
  id: string;
  name: string;
  date: string;
  location: string;
  notes: string;
  items: SetlistItem[];
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: 'free' | 'pro_stage';
  isCurrent: boolean;
  createdAt: string;
}

export type MemberRole =
  | 'voz'
  | 'violao'
  | 'guitarra'
  | 'baixo'
  | 'teclado'
  | 'bateria'
  | 'sax'
  | 'flauta'
  | 'trompete'
  | 'trombone'
  | 'som'
  | 'projecao';

export type MemberStatus = 'ativo' | 'convite_pendente' | 'inativo';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: MemberRole;
  status: MemberStatus;
  workspaceId: string;
  inviteCode?: string;
  avatarColor?: string;
}

export interface EventSchedule {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  setlistId: string;
  assignedMemberIds: string[];
  confirmedMemberIds: string[];
  notes: string;
  workspaceId: string;
}

export interface ImportJob {
  id: string;
  fileName: string;
  fileType: string;
  status: 'completed' | 'with_warnings' | 'failed';
  log: string;
  parsedSongsCount: number;
  createdAt: string;
}

export interface UserPreferences {
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  lineHeight: 'compact' | 'normal' | 'relaxed';
  theme: 'dark' | 'light' | 'stage';
  showChords: boolean;
  showDiagrams: boolean;
  instrument: 'violao' | 'teclado' | 'baixo' | 'ukulele';
  useNashvilleNumbers: boolean;
  autoScrollSpeed: number;
}
