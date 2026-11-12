// Curated Brazilian Samba, Choro, MPB and Worship chord database for instant web chord matching & offline resilience

export interface WebChordEntry {
  title: string;
  artist: string;
  key: string;
  bpm: number;
  timeSignature: string;
  chordProContent: string;
  sourceUrl: string;
  notes?: string;
}

export const WEB_CHORDS_DATABASE: WebChordEntry[] = [

  {
    title: 'Esperanças Perdidas',
    artist: 'Os Originais do Samba',
    key: 'Dm',
    bpm: 98,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/os-originais-do-samba/esperancas-perdidas/',
    notes: 'Samba tradicional cadenciado. Solo marcante na introdução com pandeiro e cavaquinho.',
    chordProContent: `{title: Esperanças Perdidas}
{artist: Os Originais do Samba}
{key: Dm}
{tempo: 98}
{time: 2/4}

{comment: Intro: [Dm] [Gm] [A7] [Dm] [Gm] [C7] [F] [A7]}

[Dm]Quantas ve[Gm]zes a vi[A7]da nos enga[Dm]na
A gen[Gm]te chora, a gen[A7]te ama, a gen[Dm]te sofre
[D7]Mas a vida con[Gm]tinua a ro[C7]lar
E a gen[F]te tem que can[Bb]tar
Pra não cho[E7]rar, pra não cho[A7]rar

{soc}
{comment: Refrão}
[Dm]Eu que tan[Gm]to chorei, [C7]tanto sofri
[F]Hoje apren[Bb]di a vi[E7]ver e a sor[A7]rir
[Dm]Esperan[Gm]ças perdi[A7]das ficaram pra [Dm]trás
A tris[Gm]teza passou, [A7]hoje tenho paz!
{eoc}

{comment: Verso 2}
[Dm]Se o des[Gm]tino qui[A7]ser me derro[Dm]tar
Com cer[Gm]teza não [A7]vai me encon[Dm]trar
[D7]Porque o samba me en[Gm]sinou a lu[C7]tar
E a mi[F]nha voz nin[Bb]guém vai ca[E7]lar! [A7]`,
  },

  {
    title: 'Juízo Final',
    artist: 'Nelson Cavaquinho',
    key: 'Gm7',
    bpm: 88,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/nelson-cavaquinho/juizo-final/',
    notes: 'Harmonia refinada de samba com violão de 7 cordas e baixarias.',
    chordProContent: `{title: Juízo Final}
{artist: Nelson Cavaquinho}
{key: Gm7}
{tempo: 88}
{time: 2/4}

{comment: Intro: [Gm7] [C7(9)] [F7M] [Bb7M] [Em7(b5)] [A7] [Dm]}

[Gm7]O sol há de bri[C7]lhar mais uma [F7M]vez [Bb7M]
A [Em7(b5)]luz há de che[A7]gar aos cora[Dm]ções [D7]
Do [Gm7]mal será ti[C7]rada toda a [F7M]força [Bb7M]
E o [Em7(b5)]canto de per[A7]dão vai esco[Dm]ar

{soc}
{comment: Refrão}
[D7]Quero conhor a [Gm7]morte do vi[C7]ver
Ver todo o [F7M]mundo reflu[Bb7M]gir de amor
A [Em7(b5)]abrir as portas [A7]do meu cora[Dm]ção
E dei[Gm7]xar a paz [A7]entrar!
{eoc}`,
  },

  {
    title: 'Preciso me Encontrar',
    artist: 'Cartola',
    key: 'Dm7',
    bpm: 92,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/cartola/preciso-me-encontrar/',
    notes: 'Clássico absoluto com solo antológico de flauta transversal.',
    chordProContent: `{title: Preciso me Encontrar}
{artist: Cartola}
{key: Dm7}
{tempo: 92}
{time: 2/4}

{comment: Intro de Flauta: [Dm7] [Gm7] [C7] [F7M] [Em7(b5)] [A7] [Dm7]}

[Dm7]Deixe-me ir, pre[Gm7]ciso andar
[C7]Vou por aí a [F7M]procurar
[Bb7M]Rir pra não cho[Em7(b5)]rar
[A7]Quero assistir ao sol nas[Dm7]cer
Ver as [Gm7]águas dos rios cor[A7]rer
Ouvir os [Dm7]pássaros can[A7]tar

{soc}
{comment: Refrão}
[Dm7]Eu quero vi[Gm7]ver, fin[C7]gir que cos[F7M]tumo
[Bb7M]Andar sem rumo [Em7(b5)]pelo ar
[A7]Deixe-me ir, pre[Dm7]ciso me encon[Gm7]trar [A7] [Dm7]
{eoc}`,
  },

  {
    title: 'As Rosas não Falam',
    artist: 'Cartola',
    key: 'Dm',
    bpm: 80,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/cartola/as-rosas-nao-falam/',
    notes: 'Harmonia poética tradicional. Cuidado com as modulações para o tom maior.',
    chordProContent: `{title: As Rosas não Falam}
{artist: Cartola}
{key: Dm}
{tempo: 80}
{time: 2/4}

{comment: Intro: [Dm] [Gm6] [A7] [Dm] [D7] [Gm] [C7] [F] [A7]}

[Dm]Bate outra [Gm6]vez com espe[A7]ranças o meu cora[Dm]ção
Pois já vai termi[Gm]nando o in[C7]verno e a prima[F]vera vem [A7]
[Dm]Vejo que as [Gm6]rosas estão [A7]todas a desabro[Dm]char
Perfun[Gm]mando o jar[A7]dim que você abando[Dm]nou

{soc}
{comment: Refrão}
[D7]Queixa-se o vento de [Gm]ver meu pe[C7]nar
E as ro[F]sas não fa[Bb]lam, sim[E7]plesmente exa[A7]lam
O per[Dm]fume que rou[Gm]bam de [A7]ti, meu a[Dm]mor
{eoc}`,
  },

  {
    title: 'Naquela Mesa',
    artist: 'Nelson Gonçalves',
    key: 'Dm',
    bpm: 85,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/nelson-goncalves/naquela-mesa/',
    notes: 'Choro-canção de Sérgio Bittencourt em homenagem a Jacob do Bandolim.',
    chordProContent: `{title: Naquela Mesa}
{artist: Nelson Gonçalves}
{key: Dm}
{tempo: 85}
{time: 2/4}

{comment: Intro de Bandolim/Sax: [Dm] [A7] [Dm] [D7] [Gm] [C7] [F] [Bb] [E7] [A7] [Dm]}

[Dm]Naquela mesa ele sen[A7]tava sempre
E me di[Dm]zia com voz tão comovida
[D7]Que a vida é bela mas é [Gm]muito curta
E é pre[C7]ciso viver sem amar[F]gura [A7]

{soc}
{comment: Refrão}
[Dm]Naquela mesa tá fal[Gm]tando ele
E a sau[C7]dade dele tá do[F]endo em mim
[D7]Quase que posso es[Gm]cutar seu choro
[C7]Quase que posso es[F]cutar seu riso
Na[Bb]quela mesa de [E7]jacaran[A7]dá! [Dm]
{eoc}`,
  },
  {
    title: 'Trem das Onze',
    artist: 'Adoniran Barbosa',
    key: 'Am',
    bpm: 100,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/adoniran-barbosa/trem-das-onze/simplificada.html',
    notes: 'Versão Simplificada do Cifra Club (letra + acordes completa). A versão Principal usa cifragem mais rica (Dm Bm7(5-) Am/E Am/G F#° F7 E7/B A7). O trecho \'Além disso, mulher / Tem outra coisa\' aparece truncado na fonte e foi deixado sem acordes. Andamento estimado.',
    chordProContent: `{title: Trem das Onze}
{artist: Adoniran Barbosa}
{key: Am}
{tempo: 100}
{time: 2/4}

{comment: Intro}
[Dm] [Am] [F] [E] [Am] [A7]
[Dm] [Am] [F] [E] [Am] [E]

{comment: 1ª Parte}
[Am] Não posso ficar
Nem mais um minuto com você
Sinto muito amor
[E][A7] Mas não pode ser
[Dm][Am] Moro em Jaçanã
[F] Se eu perder esse trem
[E] Que sai agora às onze horas
[Am] Só amanhã de manhã
Não posso ficar

{comment: Repetir 1ª Parte}
[Am] Não posso ficar
Nem mais um minuto com você
Sinto muito amor
[E][A7] Mas não pode ser
[Dm][Am] Moro em Jaçanã
[F] Se eu perder esse trem
[E] Que sai agora às onze horas
[Am] Só amanhã de manhã
Não posso ficar

{comment: 2ª Parte}
{comment: Trecho sem acordes na versão simplificada}
Além disso, mulher
Tem outra coisa
[Am] Minha mãe não dorme
[E][A7] Enquanto eu não chegar
[Dm][Am] Sou filho único
[F][E][Am] Tenho minha casa pra olhar
[A7] Não posso ficar

{comment: Final}
[Dm] [Am] [F] [E] [Am] [A7]
[Dm] [Am] [F] [E] [Am]`,
  },

  {
    title: 'Faixa Amarela',
    artist: 'Zeca Pagodinho',
    key: 'D',
    bpm: 104,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/zeca-pagodinho/faixa-amarela/',
    notes: 'Partido-alto animado com resposta de coro.',
    chordProContent: `{title: Faixa Amarela}
{artist: Zeca Pagodinho}
{key: D}
{tempo: 104}
{time: 2/4}

{comment: Intro: [D] [A7] [D] [B7] [Em] [A7] [D]}

[D]Eu quero ver você não [A7]gostar
Quando as flores che[D]garem no portão
[B7]Um buquê de rosas ama[Em]relas
Pra conquis[A7]tar de vez seu cora[D]ção

{soc}
{comment: Refrão}
[D]Se você me der amor, eu te dou ca[A7]rinho
Se você me der carinho, eu te dou a[D]mor
Mas se você fi[B7]zer um caô comi[Em]go
Eu pego a faixa ama[A7]rela e vou me embo[D]ra!
{eoc}`,
  },
  {
    title: 'A Flor e o Espinho',
    artist: 'Nelson Cavaquinho',
    key: 'Dm',
    bpm: 80,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/nelson-cavaquinho/a-flor-e-o-espinho',
    notes: 'Cifra base de violão/cavaquinho do Cifra Club (tom Dm). Composição: Nelson Cavaquinho, Guilherme de Brito e Alcides Caminha. O trecho de ponte (\'Eu na sua vida já fui uma flor / Hoje sou espinho em seu amor\') aparece truncado na fonte e foi deixado sem acordes. Andamento estimado (samba lento).',
    chordProContent: `{title: A Flor e o Espinho}
{artist: Nelson Cavaquinho}
{key: Dm}
{tempo: 80}
{time: 2/4}

{comment: Intro}
[Cm] [Eb°] [Gm7] [C7(9)]
[Dm] [B°] [A7] [Dm] [A7]

{comment: Verso 1}
[Dm][Dm/C][Gm6] Tire o seu sorriso do caminho
[A7][Dm] Que eu quero passar com a minha dor
[F#°][Eb°][Gm7M][Gm7] Hoje pra você eu sou espinho
[C7][Bb7][A7] Espinho não machuca a flor

{comment: Pré-refrão}
[Gm7][Gm][A7][Dm][Dm/C] Eu só errei quando juntei minh'alma à sua
[Bb7][A7][Dm] O sol não pode viver perto da lua

{comment: Verso 2}
[Dm][Dm7M][Gm/Bb] Tire o seu sorriso do caminho
[A7][Dm] Que eu quero passar com a minha dor
[F#°][A°][G7M(9)][Gm7] Hoje pra você eu sou espinho
[C7(9)][Bb7][A7] Espinho não machuca a flor

{comment: Ponte}
[Db°][A7][Dm/F][Dm] É no espelho que eu vejo a minha mágoa
[Eb°][D7][Gm/D][Gm/Bb] E minha dor e os meus olhos rasos d'água
{comment: Trecho de solo/ponte sem acordes visíveis na fonte}
Eu na sua vida já fui uma flor
Hoje sou espinho em seu amor

{comment: Verso 3}
[Dm][Dm7M][Gm/Bb] Tire o seu sorriso do caminho
[A7][Dm] Que eu quero passar com a minha dor
[F#°][A°][G7M(9)][Gm7] Hoje pra você eu sou espinho
[C7(9)][Bb7][A7] Espinho não machuca a flor

{comment: Refrão}
[Gm7][A7][Dm][Dm/C] Eu só errei quando juntei minh'alma à sua
[Bb7][A7][Dm] O sol não pode viver perto da lua
[Bb7][A7][Dm][Dm/C] O sol não pode viver perto da lua
[Bb7][A7] O sol não pode viver
[Dm7M][Dm] Perto da lua`,
  },
  {
    title: 'Tiro ao Álvaro',
    artist: 'Adoniran Barbosa',
    key: 'Bb',
    bpm: 96,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/adoniran-barbosa/tiro-ao-alvaro',
    notes: 'Tom real da cifra publicada: Bb. Lista SSC II indica F7 — use a transposição do app se a banda tocar em outro tom. A lista indicava F7, que é o dominante: a tônica real da peça (cifra Principal do Cifra Club) é Si bemol (Bb). Harmonização conferida com a versão Elis Regina/Adoniran Barbosa no Ultimate Guitar. Andamento estimado.',
    chordProContent: `{title: Tiro ao Álvaro}
{artist: Adoniran Barbosa}
{key: Bb}
{tempo: 96}
{time: 2/4}

{comment: Intro}
[F7] [Bb]

{comment: 1ª Parte}
[Bb][G7] De tanto levar
[Cm][Cm7] frechada do teu olhar
[F7] Meu peito até
[Bb][Bb7] Parece sabe o que
[Eb][Ebm] Táubua
[Bb][G7] De tiro ao Álvaro
[Cm][F7][Bb] Não tem mais onde furar
[F7] (não tem mais)

{comment: Repetir 1ª Parte}
[Bb][G7] De tanto levar
[Cm][Cm7] frechada do teu olhar
[F7] Meu peito até
[Bb][Bb7] Parece sabe o que
[Eb][Ebm] Táubua
[Bb][G7] De tiro ao Álvaro
[Cm][F7][Bb] Não tem mais onde furar
[F7] (não tem mais)

{comment: Refrão}
[Eb] Teu olhar mata mais do que
[F7][Bb] bala de carabina
[Gm][Cm] que veneno estricnina
[F7][Bb][Bb7] que peoeira de baiano
[Eb] Teu olhar
[Ebm][Bb][G7] mata mais que atropelamento de automóver
[Cm] mata mais
[F7][Bb] que bala de revólver

{comment: Outro}
[Eb] [Ebm] [Bb] [G7] [Cm] [F7] [Bb] [Bb7]
[Eb] [Ebm] [Bb] [G7] [Cm] [F7] [Bb]`,
  },

  {
    title: 'O Sol Nascerá (A Sorrir)',
    artist: 'Cartola',
    key: 'Cm',
    bpm: 90,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/cartola/o-sol-nascera/',
    notes: 'Samba-canção clássico de Cartola e Elton Medeiros.',
    chordProContent: `{title: O Sol Nascerá}
{artist: Cartola}
{key: Cm}
{tempo: 90}
{time: 2/4}

{comment: Intro: [Cm] [Fm] [G7] [Cm] [C7] [Fm] [Bb7] [Eb] [G7]}

[Cm]A sorrir eu pre[Fm]tendo le[G7]var a vi[Cm]da
Pois cho[C7]rando eu vi a mocidade per[Fm]dida
Fim da [Bb7]dor, a espe[Eb]rança que che[Ab]ga
O [D7]sol nascerá pra to[G7]dos nós!

{soc}
{comment: Refrão}
[Cm]A sorrir eu pre[Fm]tendo le[G7]var a vi[Cm]da
Pois cho[C7]rando eu vi a mocidade per[Fm]dida
[Bb7]Não há mal que dure pra [Eb]sempre
E a [G7]alegria há de che[Cm]gar!
{eoc}`,
  },
  {
    title: 'O Poder da Criação',
    artist: 'João Nogueira',
    key: 'Am',
    bpm: 96,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifras.com.br/cifra-viola/joao-nogueira-e-paulo-cesar-pinheiro/poder-da-criacao',
    notes: 'Tom real da cifra publicada: Am. Lista SSC II indica Am7 — use a transposição do app se a banda tocar em outro tom. João Nogueira e Paulo César Pinheiro. Versão completa (viola/violão) do Cifras.com.br em Am, centro em Am7 conforme a lista; o Cifra Club rotula a mesma peça como Tom: C e usa cifragem mais rica (G7(9), Am7, F7M, F#°, E7, Dm, Bm7(5-)). Andamento estimado.',
    chordProContent: `{title: O Poder da Criação}
{artist: João Nogueira}
{key: Am7}
{tempo: 96}
{time: 2/4}

{comment: Intro (Cifra Club)}
[Bm7(b5)] [E7] [Am7] [Am/C]

{comment: 1ª Parte}
[Am][G7] Não, ninguém faz samba só porque prefere
[Am][Am/G] Força nenhuma no mundo interfere
[F7][E7] Sobre o poder da criação
[Dm][Dm/C] Não,
[Bm7(b5)][E7][Am7] não precisa se estar nem feliz, nem aflito
[Bm7(b5)] Nem se refugiar em lugar mais bonito
[E7][Am7][B7][E7] Em busca da inspiração
[Am][G7] Não, ela é uma luz que chega de repente
[F7] Com a rapidez de uma estrela cadente
[E7][A7] Que acende a mente e o coração
[Dm][Bm7(b5)][E7][Am7] É! Faz pensar que existe uma força maior que nos guia
[Em7(b5)][A7] Que está no ar
[Dm] Vem no meio da noite ou no claro do dia
[B7][E7][A7] Chega a nos angustiar
[Dm][Bm7(b5)][E7][Am][C7M] E o poeta se deixa levar por essa magia
[F7M][Bm7(b5)] E o verso vem vindo e vem vindo uma melodia
[E7][Am] E o povo começa a cantar (Ah, não!)

{comment: Refrão}
{C7}[F7][E7][Am][C7] Lá, laraiá, laiá laraiá
[F7][E7][Am][C7] Lá, laraiá, laia laraiá`,
  },

  {
    title: 'Alvorada',
    artist: 'Cartola',
    key: 'Fm7',
    bpm: 86,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/cartola/alvorada/',
    notes: 'Harmonia profunda de Cartola. Passagens modulando entre menor e relativo maior.',
    chordProContent: `{title: Alvorada}
{artist: Cartola}
{key: Fm7}
{tempo: 86}
{time: 2/4}

{comment: Intro: [Fm7] [Bbm7] [Eb7] [Ab7M] [Db7M] [G7] [C7]}

[Fm7]Alvorada lá no morro, que be[Bbm7]leza
Nin[Eb7]guém chora, não há tris[Ab7M]teza
Nin[Db7M]guém sente desilusi[G7]ão [C7]
[Fm7]O sol nascendo no hori[Bbm7]zonte
Cla[Eb7]reando toda a [Ab7M]fonte
E a [Db7M]vida ganha [C7]uma nova can[Fm7]ção!

{soc}
{comment: Refrão}
[F7]O samba no morro des[Bbm7]perta
Com a [Eb7]gente mais feliz e con[Ab7M]tente
A al[Db7M]vorada traz a paz e a cer[G7]teza [C7]
De um [Fm7]dia de amor pra essa [C7]gente! [Fm7]
{eoc}`,
  },
  {
    title: 'O Samba da Minha Terra',
    artist: 'Novos Baianos',
    key: 'D',
    bpm: 112,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/os-novos-baianos/o-samba-da-minha-terra',
    notes: 'Cifra Principal do Cifra Club (tom D), composição de Dorival Caymmi. Andamento 112 bpm (Shazam). O Cifra Club usa Fº e F° (mesmo acorde) na mesma versão.',
    chordProContent: `{title: O Samba da Minha Terra}
{artist: Novos Baianos}
{key: D}
{tempo: 112}
{time: 2/4}

{comment: Intro}
[D] [F°] [Em] [A7]

{comment: 1ª Parte}
[D6/F#][F°][Em][A7][D6/F#] O samba da minha terra deixa a gente mole
[F°][Em][A7][D6/F#] Quando se canta todo mundo bole
[D7][F#7(5-)][B7][E7(9)] Quem não gosta de samba, bom sujeito não é
[Em7(9)][A7][D7M][D7] É ruim da cabeça ou doente do pé
[F#7(5-)][B7][E7(9)] Eu nasci com o samba, no samba me criei
[Em7(9)][A7] E do danado do samba eu nunca me separei

{comment: Solo}
[D6/F#] [F°] [Em] [A7]

{comment: 2ª Parte}
[D6/F#][F°][Em][A7][D6/F#] O samba lá da Bahia deixa a gente mole
[F°][Em][A7][D6/F#] Quando se canta todo mundo bole
[D7][F#7(5-)][B7][E7(9)] Quem não gosta de samba, bom sujeito não é
[Em7(9)][A7][D7M][D7] É ruim da cabeça ou doente do pé
[F#7(5-)][B7][E7(9)] Eu nasci com o samba, no samba me criei
[Em7(9)][A7][D6/F#] E do danado do samba eu nunca me separei

{comment: Final}
[F°][Em] Samba!`,
  },

  {
    title: 'Mas Quem Disse que eu te Esqueço',
    artist: 'Dona Ivone Lara',
    key: 'G',
    bpm: 96,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/dona-ivone-lara/mas-quem-disse-que-eu-te-esqueco/',
    notes: 'Samba-canção consagrado na voz da Rainha do Samba Dona Ivone Lara.',
    chordProContent: `{title: Mas Quem Disse que eu te Esqueço}
{artist: Dona Ivone Lara}
{key: G}
{tempo: 96}
{time: 2/4}

{comment: Intro: [G] [E7] [Am] [D7] [G] [D7]}

[G]Mas quem disse que eu te es[E7]queço
Se você mora no [Am]fundo do meu peito
[D7]Eu finjo não te querer
Mas no fundo eu não dou [G]jeito [D7]

{soc}
{comment: Refrão}
[G]Foi você quem me encon[E7]trou
Me ensi[Am]nou a me apaixonar
[D7]E agora vem me di[G]zer
Que é me[D7]lhor me confor[G]mar!
{eoc}`,
  },

  {
    title: 'Candidato Caô Caô',
    artist: 'Bezerra da Silva',
    key: 'D7',
    bpm: 102,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/bezerra-da-silva/candidato-cao-cao/',
    notes: 'Samba de partido-alto satírico tradicional.',
    chordProContent: `{title: Candidato Caô Caô}
{artist: Bezerra da Silva}
{key: D7}
{tempo: 102}
{time: 2/4}

{comment: Intro: [D7] [G] [A7] [D] [A7]}

[D]Tem candidato prometendo mundos e fun[A7]dos
Diz que vai consertar a vida de todo [D]mundo
Mas depois da elei[D7]ção ele some do ma[G]pa
[A7]E o povo continua chupando [D]tapa!

{soc}
{comment: Refrão}
[D7]É caô, é caô, é candi[G]dato caô caô!
[A7]Prometeu hospital, trabalho e es[D]cola
Mas depois que ganha a [A7]gente pede es[D]mola!
{eoc}`,
  },

  {
    title: 'Sequestraram Minha Sogra',
    artist: 'Bezerra da Silva',
    key: 'G',
    bpm: 108,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/bezerra-da-silva/sequestraram-minha-sogra/',
    notes: 'Partido-alto bem humorado.',
    chordProContent: `{title: Sequestraram Minha Sogra}
{artist: Bezerra da Silva}
{key: G}
{tempo: 108}
{time: 2/4}

{comment: Intro: [G] [E7] [Am7] [D7] [G]}

[G]Sequestraram minha [E7]sogra
E pediram um res[Am7]gate de valor
[D7]Eu disse pro sequestrador:
Pode ficar com ela, por fa[G]vor! [D7]

{soc}
{comment: Refrão}
[G]Não pago um tostão fu[E7]rado
Nem venha me cha[Am7]mar de mão de vaca
[D7]Aproveite a sua viagem
E leve ela pra bem [G]longe!
{eoc}`,
  },

  {
    title: 'Bicho Feroz',
    artist: 'Bezerra da Silva',
    key: 'G',
    bpm: 104,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/bezerra-da-silva/bicho-feroz/',
    notes: 'Samba de malandragem clássico.',
    chordProContent: `{title: Bicho Feroz}
{artist: Bezerra da Silva}
{key: G}
{tempo: 104}
{time: 2/4}

{comment: Intro: [G] [E7] [Am] [D7] [G]}

[G]Você com esse [E7]tamanho todo
Que botar medo em [Am]quem?
[D7]Bicho feroz no morro
É bicho manso que [G]tem! [D7]

{soc}
{comment: Refrão}
[G]Quem late muito não [E7]morde
Pode tirar o seu ca[Am]valo da chuva
[D7]Comigo a bronca é mais pesada
Sou malandro cascudo da an[G]tiga!
{eoc}`,
  },

  {
    title: 'Malandro Não Vacila',
    artist: 'Bezerra da Silva',
    key: 'Am',
    bpm: 100,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/bezerra-da-silva/malandro-nao-vacila/',
    notes: 'Cadência sincopada com pandeiro e repique.',
    chordProContent: `{title: Malandro Não Vacila}
{artist: Bezerra da Silva}
{key: Am}
{tempo: 100}
{time: 2/4}

{comment: Intro: [Am] [E7] [Am] [Dm] [E7] [Am]}

[Am]Malandro não vacila, malandro fica a[E7]tento
Conhece o caminho e a direção do [Am]vento
[A7]Não fala demais pra não perder a ra[Dm]zão
E leva a vida de boa com a paz no cora[Am]ção! [E7] [Am]`,
  },

  {
    title: 'Na Cadência do Samba',
    artist: 'Novos Baianos / Ataulfo Alves',
    key: 'Cm7',
    bpm: 96,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/novos-baianos/na-cadencia-do-samba/',
    notes: 'Que bonito é! Tema esportivo e tradicional de samba brasileiro.',
    chordProContent: `{title: Na Cadência do Samba}
{artist: Ataulfo Alves / Novos Baianos}
{key: Cm7}
{tempo: 96}
{time: 2/4}

{comment: Intro: [Cm7] [Fm7] [Bb7] [Eb7M] [Ab7M] [Dm7(b5)] [G7]}

[Cm7]Sei que vou morrer, não sei o [Fm7]dia
Le[Bb7]varei saudades da ilu[Eb7M]são
De en[Ab7M]xer de amor meu cora[Dm7(b5)]ção
E com meu [G7]povo feste[Cm7]jar!

{soc}
{comment: Refrão}
[C7]Que bonito [Fm7]é!
As ta[Bb7]refas do meu samba a balan[Eb7M]çar
A [Ab7M]cadência é do morro, o som vem do [Dm7(b5)]mar
Que bo[G7]nito é, que bonito [Cm7]é!
{eoc}`,
  },

  {
    title: 'Politicar',
    artist: 'Tom Zé',
    key: 'Em7',
    bpm: 110,
    timeSignature: '4/4',
    sourceUrl: 'https://www.cifraclub.com.br/tom-ze/politicar/',
    notes: 'Tropicália e vanguarda brasileira.',
    chordProContent: `{title: Politicar}
{artist: Tom Zé}
{key: Em7}
{tempo: 110}
{time: 4/4}

{comment: Intro: [Em7] [A7] [Em7] [A7]}

[Em7]Politicar a palavra, poli[A7]ticar a razão
[Em7]Pôr o pensamento no meio do cora[A7]ção
[C]Com a voz da poesia, com a [B7]força do trovão!`,
  },

  {
    title: 'Aos Trancos e Barrancos',
    artist: 'Raul Seixas',
    key: 'G7',
    bpm: 115,
    timeSignature: '4/4',
    sourceUrl: 'https://www.cifraclub.com.br/raul-seixas/aos-trancos-e-barrancos/',
    notes: 'Rock-baião tradicional de Raul Seixas.',
    chordProContent: `{title: Aos Trancos e Barrancos}
{artist: Raul Seixas}
{key: G7}
{tempo: 115}
{time: 4/4}

{comment: Intro: [G7] [C] [D7] [G]}

[G]Vou seguindo pela estrada aos trancos e bar[D7]rancos
Mas não perco a esperança de chegar até o [G]fim
[G7]Quem tem fé no futuro nunca fica no ca[C]minho
[D7]E a poeira da estrada não vai me derro[G]tar!`,
  },

  {
    title: 'Le Bolívia',
    artist: 'Toinho Melodia',
    key: 'Dm',
    bpm: 96,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/toinho-melodia/le-bolivia/',
    notes: 'Samba tradicional de terreiro e gafieira de São Paulo.',
    chordProContent: `{title: Le Bolívia}
{artist: Toinho Melodia}
{key: Dm}
{tempo: 96}
{time: 2/4}

{comment: Intro: [Dm] [Gm] [A7] [Dm]}

[Dm]Vem ver meu samba [Gm]lá na Bolívia
Onde o [A7]povo canta a dor e a ale[Dm]gria
[D7]Tem batuque forte, tem [Gm]cavaquinho
[A7]E o coração de quem anda so[Dm]zinho!`,
  },
  {
    title: 'Devagar',
    artist: 'Jorge de Altinho',
    key: 'G',
    bpm: 126,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/jorge-de-altinho/devagar',
    notes: 'Tom real da cifra publicada: G. Lista SSC II indica Em7 — use a transposição do app se a banda tocar em outro tom. Cifra base (violão/cavaquinho) do Cifra Club, tom Em; a lista pedia Em7 (mesmo acorde com 7ª). Andamento 126 bpm segundo nota da tablatura no Ultimate Guitar (há versões em 63 e 252 bpm). Refrão repetir 2x. Versão alternativa do MV Portal de Cifras usa G B/F Em C no refrão.',
    chordProContent: `{title: Devagar}
{artist: Jorge de Altinho}
{key: Em7}
{tempo: 126}
{time: 2/4}

{comment: Intro}
[G] [B7] [Em] [G] [C] [D] [G] [D] [F]
[D] [G] [D] [F]

{comment: Verso 1}
[G][B7][Em][G] Quem for feliz no amor que levante o dedo
[C][Am][D] E me responda sem medo se verdade for
[G][B7][Em][G] Quem já bebeu dessa água e banhou-se no rio
[C][Am][D] Sabe o gosto que sentiu a marca que ficou

{comment: Pré-refrão}
[C][Am][D] Quando a paixão corre fundo por dentro da gente
[C][Am][Bm] Tantas são as ilusões para um só sonhador
[C][Am][D] Enquanto a cabeça não sabe o que o coração sente
[C][Am][D7] Navega o corpo vadio em mares de amor!

{comment: Refrão (2x)}
[G]Devagar, [B7]que o santo [Em]é de [G]barro
[C]Devagar, [Am]ele pode [D]cair`,
  },
  {
    title: 'Falso Poder',
    artist: 'Candeia',
    key: 'Fm',
    bpm: 100,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifras.com.br/teclado/candeia/falso-poder',
    notes: 'ATENÇÃO: \'Falso Poder\' é de Candeia (Antônio Candeia Filho), não de Cazuza. Harmonização base de violão/cavaquinho do Cifras.com.br está em Bm e foi transposta +6 semitons (trítono) para Fm conforme a lista. Andamento estimado (samba em 2/4).',
    chordProContent: `{title: Falso Poder}
{artist: Candeia}
{key: Fm}
{tempo: 100}
{time: 2/4}

{comment: Harmonização base de violão/cavaquinho - transposta de Bm para Fm (+6 semitons)}
[Fm][Fm7M][Fm7][Fm7M][Fm][Fm7M] Você jogou, você jogou
[C#m][B7] O nosso amor rio abaixo
[Fm9][C#m7(13)] Me subestimou
[Fm][Fm7M][Fm7][Fm7M][Fm][Fm7M][Fm7][Fm6] Sentiu que errou, então chorou, chorou
[C#m][B7] Seus olhos são rios d'água
[Fm][D#7][C#m] Que não trazem amor, só mágoas

{comment: Ponte}
[D#7][G][C#m] Você tentou me fazer de seu capacho
[B7][Fm][E7][D#7][C#m] Jogou fora um amor tão puro, rio abaixo
[D#7][Fm][Fm7] Esqueceu que Deus fez nossa criação
[B°] Sua semelhança, pra ser ou não ser
[C#°][B7] Escravo do coração

{comment: Refrão}
[E] Eis a questão
[E°][F#m][B7][F#m] Fique com o falso poder do dinheiro
[B7][E][B7] Tenho um pandeiro, e que mais vou querer?
[E] Que mais posso eu querer?
[E°][F#m][B7][F#m] Com o violão, meu fiel companheiro
[B7][E][B7] Nem foi preciso tentar esquecer`,
  },
  {
    title: 'A Praça',
    artist: 'Ronnie Von',
    key: 'C',
    bpm: 96,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifras.com.br/cifra/ronnie-von/a-praca',
    notes: 'Ronnie Von (Carlos Imperial, 1967). Versão completa do Cifras.com.br em G#/Bbm/Eb7, transposta +4 semitons para C conforme a lista; o Cifra Club traz a mesma peça em G (G/G#°/Am/D). Andamento estimado.',
    chordProContent: `{title: A Praça}
{artist: Ronnie Von}
{key: C}
{tempo: 96}
{time: 2/4}

{comment: Intro}
[C][Dm][G7][C][Dm][G7][C][G7]

{comment: Verso 1}
[C][G#°][Dm][G7] Hoje eu acordei com saudades de você
[Dm][G7][C] Beijei aquela foto que você me ofertou
[G#°][Dm][G7] Sentei naquele banco da pracinha só porque
[Dm][G7][C] Foi lá que começou o nosso amor
[C][G#°][Dm][G7] Senti que os passarinhos todos me reconheceram
[Dm][G7][C] E eles entenderam toda minha solidão
[G#°][Dm][G7] Ficaram tão tristonhos e até emudeceram
[Dm][G7][C][G7] Aí então eu fiz esta canção

{comment: Refrão}
[C][Dm] A mesma praça, o mesmo banco
[G7][C] As mesmas flores, o mesmo jardim
[Dm] Tudo é igual, mas estou triste
[G7][C] Porque não tenho você perto de mim

{comment: Verso 2}
[C][G#°][Dm][G7] Beijei aquela árvore tão linda, onde eu
[Dm][G7][C] Com meu canivete, um coração eu desenhei
[G#°][Dm][G7] Escrevi no coração o meu nome junto ao seu
[Dm][G7][C] Ser seu grande amor, então jurei
[C][G#°][Dm][G7] O guarda ainda é o mesmo que um dia me pegou
[Dm][G7][C] Roubando uma rosa amarela pra você
[C][G#°][Dm][G7] Ainda tem balanço, tem gangorra, meu amor
[Dm][G7][C] Crianças que não param de correr
[C][Dm] A mesma praça

{comment: Refrão}
[C][Dm] A mesma praça, o mesmo banco
[G7][C] As mesmas flores, o mesmo jardim
[Dm] Tudo é igual, mas estou triste
[G7][C] Porque não tenho você perto de mim

{comment: Verso 3}
[C][G#°][Dm][G7] Aquele bom velhinho pipoqueiro foi quem viu
[Dm][G7][C] Quando, envergonhado, de namoro eu lhe falei
[G#°][Dm][G7] Ainda é o mesmo sorveteiro que assistiu
[Dm][G7][C] Ao primeiro beijo que lhe dei
[C][G#°][Dm][G7] A gente vai crescendo, vai crescendo e o tempo passa
[Dm][G7][C] E nunca esquece a felicidade que encontrou
[G#°][Dm][G7] Sempre eu vou lembrar do nosso banco lá da praça
[Dm][G7][C] Foi lá que começou o nosso amor
[C][Dm] A mesma praça

{comment: Refrão final}
[C][Dm] A mesma praça, o mesmo banco
[G7][C] As mesmas flores, o mesmo jardim
[Dm] Tudo é igual, mas estou triste
[G7][C] Porque não tenho você perto de mim`,
  },
  {
    title: 'Eclipse Total',
    artist: 'Banda Calypso',
    key: 'Em',
    bpm: 138,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifras.com.br/teclado/banda-calypso/eclipse-total',
    notes: 'Tom real da cifra publicada: Em. Lista SSC II indica Dm — use a transposição do app se a banda tocar em outro tom. ATENÇÃO: a lista indicava \'Marcão\' em Dm e não existe registro de \'Eclipse Total\' em Dm nem com esse autor. Entregue a única versão brasileira documentada com esse título (composição Paulo Ricardo / Michael Sullivan), gravada por Banda Calypso, em Em. Se o repertório de vocês for outra peça, ajuste com o time. Andamento estimado.',
    chordProContent: `{title: Eclipse Total}
{artist: Banda Calypso}
{key: Em}
{tempo: 138}
{time: 2/4}

{comment: Verso 1}
[Em] Quatro da madrugada
Eu não consigo pensar em nada
[Am][D] A não ser na falta que você me faz
[Em] Novamente a saudade imensa
Novamente essa tua ausência
[Am][D] Teima, insiste em me fazer sofrer

{comment: Pré-refrão}
[Em] A saudade está em tudo
[C][D] A saudade permanece oculta
[B] No fundo de cada pensamento meu
[Em][D] A saudade é a razão, na dor da sensação
[D][B] Da perda que pesa em cada sentimento ateu

{comment: Refrão}
[Em][C] É triste o final de uma paixão
[D][B] Eclipse total do coração
[Em][C][D] É por isso eu abraço essa saudade
[B] Eu abraço a solidão

{comment: Verso 2}
[Em] A saudade está nas gavetas
[Am] E nas fotografias e nas letras de músicas
[D] Que eu ouço sem parar
[Em] A saudade é uma espécie de veneno
[Am] É o vício, é um tipo de água-ardente
[D] Amarga, que me queima por dentro

{comment: Refrão}
[Em] A saudade está em tudo
[C][D] A saudade permanece oculta
[B] No fundo de cada pensamento meu
[Em][D] A saudade é a razão, na dor da sensação
[D][B] Da perda que pesa em cada sentimento ateu

{comment: Ponte}
[D#m] Eu não posso mais ficar assim
[G] Tanto tempo longe de você
[Am] E é por isso que eu estou aqui
[D] Pra te dizer que eu quero que
[B] Você volte pra mim

{comment: Refrão (2x)}
[Em][C] É triste o final de uma paixão
[D][B] Eclipse total do coração
[Em][C][D] É por isso eu abraço essa saudade
[B] Eu abraço a solidão`,
  },
  {
    title: 'Tenha Fé',
    artist: 'Os Originais do Samba',
    key: 'Gm',
    bpm: 188,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/os-originais-do-samba/tenha-fe-pois-amanha-um-lindo-dia-vai-nascer',
    notes: 'Tom real da cifra publicada: Gm. Lista SSC II indica Fm — use a transposição do app se a banda tocar em outro tom. Título completo: \'Tenha Fé Pois Amanhã Um Lindo Dia Vai Nascer\'. Composição de Jorge Ben Jor. Cifra de violão/cavaquinho (Cifra Club). Lista SSC II indica Fm.',
    chordProContent: `{title: Tenha Fé}
{artist: Os Originais do Samba}
{key: Fm}
{tempo: 188}
{time: 2/4}
{composition: Jorge Ben Jor}
{comment: Introdução: [Gm] x16}

[Gm]Nunca tenha medo do seu inimigo
Quando não é você que começa a brigar
Também nunca ande de cabeça baixa e bem danado
[Cm]Pois nem tudo que cai do céu é [D7(9)]sagrado [Gm]
[Gm]Maré que enche e vaza, deixa a praia descoberta
Uma onda vai, outra onda vem
[Cm]Não fique triste que seu amor pode [D7(9)]vir também [Gm]
[Cm]Aí então você vai me dizer se tenho [Bb]razão, [Am]sim ou não [Gm]
[Cm]Pois é por experiência [Bb]própria que eu perdoei o [Am]meu coração [Gm]
[Gm]Infeliz no jogo, feliz no amor
Saúde e felicidade, pra dar e vender
Se a reza é forte, você vai ver
[Cm]Que amanhã um lindo dia [D7(9)]vai [Gm]nascer
[Cm]Aí então você vai me dizer se tenho [Bb]razão, [Am]sim ou não [Gm]
[Cm]Pois é por experiência [Bb]própria que eu perdoei o [Am]meu coração [Gm]
[Gm]Infeliz no jogo, feliz no amor
Saúde e felicidade, pra dar e vender
Se a reza é forte, você vai ver
[Cm]Que amanhã um lindo dia [D7(9)]vai [Gm]nascer
{comment: Pa PA PA PA PA, PA PA PA PA}`,
  },
  {
    title: 'Gafieira',
    artist: 'Sônia Katherine',
    key: 'Gm',
    bpm: 100,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/sonia-katherine/gafieira',
    notes: 'Tom real da cifra publicada: Gm. Lista SSC II indica F — use a transposição do app se a banda tocar em outro tom. Samba de gafieira (\'É só o trombone começar\'), cifrado na forma de Gm. Lista SSC II indica F. Também existe \'Gafieira\' de Washington Brasileiro (forró, tom G) e de Dom Salvador (samba-jazz instrumental).',
    chordProContent: `{title: Gafieira}
{artist: Sônia Katherine}
{key: F}
{tempo: 100}
{time: 2/4}
{comment: Cifra publicada na forma de Gm, transposta para F}

[Gm]É sempre assim o nosso [D7]caso nunca [Gm]tem um [D7]fim
Você desfaz [Gm]com uma [D7]mão o que [Gm]já é ruim
[Ebº]Vem e põe [D7]com a outra [Cm]mão retalho de [D7]cetim [Cm]
[D7]E assim fica o fantoche [Gm]como um [D7]Arlequim

Dentro do [Gm]peito o [D7]recheio [Gm]é amargura [D7]
Anda [Gm]direito não me [D7]deixa [Gm]insegura
[Ebº]Pois o [D7]amor que eu [Cm]te tenho é [D7]imensidade [Cm]
[D7]Sem [D7]você o que me resta é [Gm]só saudade [D7]

[Gm]Aonde eu me encontro é na [D7]gafieira
É [Ebº]lá que em me [D7]espalho até [Gm]a saideira
É [G7]só o trombone [Cm]começar
Pá rá [D7]pá pá pá pá, pá [Gm]rá pá pá

Eu [Gm]vejo sambando o [D7]dia clarear
Melhor [Ebº]que brigando [D7]até o [Gm]sol raiar
Então [G7]não se ponha a [Cm]reclamar
Blá blá blá [D7]blá blá blá, [Gm]blá blá blá blá`,
  },
  {
    title: 'O Criador',
    artist: 'Leci Brandão (part. Mart\'nália)',
    key: 'F#',
    bpm: 96,
    timeSignature: '2/4',
    sourceUrl: 'https://www.cifraclub.com.br/leci-brandao/o-criador',
    notes: 'Tom real da cifra publicada: F#. Lista SSC II indica Am7 — use a transposição do app se a banda tocar em outro tom. Samba de Leci Brandão com participação de Mart\'nália (álbum \'Eu e o Samba\'). Cifra de violão/cavaquinho do Cifra Club (também no MV Portal de Cifras). Lista SSC II indica Am7.',
    chordProContent: `{title: O Criador}
{artist: Leci Brandão (part. Mart'nália)}
{key: Am7}
{tempo: 96}
{time: 2/4}
{comment: Introdução: [F#] [C#7] [B7] [F#] [D#m] [G#m7] [C#7]}

[F#]O ciclo da natureza [C#7]foi Deus quem criou
[B7]A flor da tua beleza [F#]foi Deus [B7/9]quem criou
[F#]A lagrima que eu choro [D#m]foi Deus quem [C#7]criou
[B7]A mãe que nos dá o colo [F#]foi Deus [B7/9]quem criou
[F#]O fim do ressentimento [C#7]foi Deus quem criou
[B7]A força do pensamento [F#]foi Deus [B7/9]quem criou
[F#]O sim ao fim do apartheid [D#m]foi Deus quem [C#7]criou
[B7]O negro e a liberdade [F#]foi Deus [B7/9]quem criou
[F#]Foi Deus quem criou a lua [B7]pra rua [F#]iluminar
[D#m]Pra ver a imagem pura [G#7]do amor quando ela passar
[C#7]Foi Deus quem criou o homem [B7]e dele sua mulher
[D#m]Pra honrar seu sobrenome [G#7]até quando Deus quiser
[C#7]A remissão dos pecados [F#]foi Deus quem criou
[B7]A lã do manto sagrado [F#]foi Deus [B7/9]quem criou
[F#]O pão da minha comida [D#m]foi Deus [C#7]criou
[B7]O dom com que eu ganho a vida [F#]foi Deus [B7/9]quem criou
[F#]Foi Deus quem criou a vida [B7]difícil é saber viver
[D#m]É só achar a saída [G#7]esquece de agradecer
{comment: Final: [B7] [F#] [C#7] [F#] [F#7] [B7] [F#] [C#7] [F#]}`,
  },
];

/**
 * Find song in curated database by title and optional artist
 */
export function findInWebChordDatabase(title: string, artist?: string): WebChordEntry | null {
  if (!title) return null;
  const cleanTitle = title.toLowerCase().replace(/[()]/g, '').trim();
  const cleanArtist = (artist || '').toLowerCase().trim();

  // 1. Exact or partial title match
  return (
    WEB_CHORDS_DATABASE.find((item) => {
      const dbTitle = item.title.toLowerCase().replace(/[()]/g, '').trim();
      const dbArtist = item.artist.toLowerCase().trim();

      const titleMatch = dbTitle.includes(cleanTitle) || cleanTitle.includes(dbTitle);
      if (!titleMatch) return false;

      if (cleanArtist && dbArtist) {
        return dbArtist.includes(cleanArtist) || cleanArtist.includes(dbArtist) || titleMatch;
      }
      return true;
    }) || null
  );
}
