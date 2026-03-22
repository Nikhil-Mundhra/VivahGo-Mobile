const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..', '..');
const APP_DIR = fs.existsSync(path.join(ROOT, 'VivahGo')) ? 'VivahGo' : 'vivahgo';

function normalizeRelativePath(relativePath) {
  if (relativePath.startsWith('VivahGo/')) {
    return `${APP_DIR}/${relativePath.slice('VivahGo/'.length)}`;
  }
  if (relativePath.startsWith('vivahgo/')) {
    return `${APP_DIR}/${relativePath.slice('vivahgo/'.length)}`;
  }
  return relativePath;
}

function toAbs(relativePath) {
  return path.join(ROOT, normalizeRelativePath(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(toAbs(relativePath), 'utf8');
}

function toFileUrl(relativePath) {
  return pathToFileURL(toAbs(relativePath)).href;
}

function createRes() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    ended: false,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

module.exports = {
  ROOT,
  createRes,
  readText,
  toAbs,
  toFileUrl,
};
