import { ErrorRequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (error, _, res, next) => {
  if (!error) return next();

  const filePath = path.join(process.cwd(), 'src/logs/errorLogs.json');

  fs.readFile(filePath, 'utf-8', (err, data) => {
    let logs = [];

    if (!err && data) {
      try {
        logs = JSON.parse(data);
      } catch {
        logs = [];
      }
    }

    logs.push({
      time: new Date().toISOString(),
      message: `${error.name}: ${error.message}`,
      stack: error.stack,
    });

    fs.writeFile(
      filePath,
      JSON.stringify(logs, null, 2),
      { encoding: 'utf8' },
      () => {}
    );
  });

  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string> = {};

    error.errors.forEach((err) => {
      const field = err.path.join('.');
      formattedErrors[field] = err.message;
    });

    res.status(400).json({
      err: 'VALIDATION_ERROR',
      errMessage: 'Invalid input data',
      errors: formattedErrors,
    });
    return;
  }

  res.status(500).json({
    err: 'INTERNAL_SERVER_ERROR',
    errMessage: 'Exception has occurred',
  });
};
