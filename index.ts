// Import modules with "* as" https://github.com/vercel/ncc/issues/621
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

try {
  type Env = 'prod' | 'qa' | 'stage' | 'dev';

  const nvmrcExists = fs.existsSync('.nvmrc');
  if (nvmrcExists) {
    const nvmrc = fs.readFileSync('.nvmrc', 'utf-8');
    core.info('Found .nvmrc file');
    core.info(`Setting output var: NODE_VERSION=${nvmrc}`);
    core.setOutput('NODE_VERSION', nvmrc);
  } else {
    core.info('No .nvmrc file found, skipping setting NODE_VERSION output.');
  }

  const context = github.context;
  const eventName = context.eventName;
  const ref = (context.payload.pull_request?.base.ref || context.ref).replace('refs/heads/', '');
  const refToEnv: Record<string, Env> = {
    master: 'prod',
    main: 'prod',
    qa: 'qa',
    stage: 'stage',
    staging: 'stage',
    dev: 'dev',
    develop: 'dev',
  };
  const env = eventName === 'release' ? 'prod' : refToEnv[ref];
  const envExists = env && fs.existsSync(`.env.${env}`);

  if (!envExists) throw new Error('No .env file found');

  core.info(`Copying .env.${env} --> .env`);
  fs.copyFileSync(`.env.${env}`, '.env');

  const dotEnvConfig = dotenv.config();
  const parsedEnvFile = dotEnvConfig.parsed;
  if (dotEnvConfig.error || !parsedEnvFile) throw dotEnvConfig.error;
  Object.entries(parsedEnvFile).forEach(([key, val]) => {
    core.info(`Setting output var: ${key}=******`);
    core.setOutput(key, val);
  });
} catch (error) {
  core.setFailed(error.message);
}
