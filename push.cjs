const { execSync } = require('child_process');

try {
  console.log('Menambahkan file...');
  execSync('git add .');

  console.log('Melakukan commit...');
  execSync('git commit -m "fix: typescript errors in import meta env"');

  console.log('Pushing to GitHub...');
  execSync('git push');
  console.log('BERHASIL! Kode terbaru telah didorong ke GitHub.');
} catch (error) {
  console.error('Terjadi kesalahan:', error.stdout ? error.stdout.toString() : error.message);
}
