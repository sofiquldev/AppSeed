import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const SKIP = new Set(["node_modules", "vendor", ".next", ".git", "dist"]);

export function zipDirectory(srcDir, destZip) {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Nothing to zip: ${srcDir}`);
  }

  const files = [];
  walk(srcDir, "", files);

  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const file of files) {
    const data = fs.readFileSync(file.abs);
    const compressed = zlib.deflateRawSync(data);
    const crc = crc32(data);
    const name = Buffer.from(file.rel.split(path.sep).join("/"), "utf8");
    const local = localHeader(name, crc, compressed.length, data.length);
    locals.push(local, compressed);
    centrals.push(centralHeader(name, crc, compressed.length, data.length, offset));
    offset += local.length + compressed.length;
  }

  const central = Buffer.concat(centrals);
  const out = Buffer.concat([...locals, central, eocd(centrals.length, central.length, offset)]);
  if (destZip) {
    fs.mkdirSync(path.dirname(destZip), { recursive: true });
    fs.writeFileSync(destZip, out);
  }
  return out;
}

function walk(root, rel, files) {
  const dir = rel ? path.join(root, rel) : root;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.name.endsWith(".zip")) continue;
    const child = rel ? path.join(rel, entry.name) : entry.name;
    if (entry.isDirectory()) walk(root, child, files);
    else if (entry.isFile()) files.push({ rel: child, abs: path.join(root, child) });
  }
}

function localHeader(name, crc, compressed, original) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(compressed, 18);
  header.writeUInt32LE(original, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, name]);
}

function centralHeader(name, crc, compressed, original, offset) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(8, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(compressed, 20);
  header.writeUInt32LE(original, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, name]);
}

function eocd(count, centralSize, centralOffset) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(count, 8);
  header.writeUInt16LE(count, 10);
  header.writeUInt32LE(centralSize, 12);
  header.writeUInt32LE(centralOffset, 16);
  header.writeUInt16LE(0, 20);
  return header;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
