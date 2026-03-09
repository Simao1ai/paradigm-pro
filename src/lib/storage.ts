import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveFile(
  file: File,
  subfolder: string = "materials"
): Promise<{ url: string; size: number }> {
  const dir = path.join(UPLOAD_DIR, subfolder);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${uuidv4()}${ext}`;
  const filepath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return {
    url: `/uploads/${subfolder}/${filename}`,
    size: buffer.length,
  };
}

export function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase().replace(".", "");
  return ext || "unknown";
}
