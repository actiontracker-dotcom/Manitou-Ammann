import { getUsers } from "@/lib/services/usersService";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function getAdminEmails() {
  try {
    const users = await getUsers();
    const emails = [];

    for (const user of users) {
      if (!user.active) continue;
      const role = String(user.role || "").trim().toLowerCase();
      if (role !== "admin") continue;
      const email = String(user.email || "").trim();
      if (!email || !isValidEmail(email)) continue;
      const normalized = email.toLowerCase();
      if (!emails.includes(normalized)) {
        emails.push(normalized);
      }
    }

    if (emails.length === 0) {
      console.warn("[Email] No active Admin users with valid email addresses found.");
    }

    return emails;
  } catch (error) {
    console.error("[Email] Failed to resolve admin emails from User Directory:", error.message);
    return [];
  }
}

export async function getUserEmail(username) {
  if (!username) return null;
  try {
    const users = await getUsers();
    const match = users.find(
      (u) => u.active && u.username.toLowerCase() === String(username).trim().toLowerCase()
    );
    if (!match) {
      console.warn("[Email] No active user found for username:", username);
      return null;
    }
    const email = String(match.email || "").trim();
    if (!email || !isValidEmail(email)) {
      console.warn("[Email] User", username, "has no valid email address.");
      return null;
    }
    return email;
  } catch (error) {
    console.error("[Email] Failed to resolve user email for", username, ":", error.message);
    return null;
  }
}

export function isTestMode() {
  return process.env.EMAIL_TEST_MODE === "true";
}
