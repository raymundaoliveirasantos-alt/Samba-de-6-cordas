import type { Song, Setlist, Workspace, Member, EventSchedule } from '../types';
import { findInWebChordDatabase } from '../utils/webChordsDatabase';
import { sscTags } from '../utils/sscTags';

export const WORKSPACE_ID = 'ws-ss-clarinetes';

export const initialWorkspaces: Workspace[] = [
  {
    id: WORKSPACE_ID,
    name: 'Sociedade Sonsar Clarinetes (SSC)',
    plan: 'pro_stage',
    isCurrent: true,
    createdAt: new Date().toISOString(),
  },
];

interface RepertorioEntry {
  /** número no PDF (1..47) */
  n: number;
  title: string;
  artist: string;
  key: string;
  instrument?: string;
  block: 'I' | 'II' | 'III';
}

/**
 * Repertório SSC II (2026) — extraído de "REPERTÓRIO SSC II.pdf".
 *
 * Cada linha do PDF traz: número, título, artista, instrumento solista e tom.
 * Os itens marcados com instrumento entre parênteses são intros/solos que a
 * orquestra executa — por isso viram `instrument` e não "artista".
 */
export const REPERTORIO_SSC_II: RepertorioEntry[] = [
  // ---------------------------------------------------------------- BLOCO I
  { n: 1, block: 'I', title: '(Intro) Nossa música sempre será', artist: '', key: 'Em7', instrument: 'Saxofone' },
  { n: 2, block: 'I', title: 'Afastai-nos do Mal', artist: '', key: 'Dm', instrument: 'Flauta' },
  { n: 3, block: 'I', title: 'Esperanças Perdidas', artist: 'Os Originais do Samba', key: 'Dm' },
  { n: 4, block: 'I', title: 'Não dá nada', artist: '', key: 'Am7', instrument: 'Trompete/Saxofone' },
  { n: 5, block: 'I', title: 'Tenha Fé', artist: 'Os Originais do Samba', key: 'Fm' },
  { n: 6, block: 'I', title: 'Todo achar é Torto', artist: '', key: 'Cm7', instrument: 'Saxofone' },
  { n: 7, block: 'I', title: 'Juízo Final', artist: 'Nelson Cavaquinho', key: 'Gm7' },
  { n: 8, block: 'I', title: 'Outra Chance', artist: '', key: 'Em7', instrument: 'Trompete' },
  { n: 9, block: 'I', title: 'Preciso me Encontrar', artist: 'Cartola', key: 'Dm7', instrument: 'Flauta' },
  { n: 10, block: 'I', title: 'Hoje, amanhã e Sempre', artist: '', key: 'A7', instrument: 'Trombone' },
  { n: 11, block: 'I', title: 'Alvorada', artist: 'Cartola', key: 'Fm7' },
  { n: 12, block: 'I', title: 'Gafieira', artist: '', key: 'F', instrument: 'Trombone/Flauta' },
  { n: 13, block: 'I', title: 'O Sol Nascerá (A Sorrir)', artist: 'Cartola', key: 'Cm' },
  { n: 14, block: 'I', title: 'O Criador', artist: '', key: 'Am7', instrument: 'Trombone' },
  { n: 15, block: 'I', title: 'Aos Trancos e Barrancos', artist: 'Raul Seixas', key: 'G7' },
  { n: 16, block: 'I', title: 'Tomzeira', artist: '', key: 'E7', instrument: 'Trombone' },

  // --------------------------------------------------------------- BLOCO II
  { n: 17, block: 'II', title: '(Intro 2)', artist: '', key: '??' },
  { n: 18, block: 'II', title: 'Suporte', artist: '', key: 'Bm', instrument: 'Saxofone' },
  { n: 19, block: 'II', title: 'Naquela Mesa', artist: 'Nelson Gonçalves', key: 'Dm' },
  { n: 20, block: 'II', title: 'Espelho da Ilusão', artist: '', key: 'D7', instrument: 'Trombone/Trompete' },
  { n: 21, block: 'II', title: 'As Rosas não Falam', artist: 'Cartola', key: 'Dm' },
  { n: 22, block: 'II', title: 'Harmônica', artist: '', key: 'Cm7', instrument: 'Saxofone' },
  { n: 23, block: 'II', title: 'Na Cadência do Samba', artist: 'Novos Baianos', key: 'Cm7' },
  { n: 24, block: 'II', title: 'Desempregado', artist: '', key: 'Dm7', instrument: 'Saxofone' },
  { n: 25, block: 'II', title: 'Politicar', artist: 'Tom Zé', key: 'Em7' },
  { n: 26, block: 'II', title: 'A Saga', artist: '', key: 'Fm' },
  { n: 27, block: 'II', title: 'Faixa Amarela', artist: 'Zeca Pagodinho', key: 'D' },
  { n: 28, block: 'II', title: 'Consciência Negra', artist: '', key: 'Gm7', instrument: 'Flauta' },
  { n: 29, block: 'II', title: 'Sequestraram Minha Sogra', artist: 'Bezerra da Silva', key: 'G' },
  { n: 30, block: 'II', title: 'Seis da Manhã', artist: '', key: 'C#m', instrument: 'Flauta' },
  { n: 31, block: 'II', title: 'A Flor e o Espinho', artist: 'Nelson Cavaquinho', key: 'Dm' },
  { n: 32, block: 'II', title: 'Vida Sofrida', artist: '', key: 'A7', instrument: 'Trombone' },

  // -------------------------------------------------------------- BLOCO III
  { n: 33, block: 'III', title: '(Intro 3)', artist: '', key: '??' },
  { n: 34, block: 'III', title: 'Devagar', artist: '', key: 'Em7', instrument: 'Flauta' },
  { n: 35, block: 'III', title: 'Candidato Caô Caô', artist: 'Bezerra da Silva', key: 'D7' },
  { n: 36, block: 'III', title: 'Falso Poder', artist: '', key: 'Fm' },
  { n: 37, block: 'III', title: 'Bicho Feroz', artist: 'Bezerra da Silva', key: 'G' },
  { n: 38, block: 'III', title: 'A Praça', artist: '', key: 'C' },
  { n: 39, block: 'III', title: 'Trem das Onze', artist: 'Adoniran Barbosa', key: 'Am' },
  { n: 40, block: 'III', title: 'Eclipse Total', artist: 'Marcão', key: 'Dm' },
  { n: 41, block: 'III', title: 'Tiro ao Álvaro', artist: 'Adoniran Barbosa', key: 'F7' },
  { n: 42, block: 'III', title: 'Mas Quem Disse que eu te Esqueço', artist: 'Ivone Lara', key: 'G' },
  { n: 43, block: 'III', title: 'O Samba da Minha Terra', artist: 'Novos Baianos', key: 'D' },
  { n: 44, block: 'III', title: 'Malandro Não Vacila', artist: 'Bezerra da Silva', key: 'Am' },
  { n: 45, block: 'III', title: 'Le Bolívia', artist: 'Toinho Melodia', key: 'Dm' },
  { n: 46, block: 'III', title: 'O Poder da Criação', artist: 'João Nogueira', key: 'Am7' },
  { n: 47, block: 'III', title: 'Samba-choro', artist: '', key: 'D7', instrument: 'Flauta' },
];

