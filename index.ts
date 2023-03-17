// Import modules with "* as" https://github.com/vercel/ncc/issues/621
import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

type Env = 'prod' | 'qa' | 'stage' | 'dev';

const getEnv = (context: Context): Env => {
  if (context.eventName === 'release') return 'prod';
  const ref = (context.payload.pull_request?.base.ref || context.ref).replace('refs/heads/', '');
  const refToEnv: Record<string, Env> = {
    dev: 'dev',
    develop: 'dev',
    qa: 'qa',
    stage: 'stage',
    staging: 'stage',
    master: 'stage',
    main: 'stage',
  };
  const env = refToEnv[ref];
  core.debug(`gh context: ${JSON.stringify(context, null, 2)}`);
  core.debug(`refToEnv: ${JSON.stringify(refToEnv, null, 2)}`);
  core.debug(`ref: ${ref}`);
  core.debug(`env: ${env}`);
  return env;
};

try {
  const nvmrcExists = fs.existsSync('.nvmrc');
  if (nvmrcExists) {
    const nvmrc = fs.readFileSync('.nvmrc', 'utf-8');
    core.info('Found .nvmrc file');
    core.info(`Setting output var: NODE_VERSION=${nvmrc}`);
    core.setOutput('NODE_VERSION', nvmrc);
  } else {
    core.info('No .nvmrc file found, skipping setting NODE_VERSION output.');
  }

  const env = core.getInput('env') || getEnv(github.context);
  const envExists = env && fs.existsSync(`.env.${env}`);
  if (!envExists) throw new Error('No .env file found');

  core.info(`Copying .env.${env} --> .env`);
  fs.copyFileSync(`.env.${env}`, '.env');

  const dotEnvConfig = dotenv.config();
  const parsedEnvFile = dotEnvConfig.parsed;
  if (dotEnvConfig.error || !parsedEnvFile) throw dotEnvConfig.error;
  Object.entries(parsedEnvFile).forEach(([key, val]) => {
    core.info(`Setting output var: ${key}=${val}`);
    core.setOutput(key, val);
  });
} catch (error) {
  let errorMessage = 'Failed to do something exceptional';
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  core.setFailed(errorMessage);
}
