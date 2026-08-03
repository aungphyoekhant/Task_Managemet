import fs from "fs";
import path from "path";

export const deleteFile = (filePath: string | null) => {
  if (!filePath) return;

  const fileName = path.basename(filePath);
  const fullPath = path.join("uploads", fileName);

  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};
