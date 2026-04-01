const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function slugify(text) {
  return String(text || 'card')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'card';
}

function autoOpen(filePath) {
  try {
    const browser = process.env.BROWSER;
    if (browser) {
      // Use $BROWSER to open a file URL
      const fileUrl = `file://${filePath}`;
      const child = spawn(browser, [fileUrl], { stdio: 'ignore', detached: true });
      child.unref();
      return;
    }
    const platform = process.platform;
    let cmd;
    let args;
    if (platform === 'darwin') {
      cmd = 'open';
      args = [filePath];
    } else if (platform === 'win32') {
      cmd = 'cmd';
      args = ['/c', 'start', '', filePath];
    } else {
      cmd = 'xdg-open';
      args = [filePath];
    }
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
    child.unref();
  } catch (e) {
    // Silently ignore open failures
  }
}

module.exports = {
  ensureDirForFile,
  ensureDir,
  slugify,
  autoOpen,
};
