import { ErrorRequestHandler } from 'express';
import fs from 'fs';

export const errorHandler: ErrorRequestHandler = (error, _, res, next) => {
  if (error) {
    process.chdir('src/logs');
    const filePath = './errorLogs.json';

    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) throw err;

      const logs = JSON.parse(data);

      logs.push({
        time: new Date().toISOString(),
        message: `${error.name}: ${error.message}`,
        stack: error.stack,
      });

      fs.writeFile(
        filePath,
        JSON.stringify(logs, null, 2),
        { encoding: 'utf8' },
        () => console.log(`Error logged at ${new Date()}`)
      );
    });

    res.status(500).json({
      err: 'INTERNAL_SERVER_ERROR',
      errMessage: 'Exception has occurred',
    });
  } else {
    next();
  }
};
