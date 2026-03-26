import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Firestore,
  type Unsubscribe,
  where,
  writeBatch,
} from "firebase/firestore";
import firebaseApp from "@/firebase/config";

export const db = getFirestore(firebaseApp);

export type UserRole = "admin" | "user";

export interface UserProfile {
  email: string;
  role: UserRole;
}

export interface WaterLog {
  id: string;
  userEmail: string;
  amount: number;
  date: string;
  createdAtMs: number | null;
}

export interface WaterSettings {
  userEmail: string;
  dailyGoal: number;
}

export interface AppMessage {
  id: string;
  text: string;
  from: "admin" | "user";
  timestampMs: number | null;
  locked: boolean;
}

export type MoodType = "happy" | "okay" | "sad" | "angry";

export interface MoodLog {
  id: string;
  userEmail: string;
  mood: MoodType;
  note: string;
  date: string;
  createdAtMs: number | null;
}

export interface CycleSettings {
  userEmail: string;
  lastPeriodDate: string;
  cycleLength: number;
}

export interface ThinkingEvent {
  id: string;
  sender: string;
  timestampMs: number | null;
}

export type GreetingType = "morning" | "afternoon" | "evening";

export interface GreetingMessage {
  id: string;
  text: string;
  type: GreetingType;
  createdAtMs: number | null;
}

export interface SavedToken {
  userEmail: string;
  token: string;
  role: UserRole;
}

export function getFirestoreDb(): Firestore {
  return getFirestore(firebaseApp);
}

export async function getUserProfileByEmail(
  email: string,
): Promise<UserProfile | null> {
  const usersQuery = query(
    collection(getFirestoreDb(), "users"),
    where("email", "==", email),
    limit(1),
  );
  const snapshot = await getDocs(usersQuery);

  if (snapshot.empty) {
    return null;
  }

  const data = snapshot.docs[0].data();

  if (
    typeof data.email !== "string" ||
    (data.role !== "admin" && data.role !== "user")
  ) {
    return null;
  }

  return {
    email: data.email,
    role: data.role,
  };
}

export function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

export function getPastDateString(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

export async function addWaterLog(input: {
  userEmail: string;
  amount: number;
  date?: string;
}) {
  await addDoc(collection(getFirestoreDb(), "waterLogs"), {
    userEmail: input.userEmail,
    amount: input.amount,
    date: input.date ?? getTodayDateString(),
    createdAt: serverTimestamp(),
  });
}

export function subscribeToRecentWaterLogs(
  userEmail: string,
  days = 7,
  callback: (logs: WaterLog[]) => void,
): Unsubscribe {
  const earliestDate = getPastDateString(days - 1);
  const logsQuery = query(
    collection(getFirestoreDb(), "waterLogs"),
    where("userEmail", "==", userEmail),
    where("date", ">=", earliestDate),
    orderBy("date", "desc"),
  );

  return onSnapshot(logsQuery, (snapshot) => {
    const logs = snapshot.docs
      .map((item) => {
        const data = item.data();

        if (
          typeof data.userEmail !== "string" ||
          typeof data.amount !== "number" ||
          typeof data.date !== "string"
        ) {
          return null;
        }

        return {
          id: item.id,
          userEmail: data.userEmail,
          amount: data.amount,
          date: data.date,
          createdAtMs:
            typeof data.createdAt?.toMillis === "function"
              ? data.createdAt.toMillis()
              : null,
        } satisfies WaterLog;
      })
      .filter((item): item is WaterLog => item !== null);

    callback(logs);
  });
}

export function subscribeToWaterSettings(
  userEmail: string,
  callback: (settings: WaterSettings | null) => void,
): Unsubscribe {
  const settingsQuery = query(
    collection(getFirestoreDb(), "settings"),
    where("userEmail", "==", userEmail),
    limit(1),
  );

  return onSnapshot(settingsQuery, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }

    const data = snapshot.docs[0].data();

    if (
      typeof data.userEmail !== "string" ||
      typeof data.dailyGoal !== "number"
    ) {
      callback(null);
      return;
    }

    callback({
      userEmail: data.userEmail,
      dailyGoal: data.dailyGoal,
    });
  });
}

export async function upsertWaterSettings(settings: WaterSettings) {
  await setDoc(
    doc(getFirestoreDb(), "settings", settings.userEmail),
    settings,
    { merge: true },
  );
}

