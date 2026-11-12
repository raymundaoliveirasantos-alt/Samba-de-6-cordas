/**
 * Tags do Repertório SSC II.
 *
 * A tabela `songs` do Supabase não tem colunas `block`, `order_in_block` nem
 * `instrument` — só `tags text[]`. Para que o Bloco e o Instrumento
 * sobrevivam ao ciclo push/pull do Supabase, eles viajam dentro das tags
 * (mesma convenção já usada pelo importador de arquivos).
 */

export const SSC_REPERTORY_TAG = 'Repertório SSC II';
export const SSC_BLOCK_TAG_PREFIX = 'Bloco ';
export const SSC_INSTRUMENT_TAG_PREFIX = 'Instrumento: ';

export type SscBlock = 'I' | 'II' | 'III';

export function sscTags(block?: string, instrument?: string): string[] {
  const tags: string[] = [SSC_REPERTORY_TAG];
  if (block) tags.push(`${SSC_BLOCK_TAG_PREFIX}${block}`);
  if (instrument) tags.push(`${SSC_INSTRUMENT_TAG_PREFIX}${instrument}`);
  return tags;
}

/** Recupera bloco e instrumento a partir das tags do Supabase. */
export function parseSscTags(tags: string[] | null | undefined): {
  block?: SscBlock;
  instrument?: string;
} {
  const result: { block?: SscBlock; instrument?: string } = {};
  for (const tag of tags || []) {
    if (tag.startsWith(SSC_BLOCK_TAG_PREFIX)) {
      const block = tag.slice(SSC_BLOCK_TAG_PREFIX.length).trim().toUpperCase();
      if (block === 'I' || block === 'II' || block === 'III') result.block = block;
    } else if (tag.startsWith(SSC_INSTRUMENT_TAG_PREFIX)) {
      result.instrument = tag.slice(SSC_INSTRUMENT_TAG_PREFIX.length).trim();
    }
  }
  return result;
}

/**
 * Ordem dentro do bloco, deduzida do id `ssc-song-N`.
 *
 * A tabela do Supabase não tem coluna para isso, mas o id já carrega a
 * numeração original do PDF — então a ordem se recupera sem guardar nada.
 */
export function sscOrderInBlock(id: string, block?: SscBlock): number | undefined {
  const match = /^ssc-song-(\d+)$/.exec(id);
  if (!match) return undefined;
  const n = Number(match[1]);
  if (block === 'II') return n - 16;
  if (block === 'III') return n - 32;
  if (block === 'I') return n;
  return n;
}
