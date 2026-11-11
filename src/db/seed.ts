import type { Song, Setlist, Workspace, Member, EventSchedule } from '../types';

export const WORKSPACE_ID = 'ws-ss-clarinetes';

export const initialWorkspaces: Workspace[] = [
  {
    id: WORKSPACE_ID,
    name: 'SS Clarinetes / Equipe de Louvor',
    plan: 'pro_stage',
    isCurrent: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ws-projeto-acustico',
    name: 'Projeto Acústico Alternativo',
    plan: 'free',
    isCurrent: false,
    createdAt: new Date().toISOString(),
  },
];

// Rich ChordPro songs for immediate interactive demonstration (Public Domain hymns)
const demoRichSongs: Song[] = [
  {
    id: 'song-amazing-grace',
    title: 'Amazing Grace (Graça Maravilhosa)',
    artist: 'John Newton (Domínio Público)',
    originalKey: 'G',
    currentKey: 'G',
    mode: 'major',
    bpm: 76,
    timeSignature: '3/4',
    capo: 0,
    instrument: 'Violão',
    tags: ['Hino', 'Adoração', 'Domínio Público'],
    origin: 'manual',
    type: 'repertorio',
    status: 'pronto',
    notes: 'Arranjo com violão dedilhado e entrada suave dos sopros no refrão.',
    isFavorite: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=CDdvReNKKuk',
    workspaceId: WORKSPACE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chordProContent: `{title: Amazing Grace (Graça Maravilhosa)}
{artist: John Newton}
{key: G}
{tempo: 76}
{time: 3/4}

{comment: Intro: [G] [D/F#] [Em] [C] [G/D] [D7] [G]}

[G]Amazing [G7]grace, how [C]sweet the [G]sound
That saved a [Em]wretch like [D]me! [D7]
I [G]once was [G7]lost, but [C]now am [G]found,
Was blind, but [D7]now I [G]see.

{soc}
{comment: Refrão / Verso 2}
'Twas [G]grace that [G7]taught my [C]heart to [G]fear,
And grace my [Em]fears re[D]lieved; [D7]
How [G]precious [G7]did that [C]grace ap[G]pear
The hour I [D7]first be[G]lieved!
{eoc}

{comment: Ponte Suave}
Through [G]many [G7]dangers, [C]toils and [G]snares
I have al[Em]ready [D]come; [D7]
'Tis [G]grace hath [G7]brought me [C]safe thus [G]far,
And grace will [D7]lead me [G]home.

{comment: Final: [C] [G/B] [Am7] [D7] [G]}`,
  },
  {
    id: 'song-santo-santo',
    title: 'Santo, Santo, Santo (Holy, Holy, Holy)',
    artist: 'Reginald Heber & John B. Dykes (Domínio Público)',
    originalKey: 'D',
    currentKey: 'D',
    mode: 'major',
    bpm: 88,
    timeSignature: '4/4',
    capo: 0,
    instrument: 'Teclado',
    tags: ['Hino', 'Clássico', 'Louvor'],
    origin: 'manual',
    type: 'repertorio',
    status: 'pronto',
    notes: 'Ideal para abertura de culto. Sustentar os pads e marcar com metais no refrão.',
    isFavorite: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=0k1Wh5F3KKY',
    workspaceId: WORKSPACE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chordProContent: `{title: Santo, Santo, Santo}
{artist: Reginald Heber}
{key: D}
{tempo: 88}
{time: 4/4}

{comment: Intro: [D] [A/C#] [Bm] [G] [D/A] [A7] [D]}

[D]Santo! [Bm]Santo! [A]San[D]to! [G]Deus Onipo[D]tente!
[A/C#]Cedo de ma[Bm]nhã can[A]taremos [E7]Teu lou[A]vor [A7]
[D]Santo! [Bm]Santo! [A]San[D]to! [G]Justo e com[D]passivo!
[Bm]Deus em três [G]Pessoas, [D]Benção [A7]Trin[D]dour!

{soc}
{comment: Refrão}
[D]Santo! [Bm]Santo! [A]San[D]to! [G]Todos os re[D]midos,
[A/C#]Juntos com os [Bm]anjos, [A]prostrados [E7]ante [A]Ti [A7]
[D]Lançam suas co[Bm]roas [A]ante o [G]mar de [D]vidro,
[Bm]Tu que foste, e [G]és, e [D]para sem[A7]pre hás [D]de ser!
{eoc}`,
  },
  {
    id: 'song-cantai-ao-senhor',
    title: 'Cantai ao Senhor (Salmo 96)',
    artist: 'Tradicional (Domínio Público)',
    originalKey: 'C',
    currentKey: 'C',
    mode: 'major',
    bpm: 110,
    timeSignature: '4/4',
    capo: 0,
    instrument: 'Saxofone',
    tags: ['Salmo', 'Júbilo', 'Samba-Louvor'],
    origin: 'manual',
    type: 'repertorio',
    status: 'pronto',
    notes: 'Ritmo alegre com levada sincopada de choro/samba. Solo de sax na introdução.',
    isFavorite: false,
    workspaceId: WORKSPACE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chordProContent: `{title: Cantai ao Senhor}
{artist: Tradicional}
{key: C}
{tempo: 110}
{time: 4/4}

{comment: Intro de Sax: [C] [C7M] [F7M] [G7] [C] [Am7] [Dm7] [G7]}

[C]Can[C7M]tai ao Se[F7M]nhor um [G7]cântico [C]novo, [Am7]
Can[Dm7]tai ao Se[G7]nhor todas as [C]terras! [G7]
[C]Procla[C7M]mai a Sua [F7M]salvação de [G7]dia em [C]dia, [Am7]
Anun[Dm7]ciai entre as na[G7]ções a Sua [C]glória!

{soc}
{comment: Refrão}
Porque [F]grande é o Se[G/F]nhor e mui [Em7]digno de lou[Am7]vor,
Mais te[Dm7]mível que to[G7]dos os de[C]uses! [C7]
Porque [F]grande é o Se[G/F]nhor e mui [Em7]digno de lou[Am7]vor,
Can[Dm7]tai ao Se[G7]nhor com ale[C]gria!
{eoc}`,
  },
];

