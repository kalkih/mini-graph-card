# Guide for contributing to mini-graph-card

Welcome to `mini-graph-card` and thank you for contributing!

In this document, you will find information on
* [contributing](#contributing) to and
* [maintaining](#maintaining) the project.



# Contributing

## Issues

If you encounter any issues or have feature requests, please submit them via [GitHub Issues](https://github.com/kalkih/mini-graph-card/issues).
Before submitting a new issue, please check to see if a similar one has already been reported.
If you find an existing issue that describes the problem you're experiencing, please add a comment to the existing issue rather than creating a new one.

## HA Community Forum

Before posting on the HA community forum, please make sure to search the forum to see if your question or issue has already been addressed.
You can use [this link](https://community.home-assistant.io/search?q=mini-graph-card) to search for topics related to mini-graph-card.

If you don't find a relevant topic on the forum, feel free to create a new topic to discuss your question or issue.
Please provide as much detail as possible, including your configuration and any error messages you may be seeing, to help others understand and troubleshoot your issue.


## Important notes for pull requests

We are glad that you are planning to contribute to the project! :tada:

As the project maintainers are currently very limited in time, please discuss new features and enhancements via an issue first, to avoid getting your PR rejected after your hard work.

Refer to the [maintaining](#maintaining) section for more information and some general considerations on the types of changes that will likely be accepted at this time.

## Technical guidelines

The *base branch* for your contributions should be the `dev` branch to ensure compatibility with the latest code being validated.

*Documentation* should go to the `README.md`file.
Please make sure all features and options are documented correctly there.
If new options are added, mark them as `NEXT_VERSION` in the `since` column.
The release script will replace this with the correct version.

We follow *semantic versioning* conventions and enforce it using GitHub release actions.
This means, we require semantic commit messages, following the [angular conventional commit](https://www.conventionalcommits.org) style.
For PRs, this is ensured using a GitHub action.
The commit messages will also show up in the Release Notes, so take some time to get them right.



# Maintaining

## Current situation

Unfortunately, the project currently lacks maintainers with enough time at their hands to actively develop this project further.
Also, `mini-graph-card` is already very feature-rich and has grown quite a complex codebase.

Thus, we try to avoid introducing new features, especially if they add complexity to the code, or are in other ways prone to introducing new bugs. 
We are, however, committed to making bug fixes available in a timely manner.
We will also invest in this project staying compatible with new releases of home assistant.


## Guide for merging PRs

*Bug fixes* are the priority.
They should either just fix the bug in very limited spots or, ideally, even reduce complexity.
When a bug fix is submitted, we should take some time to think about how things could be done in a better way.

PRs with only bug fixes may be merged by a single maintainer.
If major refactoring is involved, the following paragraphs might apply.

*Refactoring* code should be well justified, as it is prone to introduce side effects.
Good reasons could be reducing complexity or restoring compatibility with new releases of home assistant.
Refactoring code should be well tested before committing.

PRs including refactoring code should be approved at least by a maintainer and one other person.
Good candidates might be the authors of related issues or a second maintainer.
If you are not sure, don't hesitate to involve other maintainers.

Adding *new features* should in general be avoided, in order to maintain the stability of the codebase.
However, we may consider accepting new features if they have a minimal impact on the existing code and are not expected to cause any issues in the foreseeable future, particularly in terms of their interaction with existing features.
For instance, a new feature may be considered, if it can be implemented by improving a few lines of code or by using separate code that is clearly distinguished from the existing code.

Nonetheless, if there are third-party tools available that can solve a requested feature, we should generally choose to reject the feature request.
This is especially true for layout options, which can often be achieved using generic packages like `card-mod`.

PRs including new features should be approved in the same way as refactoring code.


## New releases

Releases are published using a GitHub action.
It must be triggered manually and it can be run on the `dev` branch for pre-releases or on the `master` branch for official releases.
We create frequent pre-releases (if there are changes) to ship improvements in a timely manner.
