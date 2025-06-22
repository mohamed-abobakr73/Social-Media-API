import multer from "multer";
import storage from "./cloudinaryConfig";

const upload = multer({ storage });

export default upload;
