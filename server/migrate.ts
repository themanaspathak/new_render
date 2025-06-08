import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await execAsync('npx drizzle-kit migrate');
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't throw error in production to allow app to start
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }
}