export async function addMessage(input: {
  text: string;
  from: "admin" | "user";
  locked?: boolean;
}) {
  await addDoc(collection(getFirestoreDb(), "messages"), {
    text: input.text,
    from: input.from,
    userEmail: input.from === "admin" ? "admin@betweenus.app" : "user",
    locked: input.locked ?? false,
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(
  callback: (messages: AppMessage[]) => void,
): Unsubscribe {
  const messagesQuery = query(
    collection(getFirestoreDb(), "messages"),
    orderBy("timestamp", "desc"),
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs
      .map((item) => {
        const data = item.data();

        if (
          typeof data.text !== "string" ||
          (data.from !== "admin" && data.from !== "user")
        ) {
          return null;
        }

        const timestampSource = data.timestamp ?? data.createdAt;

        return {
          id: item.id,
          text: data.text,
          from: data.from,
          timestampMs:
            typeof timestampSource?.toMillis === "function"
              ? timestampSource.toMillis()
              : null,
          locked: typeof data.locked === "boolean" ? data.locked : false,
        } satisfies AppMessage;
      })
      .filter((item): item is AppMessage => item !== null);

    callback(messages);
  });
}

export async function addMoodLog(input: {
  userEmail: string;
  mood: MoodType;
  note?: string;
  date?: string;
}) {
  await addDoc(collection(getFirestoreDb(), "moods"), {
    userEmail: input.userEmail,
    mood: input.mood,
    note: input.note ?? "",
    date: input.date ?? getTodayDateString(),
    createdAt: serverTimestamp(),
  });
}

export function subscribeToRecentMoodLogs(
  userEmail: string,
  days = 7,
  callback: (logs: MoodLog[]) => void,
): Unsubscribe {
  const earliestDate = getPastDateString(days - 1);
  const moodQuery = query(
    collection(getFirestoreDb(), "moods"),
    where("userEmail", "==", userEmail),
    where("date", ">=", earliestDate),
    orderBy("date", "desc"),
  );

  return onSnapshot(moodQuery, (snapshot) => {
    const logs = snapshot.docs
      .map((item) => {
        const data = item.data();

        if (
          typeof data.userEmail !== "string" ||
          typeof data.note !== "string" ||
          typeof data.date !== "string" ||
          (data.mood !== "happy" &&
            data.mood !== "okay" &&
            data.mood !== "sad" &&
            data.mood !== "angry")
        ) {
          return null;
        }

        return {
          id: item.id,
          userEmail: data.userEmail,
          mood: data.mood,
          note: data.note,
          date: data.date,
          createdAtMs:
            typeof data.createdAt?.toMillis === "function"
              ? data.createdAt.toMillis()
              : null,
        } satisfies MoodLog;
      })
      .filter((item): item is MoodLog => item !== null);

    callback(logs);
  });
}

export async function upsertCycleSettings(settings: CycleSettings) {
  await setDoc(
    doc(getFirestoreDb(), "cycles", settings.userEmail),
    settings,
    { merge: true },
  );
}

export function subscribeToCycleSettings(
  userEmail: string,
  callback: (settings: CycleSettings | null) => void,
): Unsubscribe {
  const cycleQuery = query(
    collection(getFirestoreDb(), "cycles"),
    where("userEmail", "==", userEmail),
    limit(1),
  );

  return onSnapshot(cycleQuery, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }

    const data = snapshot.docs[0].data();

    if (
      typeof data.userEmail !== "string" ||
      typeof data.lastPeriodDate !== "string" ||
      typeof data.cycleLength !== "number"
    ) {
      callback(null);
      return;
    }

    callback({
      userEmail: data.userEmail,
      lastPeriodDate: data.lastPeriodDate,
      cycleLength: data.cycleLength,
    });
  });
}

export async function addThinkingEvent(sender: string) {
  await addDoc(collection(getFirestoreDb(), "thinkingEvents"), {
    sender,
    timestamp: serverTimestamp(),
  });
}

export function subscribeToThinkingEvents(
  callback: (events: ThinkingEvent[]) => void,
): Unsubscribe {
  const thinkingQuery = query(
    collection(getFirestoreDb(), "thinkingEvents"),
    orderBy("timestamp", "desc"),
    limit(10),
  );

  return onSnapshot(thinkingQuery, (snapshot) => {
    const events = snapshot.docs
      .map((item) => {
        const data = item.data();

        if (typeof data.sender !== "string") {
          return null;
        }

        return {
          id: item.id,
          sender: data.sender,
          timestampMs:
            typeof data.timestamp?.toMillis === "function"
              ? data.timestamp.toMillis()
              : null,
        } satisfies ThinkingEvent;
      })
      .filter((item): item is ThinkingEvent => item !== null);

    callback(events);
  });
}

export async function addGreeting(input: {
  text: string;
  type: GreetingType;
}) {
  await addDoc(collection(getFirestoreDb(), "greetings"), {
    text: input.text,
    type: input.type,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToGreetings(
  type: GreetingType,
  callback: (greetings: GreetingMessage[]) => void,
): Unsubscribe {
  const greetingQuery = query(
    collection(getFirestoreDb(), "greetings"),
    where("type", "==", type),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(greetingQuery, (snapshot) => {
    const greetings = snapshot.docs
      .map((item) => {
        const data = item.data();

        if (
          typeof data.text !== "string" ||
          (data.type !== "morning" &&
            data.type !== "afternoon" &&
            data.type !== "evening")
        ) {
          return null;
        }

        return {
          id: item.id,
          text: data.text,
          type: data.type,
          createdAtMs:
            typeof data.createdAt?.toMillis === "function"
              ? data.createdAt.toMillis()
              : null,
        } satisfies GreetingMessage;
      })
      .filter((item): item is GreetingMessage => item !== null);

    callback(greetings);
  });
}

export async function saveMessagingToken(input: SavedToken) {
  await setDoc(
    doc(getFirestoreDb(), "tokens", input.token),
    {
      userEmail: input.userEmail,
      token: input.token,
      role: input.role,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function removeMessagingToken(token: string) {
  await deleteDoc(doc(getFirestoreDb(), "tokens", token));
}

export async function resetDay() {
  const batch = writeBatch(db);
  const collectionsToClear = ["waterLogs", "moods", "messages"];

  for (const collectionName of collectionsToClear) {
    const snapshot = await getDocs(collection(db, collectionName));

    snapshot.forEach((docItem) => {
      batch.delete(docItem.ref);
    });
  }

  await batch.commit();
}
