import fs from 'fs';

import '../server/database/database';
import Os from '../server/database/os';

fs.readFile('../server/database/db.json', (err, data) => {
  if (err) return console.error(err);
  const osData = JSON.parse(data);
  osData.os.forEach(os => {
    const osInDb = new Os(os);
    osInDb.save((err, user) => {
      if (err) return console.error(err);
      console.log(`os ${os.title} created.`);
    });
  });
});
