# Guide for contributing to mini-graph-card

Welcome to `mini-graph-card` and thank you for contributing!

In this document, you will find information on
* [contributing](#contributing) to and
* [maintaining](#maintaining) the project.



# Contributing

Please base your contributions on the `dev` branch to ensure compatibility with the latest code being validated.

As the project maintainers are currently very limited in time, please discuss new features and enhancements via an issue before implementation to avoid your PR getting rejected to avoid extra maintenance burden.

Refer to the [maintaining](#maintaining) section for more information and some general considerations on the types of changes that will likely be accepted at this time.

# Maintaining

## Current situation
Unfortunately, the project currently lacks maintainers with enough time at their hands to actively develop this project further.
Also, `mini-graph-card` is already very feature-rich and has grown quite a complex codebase.

Thus, we try to avoid introducing new features, especially if they add complexity to the code, or are in other ways prone to introducing new bugs. 
We are, however, committed to making bug fixes available in a timely manner.
We will also invest in this project staying compatible with new releases of home assistant.

## Guide for merging PRs
*Bug fixes* are the priority.
We will still try to keep them as minimally invasive as possible.
They should either just fix the bug in very limited spots or, ideally, even reduce complexity.

PRs with minimally invasive bug fixes may be merged by a single maintainer.

*Refactoring* code should be well justified, as it is prone to introduce side effects.
Good reasons could be reducing complexity or restoring compatibility with new releases of home assistant.

PRs including refactoring code should be approved by two maintainers.

*New features* should be avoided.
They might be accepted, if the impact on the existing code is weak and they can be expected to not break in the foreseeable future, especially considering their interactions with existing features.
Examples could be, when a feature can be enabled by improving single lines of code in a natural way.
Or if they can be implemented with code that is very clearly separated from existing code.

Whenever there is a way to solve requested features with third-party tools, we will most likely want to reject them in this project.
This is especially the case for layout options, that can be achieved using generic packages such as `card-mod`.

PRs including new features should be approved by two maintainers.

## Documentation

Make sure all features and options are documented correctly in the `README.md`.
If new options are added, mark them as `NEXT_VERSION` in the `since` column.
The release script will replace this with the correct version.

## New releases
We follow semantic versioning conventions.

This means, we require semantic commit messages. For PRs, this is ensured using a GitHub action.

Releases are published using another GitHub action.
It must be triggered manually and it can be run on the `dev` branch for pre-releases or on the `master` branch for official releases.
We create frequent pre-releases (if there are changes) to ship improvements in a timely manner.
