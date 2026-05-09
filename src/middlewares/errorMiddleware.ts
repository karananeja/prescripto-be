import { ErrorRequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import { ZodError } from 'zod';

interface LogEntry {
  time: string;
  message: string;
  stack?: string;
  path?: string;
  method?: string;
}

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
): void => {
  if (!error) {
    next();
    return;
  }

  const logEntry: LogEntry = {
    time: new Date().toISOString(),
    message: `${error.name}: ${error.message}`,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
  };

  // Save logs only in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      const filePath = path.join(process.cwd(), 'src/logs/errorLogs.json');

      let logs: LogEntry[] = [];

      // Create file if not exists
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]', 'utf-8');
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');

      try {
        logs = JSON.parse(fileContent) as LogEntry[];
      } catch {
        logs = [];
      }

      logs.push(logEntry);

      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (fsError) {
      console.error('Failed to write local error log:', fsError);
    }
  }

  console.error(logEntry);

  // Zod validation error
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

  // Generic server error
  res.status(500).json({
    err: 'INTERNAL_SERVER_ERROR',
    errMessage: 'Exception has occurred',
  });
};
