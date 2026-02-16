/**
 * Design system tokens resolver: bind Auto Layout spacing/padding to Figma Variables (Genome)
 * by exact variable name. Resolves at runtime via figma.variables API.
 * Fails safely: if a variable is not found, fall back to px and warn once.
 */

/** Token keys we use for email template layout (gap + padding). */
export type GenomeSpacingTokenKey =
  | 'sectionPaddingX'
  | 'sectionPaddingY'
  | 'stackGapPrimary'
  | 'stackGapSecondary'
  | 'attributionGap'
  | 'buttonPaddingX'
  | 'buttonPaddingY';

/**
 * Map: our usage key → exact variable name in file (Genome or other).
 * Update names after running "Copy available variable names" if your file uses different names.
 */
export const GENOME_SPACING_NAMES: Record<GenomeSpacingTokenKey, string> = {
  sectionPaddingX: 'onPage/section/horizontal/xl',
  sectionPaddingY: 'onPage/section/vertical/xl',
  stackGapPrimary: 'onPage/section/vertical/xl',
  stackGapSecondary: 'onSurface/component/vertical/md',
  attributionGap: 'onSurface/component/vertical/sm',
  buttonPaddingX: 'onSurface/button/horizontal/md',
  buttonPaddingY: 'onSurface/button/vertical/md',
};

/** Fallback px values when variable is not found (match current layout). */
export const GENOME_SPACING_FALLBACK_PX: Record<GenomeSpacingTokenKey, number> = {
  sectionPaddingX: 24,
  sectionPaddingY: 24,
  stackGapPrimary: 24,
  stackGapSecondary: 16,
  attributionGap: 8,
  buttonPaddingX: 16,
  buttonPaddingY: 12,
};

type Variable = import('figma__types').Variable;
type VariableBindableNodeField = import('figma__types').VariableBindableNodeField;

let nameToVariable: Map<string, Variable> | null = null;
const warnedKeys = new Set<GenomeSpacingTokenKey>();

/**
 * Resolve all Genome spacing variables by exact name. Call once before insert (e.g. start of insert flow).
 * Caches in-memory so we do not re-scan on every insert.
 */
export async function resolveGenomeSpacingTokens(): Promise<void> {
  if (nameToVariable != null) return;
  const map = new Map<string, FigmaVariable>();
  try {
    const variables = await figma.variables.getLocalVariablesAsync();
    for (const v of variables) {
      if (v.name) map.set(v.name, v);
    }
    nameToVariable = map;
  } catch {
    nameToVariable = map;
  }
}

/**
 * Get the resolved Variable for a token key, or null if not found.
 * Must have called resolveGenomeSpacingTokens() first.
 */
export function getResolvedVariable(tokenKey: GenomeSpacingTokenKey): FigmaVariable | null {
  if (nameToVariable == null) return null;
  const name = GENOME_SPACING_NAMES[tokenKey];
  return nameToVariable.get(name) ?? null;
}

/**
 * Get fallback px value for a token key.
 */
export function getFallbackPx(tokenKey: GenomeSpacingTokenKey): number {
  return GENOME_SPACING_FALLBACK_PX[tokenKey];
}

/**
 * Apply spacing binding: bind the node field to the variable for tokenKey if found,
 * otherwise set the numeric value and log a non-blocking warning once per token.
 */
export function applySpacingBinding(
  node: FrameNode,
  field: VariableBindableField,
  tokenKey: GenomeSpacingTokenKey,
  pxFallback: number
): void {
  const variable = getResolvedVariable(tokenKey);
  if (variable != null) {
    try {
      node.setBoundVariable(field, variable);
      return;
    } catch {
      /* fall through to numeric */
    }
  }
  switch (field) {
    case 'itemSpacing':
      node.itemSpacing = pxFallback;
      break;
    case 'paddingLeft':
      node.paddingLeft = pxFallback;
      break;
    case 'paddingRight':
      node.paddingRight = pxFallback;
      break;
    case 'paddingTop':
      node.paddingTop = pxFallback;
      break;
    case 'paddingBottom':
      node.paddingBottom = pxFallback;
      break;
    default:
      return;
  }
  if (!warnedKeys.has(tokenKey)) {
    warnedKeys.add(tokenKey);
    console.warn(
      `[Genome tokens] Variable "${GENOME_SPACING_NAMES[tokenKey]}" not found; using ${pxFallback}px for ${tokenKey}.`
    );
  }
}

/**
 * Clear cached resolution (e.g. after file or variables change). Next insert will re-resolve.
 */
export function clearGenomeTokensCache(): void {
  nameToVariable = null;
  warnedKeys.clear();
}

/**
 * Debug: return all variable names + ids + collection name for dump/copy.
 * Includes local variable collections and variables from enabled (library) collections
 * (e.g. Genome spacing/padding), so you can see names like onPage/section/vertical/xl.
 * Requires "teamlibrary" in plugin manifest for library variables.
 */
export async function getAllVariableNamesForDump(): Promise<Array<{ collection: string; name: string; id: string }>> {
  const out: Array<{ collection: string; name: string; id: string }> = [];
  try {
    // Local file variable collections
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    for (const col of collections) {
      const collectionName = col.name ?? 'Unnamed';
      for (const id of col.variableIds) {
        const v = await figma.variables.getVariableByIdAsync(id);
        if (v) out.push({ collection: collectionName, name: v.name ?? '', id: v.id });
      }
    }
    // Enabled library variable collections (e.g. Genome – spacing/padding tokens)
    if (typeof figma.teamLibrary !== 'undefined' && figma.teamLibrary != null) {
      try {
        const libraryCollections =
          await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
        for (const libCol of libraryCollections) {
          const collectionName = 'Library: ' + (libCol.name ?? libCol.key ?? 'Unnamed');
          try {
            const libVars =
              await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libCol.key);
            for (const v of libVars) {
              const name = (v as { name?: string }).name ?? (v as { key?: string }).key ?? '';
              const id = (v as { key?: string }).key ?? (v as { id?: string }).id ?? '';
              out.push({ collection: collectionName, name, id });
            }
          } catch (err) {
            console.warn('[Genome tokens] getVariablesInLibraryCollectionAsync failed for', libCol.key, err);
          }
        }
      } catch (e) {
        console.warn('[Genome tokens] getAvailableLibraryVariableCollectionsAsync failed:', e);
      }
    }
    out.sort((a, b) => (a.collection + '/' + a.name).localeCompare(b.collection + '/' + b.name));
  } catch (e) {
    console.error('[Genome tokens] getAllVariableNamesForDump failed:', e);
  }
  return out;
}
