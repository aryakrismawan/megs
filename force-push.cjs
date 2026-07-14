const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Hapus lock file jika ada karena terminal tersangkut
  const lockPath = path.join(__dirname, '.git', 'index.lock');
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log('Removed stray git index.lock');
  }

  // Tambahkan semua file yang belum ter-commit
  console.log('Adding files...');
  execSync('git add .');

  // Lakukan commit
  console.log('Committing...');
  execSync('git commit -m "feat: improve search UI layout to match satisfy design"');

  // Push ke Github
  console.log('Pushing to GitHub...');
  execSync('git push');

  console.log('BERHASIL! Kode terbaru telah didorong ke GitHub.');
} catch (error) {
  console.error('Terjadi kesalahan:', error.stdout ? error.stdout.toString() : error.message);
}
