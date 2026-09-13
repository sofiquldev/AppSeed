import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "data", "users.json");

function readAll() {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeAll(users) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(users, null, 2)}\n`);
}

export function listUsers() {
  return readAll();
}

export function findUserByEmail(email) {
  return readAll().find((user) => user.email === email) || null;
}

export function findUserById(id) {
  return readAll().find((user) => String(user.id) === String(id)) || null;
}

export function createUser({ name, email, password, role = "user" }) {
  const users = readAll();
  if (users.some((user) => user.email === email)) {
    throw new Error("Email already in use");
  }
  const user = {
    id: String(users.length + 1),
    name,
    email,
    password,
    role,
  };
  users.push(user);
  writeAll(users);
  return user;
}

export function updateUser(id, patch) {
  const users = readAll();
  const index = users.findIndex((user) => String(user.id) === String(id));
  if (index === -1) return null;
  users[index] = { ...users[index], ...patch, id: users[index].id };
  writeAll(users);
  return users[index];
}
