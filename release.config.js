module.exports = {
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      "npmPublish": false,
    }],
    ["@semantic-release/github", {
      "assets": "dist/*.js"
    }],
    "@semantic-release/git"
  ],
  "preset": "angular",
  "branches": [
    "master",
    { "name": "dev", "prerelease": true },
  ]
}