// The exact 47 songs from REPERTÓRIO SSC II — 2026
interface RawSongEntry {
  num: number;
  block: 'I' | 'II' | 'III';
  title: string;
  artist: string;
  obs: string;
  tom: string;
  tipo: 'A' | 'R' | '?';
}

const rawList: RawSongEntry[] = [
  { num: 1, block: 'I', title: '(Intro) Nossa música sempre será', artist: '', obs: 'Saxofone', tom: 'Em7', tipo: 'A' },
  { num: 2, block: 'I', title: 'Afastai-nos do Mal', artist: '', obs: 'Flauta', tom: 'Dm', tipo: 'A' },
  { num: 3, block: 'I', title: 'Esperanças Perdidas', artist: 'Os Originais do Samba', obs: '', tom: 'Dm', tipo: 'R' },
  { num: 4, block: 'I', title: 'Não dá nada', artist: '', obs: 'Trompete/Sax', tom: 'Am7', tipo: 'A' },
  { num: 5, block: 'I', title: 'Tenha Fé', artist: 'Os Originais do Samba', obs: '', tom: 'Fm', tipo: 'R' },
  { num: 6, block: 'I', title: 'Todo achar é Torto', artist: '', obs: 'Saxofone', tom: 'Cm7', tipo: 'A' },
  { num: 7, block: 'I', title: 'Juízo Final', artist: 'Nelson Cavaquinho', obs: '', tom: 'Gm7', tipo: 'R' },
  { num: 8, block: 'I', title: 'Outra Chance', artist: '', obs: 'Trompete', tom: 'Em7', tipo: 'A' },
  { num: 9, block: 'I', title: 'Preciso me Encontrar', artist: 'Cartola', obs: 'Flauta', tom: 'Dm7', tipo: 'R' },
  { num: 10, block: 'I', title: 'Hoje, amanhã e Sempre', artist: '', obs: 'Trombone', tom: 'A7', tipo: 'A' },
  { num: 11, block: 'I', title: 'Alvorada', artist: 'Cartola', obs: '', tom: 'Fm7', tipo: 'R' },
  { num: 12, block: 'I', title: 'Gafieira', artist: '', obs: 'Trombone/Flauta', tom: 'F', tipo: 'A' },
  { num: 13, block: 'I', title: 'O Sol Nascerá (A Sorrir)', artist: 'Cartola', obs: '', tom: 'Cm', tipo: 'R' },
  { num: 14, block: 'I', title: 'O Criador', artist: '', obs: 'Trombone', tom: 'Am7', tipo: 'A' },
  { num: 15, block: 'I', title: 'Aos Trancos e Barrancos', artist: 'Raul Seixas', obs: '', tom: 'G7', tipo: 'R' },
  { num: 16, block: 'I', title: 'Tomzeira', artist: '', obs: 'Trombone', tom: 'E7', tipo: 'A' },

  { num: 17, block: 'II', title: '(Intro 2)', artist: '', obs: '', tom: '??', tipo: '?' },
  { num: 18, block: 'II', title: 'Suporte', artist: '', obs: 'Saxofone', tom: 'Bm', tipo: 'A' },
  { num: 19, block: 'II', title: 'Naquela Mesa', artist: 'Nelson Gonçalves', obs: '', tom: 'Dm', tipo: 'R' },
  { num: 20, block: 'II', title: 'Espelho da Ilusão', artist: '', obs: 'Trombone/Trompete', tom: 'D7', tipo: 'A' },
  { num: 21, block: 'II', title: 'As Rosas não Falam', artist: 'Cartola', obs: '', tom: 'Dm', tipo: 'R' },
  { num: 22, block: 'II', title: 'Harmônica', artist: '', obs: 'Saxofone', tom: 'Cm7', tipo: 'A' },
  { num: 23, block: 'II', title: 'Na Cadência do Samba', artist: 'Novos Baianos', obs: '', tom: 'Cm7', tipo: 'R' },
  { num: 24, block: 'II', title: 'Desempregado', artist: '', obs: 'Saxofone', tom: 'Dm7', tipo: 'A' },
  { num: 25, block: 'II', title: 'Politicar', artist: 'Tom Zé', obs: '', tom: 'Em7', tipo: 'R' },
  { num: 26, block: 'II', title: 'A Saga', artist: '', obs: '', tom: 'Fm', tipo: 'A' },
  { num: 27, block: 'II', title: 'Faixa Amarela', artist: 'Zeca Pagodinho', obs: '', tom: 'D', tipo: 'R' },
  { num: 28, block: 'II', title: 'Consciência Negra', artist: '', obs: 'Flauta', tom: 'Gm7', tipo: 'A' },
  { num: 29, block: 'II', title: 'Sequestraram Minha Sogra', artist: 'Bezerra da Silva', obs: '', tom: 'G', tipo: 'R' },
  { num: 30, block: 'II', title: 'Seis da Manhã', artist: '', obs: 'Flauta', tom: 'C#m', tipo: 'A' },
  { num: 31, block: 'II', title: 'A Flor e o Espinho', artist: 'Nelson Cavaquinho', obs: '', tom: 'Dm', tipo: 'R' },
  { num: 32, block: 'II', title: 'Vida Sofrida', artist: '', obs: 'Trombone', tom: 'A7', tipo: 'A' },

  { num: 33, block: 'III', title: '(Intro 3)', artist: '', obs: '', tom: '??', tipo: '?' },
  { num: 34, block: 'III', title: 'Devagar', artist: '', obs: 'Flauta', tom: 'Em7', tipo: 'A' },
  { num: 35, block: 'III', title: 'Candidato Caô Caô', artist: 'Bezerra da Silva', obs: '', tom: 'D7', tipo: 'R' },
  { num: 36, block: 'III', title: 'Falso Poder', artist: '', obs: 'a criar', tom: 'Fm', tipo: 'A' },
  { num: 37, block: 'III', title: 'Bicho Feroz', artist: 'Bezerra da Silva', obs: '', tom: 'G', tipo: 'R' },
  { num: 38, block: 'III', title: 'A Praça', artist: '', obs: 'nome a definir', tom: 'C', tipo: 'A' },
  { num: 39, block: 'III', title: 'Trem das Onze', artist: 'Adoniran Barbosa', obs: '', tom: 'Am', tipo: 'R' },
  { num: 40, block: 'III', title: 'Eclipse Total', artist: 'Marcão', obs: '', tom: 'Dm', tipo: 'A' },
  { num: 41, block: 'III', title: 'Tiro ao Álvaro', artist: 'Adoniran Barbosa', obs: '', tom: 'F7', tipo: 'R' },
  { num: 42, block: 'III', title: 'Mas Quem Disse que eu te Esqueço', artist: 'Ivone Lara', obs: '', tom: 'G', tipo: 'R' },
  { num: 43, block: 'III', title: 'O Samba da Minha Terra', artist: 'Novos Baianos', obs: '', tom: 'D', tipo: 'R' },
  { num: 44, block: 'III', title: 'Malandro Não Vacila', artist: 'Bezerra da Silva', obs: '', tom: 'Am', tipo: 'R' },
  { num: 45, block: 'III', title: 'Le Bolívia', artist: 'Toinho Melodia', obs: '', tom: 'Dm', tipo: 'R' },
  { num: 46, block: 'III', title: 'O Poder da Criação', artist: 'João Nogueira', obs: '', tom: 'Am7', tipo: 'R' },
  { num: 47, block: 'III', title: 'Samba-choro', artist: '', obs: 'Flauta', tom: 'D7', tipo: 'A' },
];

