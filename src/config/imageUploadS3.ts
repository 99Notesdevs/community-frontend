import { api } from "@/api/route";

export const uploadImageToS3 = async (formData: FormData, folder: string, name?: string): Promise<string | null> => {

  const res = await api.post(`/aws/upload-image?folder=${folder}&name=${name}`, formData);
  const typedRes = res as { success: boolean; data: string };
  if (!typedRes.success) return null;

  const data = typedRes.data;
  return data || null;
};