/* eslint-disable @typescript-eslint/no-require-imports */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.newMessageNotification = functions.firestore
  .document("messages/{id}")
  .onCreate(async (snap) => {
    const data = snap.data();

    if (!data || data.from !== "admin") {
      return null;
    }

    const tokensSnap = await db
      .collection("tokens")
      .where("role", "==", "user")
      .get();
    const tokens = tokensSnap.docs
      .map((docItem) => docItem.data().token)
      .filter(Boolean);

    if (!tokens.length) {
      return null;
    }

    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: "New Message 💌",
        body: data.text,
      },
    });

    return null;
  });

exports.waterReminder = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(async () => {
    const tokensSnap = await db
      .collection("tokens")
      .where("role", "==", "user")
      .get();
    const tokens = tokensSnap.docs
      .map((docItem) => docItem.data().token)
      .filter(Boolean);

    if (!tokens.length) {
      return null;
    }

    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: "Hydration Reminder 💧",
        body: "Drink some water now!",
      },
    });

    return null;
  });
