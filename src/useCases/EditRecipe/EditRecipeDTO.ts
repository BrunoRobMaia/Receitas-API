export interface EditRecipeDTO {
  id: number;
  id_usuarios: number;
  id_categorias?: number;
  nome?: string;
  tempo_preparo_minutos?: number;
  porcoes?: number;
  modo_preparo?: string;
  ingredientes?: string;
}
