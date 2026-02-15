import { api } from "@/api/route";
import imageCompression from "browser-image-compression";

export const uploadImageToS3 = async (formData: FormData, folder: string, name?: string): Promise<string | null> => {

  const params = new URLSearchParams();
  params.set("folder", folder);
  if (name) params.set("name", name);

  const res = await api.post(`/aws/upload-image?${params.toString()}`, formData);
  const typedRes = res as { success: boolean; data: string };
  if (!typedRes.success) return null;

  const data = typedRes.data;
  return data || null;
};

export const compressFile = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
  }
  const compressedFile = await imageCompression(file, options)

  return compressedFile;
}