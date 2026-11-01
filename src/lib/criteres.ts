/**
 * Libellés des critères d'importance renvoyés par l'API (`LIBELLES_CRITERES`, energyhome-api app/ml/features_v3.py)
 * → clé de traduction `result.transp.criteria.<clé>`. Un libellé inconnu est affiché tel quel.
 */
export const CRITERES: Record<string, string> = {
  Surface: 'surface',
  'Période de construction': 'periode',
  'Type de bâtiment': 'type_batiment',
  'Énergie de chauffage': 'chauffage',
  Département: 'departement',
  'Zone climatique': 'zone_climatique',
};

export function cleCritere(critere: string): string | null {
  return CRITERES[critere] ?? null;
}