/** Tom menor? (usado no campo `mode` do Song) */
function isMinorKey(key: string): boolean {
  const k = key.trim();
  if (!k || k === '??') return false;
  // 'Dm', 'Dm7', 'Cm7', 'C#m', 'Am7', 'Fm' -> menor; 'F', 'G7', 'A7' -> maior
  return /^[A-G](?:#|b)?m(?:in|\d|$)/i.test(k);
}

/**
 * Monta o acervo inicial do repertório SSC II.
 *
 * As cifras vêm do banco curado (`webChordsDatabase.ts`), que foi levantado
 * na web (cifraclub/cifras.com.br) com foco na harmonização de
 * cavaquinho/violão. Quando não há cifra conhecida, a música entra como
 * `pendente` — sem inventar acordes.
 */
export const initialSongs: Song[] = REPERTORIO_SSC_II.map((entry) => {
  const now = new Date().toISOString();
  const web = findInWebChordDatabase(entry.title, entry.artist);
  const orderInBlock =
    entry.block === 'I' ? entry.n : entry.block === 'II' ? entry.n - 16 : entry.n - 32;

  return {
    id: `ssc-song-${entry.n}`,
    title: entry.title,
    artist: entry.artist,
    originalKey: entry.key,
    currentKey: entry.key,
    mode: isMinorKey(entry.key) ? 'minor' : 'major',
    bpm: web?.bpm ?? 100,
    timeSignature: web?.timeSignature ?? '2/4',
    capo: 0,
    instrument: entry.instrument,
    chordProContent: web?.chordProContent ?? '',
    tags: sscTags(entry.block, entry.instrument),
    origin: 'repertorio_pdf',
    type: 'repertorio',
    status: web ? 'rascunho' : 'pendente',
    block: entry.block,
    orderInBlock,
    notes: entry.instrument
      ? `Solo de ${entry.instrument} na orquestra.`
      : web?.notes,
    isFavorite: false,
    workspaceId: WORKSPACE_ID,
    createdAt: now,
    updatedAt: now,
  };
});

export const initialSetlists: Setlist[] = [
  {
    id: 'setlist-ssc-ii-2026',
    name: 'Repertório SSC II (2026)',
    date: '',
    location: '',
    notes:
      'Repertório oficial da Sociedade Sonsar Clarinetes — 3 blocos, 47 itens. ' +
      'Cifras levantadas na web (cavaquinho/violão). Itens sem cifra conhecida ficam como "pendente".',
    items: initialSongs.map((song, index) => ({
      songId: song.id,
      selectedKey: song.currentKey,
      capo: 0,
      order: index + 1,
      block: song.block,
    })),
    workspaceId: WORKSPACE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialMembers: Member[] = [];
export const initialEvents: EventSchedule[] = [];
