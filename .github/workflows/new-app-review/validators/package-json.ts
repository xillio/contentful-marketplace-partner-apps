import { hasPackageJson, packageJsonPath } from '../../app-review-utils';
import type { PullRequestFile, ValidatorOptions, ValidatorResult } from '../../types';

export const validate = async (_options: ValidatorOptions, newAppDir: string, files: PullRequestFile[]): Promise<ValidatorResult> => {
  const requiredScripts = ['start', 'build', 'test', 'lint', 'install-ci'];
  let hasScripts = false;
  let isCorrectVersion = false;
  let hasDeployScript = false;

  if (await hasPackageJson(files, newAppDir)) {
    const packageJson = await import(packageJsonPath(newAppDir));

    hasScripts = requiredScripts.every((script) => packageJson.scripts && packageJson.scripts[script]);
    isCorrectVersion = packageJson.version.startsWith('0');
    hasDeployScript = packageJson.scripts && packageJson.scripts['deploy'];
  }

  const result = hasScripts && isCorrectVersion && !hasDeployScript;
  let message = 'package.json check passed';

  if (!result) {
    let failureMessage = '';
    if (!hasScripts) {
      failureMessage += `package.json is missing one or more of the following scripts: ${requiredScripts.join(', ')}. `;
    }
    if (!isCorrectVersion) {
      failureMessage += 'package.json version should be less than 1.0. ';
    }
    if (hasDeployScript) {
      failureMessage += 'package.json should not contain a deploy script.';
    }
    message = failureMessage;
  }

  return {
    result,
    message,
  };
};
