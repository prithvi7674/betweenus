import {
  User,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import firebaseApp from "@/firebase/config";

export function getFirebaseAuth(): Auth {
  return getAuth(firebaseApp);
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  );
  return credential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}