const sscSongs: Song[] = rawList.map((item) => {
  const isIntro = item.title.startsWith('(Intro');
  let type: 'autoral' | 'repertorio' | 'instrumental' | 'a_definir' = 'repertorio';
  if (isIntro) {
    type = 'instrumental';
  } else if (item.tipo === 'A') {
    type = 'autoral';
  } else if (item.tipo === '?') {
    type = 'a_definir';
  }

  const isUnknownKey = item.tom === '??';
  const cleanKey = isUnknownKey ? '??' : item.tom;
  const isMinor = cleanKey.includes('m') && !cleanKey.includes('maj');

  return {
    id: `ssc-song-${item.num}`,
    title: item.title,
    artist: item.artist || (type === 'autoral' ? 'Autoral (Banda SSC)' : ''),
    originalKey: cleanKey,
    currentKey: cleanKey,
    mode: isMinor ? 'minor' : 'major',
    bpm: 95,
    timeSignature: '2/4',
    capo: 0,
    instrument: item.obs || (isIntro ? 'Instrumental' : undefined),
    chordProContent: '', // Strictly empty skeleton as per prompt rules!
    tags: [
      `Bloco ${item.block}`,
      type === 'autoral' ? 'Autoral' : type === 'instrumental' ? 'Passagem Instrumental' : 'Repertório Terceiros',
    ],
    origin: 'repertorio_pdf',
    type,
    status: 'pendente',
    block: item.block,
    orderInBlock: item.num,
    notes: item.obs
      ? `Instrumento em destaque: ${item.obs}`
      : isUnknownKey
      ? 'Tom a definir'
      : undefined,
    isFavorite: false,
    workspaceId: WORKSPACE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

export const initialSongs: Song[] = [...demoRichSongs, ...sscSongs];

export const initialSetlists: Setlist[] = [
  {
    id: 'setlist-ssc-2026',
    name: 'REPERTÓRIO SSC II — 2026',
    date: '2026-11-20',
    location: 'Teatro Municipal / Sala São Paulo',
    notes: 'Repertório oficial com 47 canções distribuídas nos Blocos I, II e III.',
    workspaceId: WORKSPACE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: sscSongs.map((s, idx) => ({
      songId: s.id,
      selectedKey: s.originalKey,
      capo: 0,
      order: idx + 1,
      block: s.block,
      leaderNotes: s.notes || undefined,
    })),
  },
  {
    id: 'setlist-demo-culto',
    name: 'Culto de Domingo / Demonstração Completa',
    date: '2026-11-15',
    location: 'Templo Principal',
    notes: 'Setlist com hinos clássicos com cifras completas para demonstração ao vivo de transposição e palco.',
    workspaceId: WORKSPACE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: demoRichSongs.map((s, idx) => ({
      songId: s.id,
      selectedKey: s.originalKey,
      capo: 0,
      order: idx + 1,
      leaderNotes: 'Atenção para dinâmica de dinâmica suave na estrofe.',
    })),
  },
];

export const initialMembers: Member[] = [
  {
    id: 'mem-1',
    name: 'Mateus Clarinetista',
    email: 'mateus@cifraviva.app',
    phone: '(11) 98765-4321',
    role: 'sax',
    status: 'ativo',
    workspaceId: WORKSPACE_ID,
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'mem-2',
    name: 'Beatriz Violonista',
    email: 'beatriz@cifraviva.app',
    phone: '(11) 97654-3210',
    role: 'violao',
    status: 'ativo',
    workspaceId: WORKSPACE_ID,
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'mem-3',
    name: 'Carlos Percussionista',
    email: 'carlos@cifraviva.app',
    phone: '(11) 96543-2109',
    role: 'bateria',
    status: 'ativo',
    workspaceId: WORKSPACE_ID,
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'mem-4',
    name: 'Danilo Trombonista',
    email: 'danilo@cifraviva.app',
    phone: '(11) 95432-1098',
    role: 'trombone',
    status: 'convite_pendente',
    workspaceId: WORKSPACE_ID,
    inviteCode: 'SSC-TROMB-2026',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
];

export const initialEvents: EventSchedule[] = [
  {
    id: 'ev-1',
    title: 'Apresentação Oficial REPERTÓRIO SSC II',
    date: '2026-11-20',
    time: '20:00',
    location: 'Teatro Municipal / Sala São Paulo',
    setlistId: 'setlist-ssc-2026',
    assignedMemberIds: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
    confirmedMemberIds: ['mem-1', 'mem-2', 'mem-3'],
    notes: 'Chegada da equipe às 18:30 para passagem de som e afinação.',
    workspaceId: WORKSPACE_ID,
  },
  {
    id: 'ev-2',
    title: 'Culto Especial de Louvor e Gratidão',
    date: '2026-11-15',
    time: '19:00',
    location: 'Templo Principal',
    setlistId: 'setlist-demo-culto',
    assignedMemberIds: ['mem-1', 'mem-2', 'mem-3'],
    confirmedMemberIds: ['mem-1', 'mem-2', 'mem-3'],
    notes: 'Escala confirmada.',
    workspaceId: WORKSPACE_ID,
  },
];
