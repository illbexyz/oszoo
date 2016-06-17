import fs from 'fs';
import path from 'path';

import '../server/database/database';
import Os from '../server/database/os';

function handleError(err) {
  console.error(err);
  process.exit(1);
}

try {
  const file = path.resolve('./src/config/db.json');
  const data = fs.readFileSync(file);
  const osData = JSON.parse(data);
  const promises = [];
  osData.os.forEach(os => {
    const p = new Promise((resolve, reject) => {
      Os.findOne({ title: os.title }, 'title')
        .then(osInDb => resolve(`${osInDb.title} already exists`))
        .catch(() => {
          const newOs = new Os(os);
          newOs.save((saveErr, savedOs) => {
            if (saveErr) reject(saveErr);
            else resolve(`${savedOs.title} created.`);
          });
        });
    });
    promises.push(p);
  });
  Promise.all(promises)
    .then(values => {
      values.forEach(v => console.log(v));
    })
    .then(() => process.exit(0));
} catch (readError) {
  handleError(readError);
}
