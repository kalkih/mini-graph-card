/* eslint-disable no-template-curly-in-string */
module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    ['@semantic-release/npm', {
      npmPublish: false,
    }],
    ['@semantic-release/exec', {
      prepareCmd: './scripts/update_readme.sh "${nextRelease.version}" "$GITHUB_REF"',
    }],
    ['@semantic-release/git', {
      assets: [
        'CHANGELOG.md',
        'README.md',
        'package.json',
        'package-lock.json',
        'npm-shrinkwrap.json',
      ],
    }],
    ['@semantic-release/github', {
      assets: 'dist/*.js',
    }],
  ],
  preset: 'angular',
  branches: [
    { name: 'master' },
    { name: 'dev', prerelease: true },
  ],
};
