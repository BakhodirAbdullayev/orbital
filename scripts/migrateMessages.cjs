// scripts/migrateMessages.js

const admin = require("firebase-admin");

// -----------------------------------------------------------
// 1. Firebase Admin SDK ni sozlash
// `path/to/your/firebase-admin-key.json` ni yuklab olgan kalit faylingizning yo'li bilan almashtiring
// Misol: './firebase-admin-key.json' agar loyihaning ildizida bo'lsa
const serviceAccount = require("../firebase-admin-key.json"); // Agar scripts/ ichida bo'lsa, '../' kerak bo'ladi

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Firestore'ga ulash uchun databaseURL shart emas, lekin boshqa xizmatlar uchun kerak bo'lishi mumkin
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL, // Sizning loyiha ID'ingizni qo'ying
});

const db = admin.firestore();

// -----------------------------------------------------------
// 2. Migratsiya funksiyasi
async function runMigration() {
  console.log("--- Starting Message Type Migration ---");

  const chatsRef = db.collection("chats");
  let updatedChatsCount = 0;
  let updatedMessagesCount = 0;

  try {
    const chatsSnapshot = await chatsRef.get();

    if (chatsSnapshot.empty) {
      console.log("No chats found to migrate.");
      return;
    }

    // Har bir chat uchun
    for (const chatDoc of chatsSnapshot.docs) {
      const chatId = chatDoc.id;
      const messagesRef = db
        .collection("chats")
        .doc(chatId)
        .collection("messages");

      // Har bir chat ichidagi barcha xabarlar uchun
      const messagesSnapshot = await messagesRef.get();

      if (messagesSnapshot.empty) {
        // console.log(`Chat ${chatId}: No messages found.`);
        continue; // Keyingi chatga o'tish
      }

      // Batch yozish (bir vaqtda ko'p yozuvlarni bajarish uchun)
      // Firestore batch 500 ta operatsiyani qo'llab-quvvatlaydi
      let batch = db.batch();
      let batchCount = 0;
      let chatMessagesUpdated = 0;

      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = messageDoc.data();

        // Faqat `type` maydoni mavjud bo'lmasa yoki null bo'lsa yangilaymiz
        if (messageData.type === undefined || messageData.type === null) {
          batch.update(messageDoc.ref, { type: "text" });
          batchCount++;
          chatMessagesUpdated++;
        }

        // Agar batch to'lib qolsa (yoki chegaraga yaqinlashsa), uni commit qilamiz va yangi batch boshlaymiz
        if (batchCount >= 499) {
          // 500 ga yetmasdan oldin commit qilib yuboramiz
          await batch.commit();
          console.log(
            `  > Chat ${chatId}: Committed a batch of ${batchCount} updates.`
          );
          batch = db.batch(); // Yangi batch
          batchCount = 0;
        }
      }

      // Qolgan operatsiyalarni commit qilish (agar batch bo'sh bo'lmasa)
      if (batchCount > 0) {
        await batch.commit();
        console.log(
          `  > Chat ${chatId}: Committed final batch of ${batchCount} updates.`
        );
      }

      if (chatMessagesUpdated > 0) {
        updatedChatsCount++;
        updatedMessagesCount += chatMessagesUpdated;
        console.log(`Chat ${chatId}: ${chatMessagesUpdated} messages updated.`);
      } else {
        // console.log(`Chat ${chatId}: No messages needed update.`);
      }
    }

    console.log("--- Migration Complete ---");
    console.log(`Total chats updated: ${updatedChatsCount}`);
    console.log(`Total messages updated: ${updatedMessagesCount}`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// -----------------------------------------------------------
// 3. Migratsiyani ishga tushirish
runMigration();
