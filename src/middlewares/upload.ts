import multer from "multer";
import path from "path";

// File သိမ်းမယ့်နေရာ သတ်မှတ်ပေးခြင်း
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // File နာမည်ကို Unique ဖြစ်အောင် Timestamp နဲ့ ရောပေးမယ်
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });
