import '../server/database/database';
import Os from '../server/database/os';


Os.remove({})
  .then(() => {
    console.log('oszoo is now empty');
    process.exit(0);
  });
