import { auth } from "@/lib/firebase";

const API_URL = "http://localhost:4000";

const getToken = async () => {
  return new Promise<string>((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();

      if (!user) {
        reject("No user");
      } else {
        const token = await user.getIdToken();
        resolve(token);
      }
    });
  });
};

export const apiFetch = async (url: string, options: any = {}) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  return fetch(`http://localhost:4000${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
};