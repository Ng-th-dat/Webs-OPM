import { supabase } from '@/lib/supabase';

interface MasteryMaterialRow {
  material_id: string;
  image_url: string | null;
}

export async function fetchMasteryMaterialImages(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('mastery_materials').select('material_id, image_url');
  if (error) throw error;

  const images: Record<string, string> = {};
  for (const row of data as MasteryMaterialRow[]) {
    if (row.image_url) images[row.material_id] = row.image_url;
  }
  return images;
}

export async function setMasteryMaterialImage(materialId: string, imageUrl: string): Promise<void> {
  const { error } = await supabase
    .from('mastery_materials')
    .upsert({ material_id: materialId, image_url: imageUrl, updated_at: new Date().toISOString() });
  if (error) throw error;
}
