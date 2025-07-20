// src/utils/firebaseUtils.ts
import { storage } from "../config/firebase"; // Firebase config faylingizni to'g'ri yo'naltiring
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid"; // Noyob ID yaratish uchun

interface UploadResult {
  url: string;
  name: string;
}

export const uploadImageAndGetUrl = (
  file: File,
  userId: string, // Qaysi foydalanuvchi yuklayotganini bilish uchun
  onProgress?: (progress: number) => void // Yuklash progressini kuzatish uchun
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    // Rasmlarni foydalanuvchi UID'si ichidagi 'chat_images' papkasiga saqlaymiz
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`; // Noyob fayl nomi
    const storageRef = ref(storage, `${userId}/chat_images/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress && onProgress(progress);
        // console.log('Upload is ' + progress + '% done'); // Debug uchun
      },
      (error) => {
        console.error("Image upload failed:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ url: downloadURL, name: fileName });
      }
    );
  });
};
