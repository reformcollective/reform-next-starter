# Reform Gatsby Starter

Setup!

1. Clone using the template in GitHub
1. Update all existing packages with `pnpm dlx npm-check-updates --deep -u` (feel free to update the starter repository as well)
1. Enable package update checks in `.github/workflows/call-check-updates.yml`
1. Add any typography to `app/styles/fonts/typography.ts`, and configure a default text color/style in `app/layout.tsx`
1. Add any text styles to `app/styles/text.ts`
1. Configure branch rules on github (you should export and import the starter's rule set)
1. Init Library submodule: `git submodule update --init --recursive`
1. Configure the library config according to this project's needs. For example, remove the default transitions.
1. In repository settings, enable "Always suggest updating pull request branches", "Allow auto-merge", and "Automatically delete head branches"
1. Update the README.md to remove these instructions and add project-specific image and name below
1. Set up a Netlify build and link to sanity if available/part of project
1. Add .env variables to Netlify, Notion, and Github
1. Delete _summary_ commit checks from netlify notifications. do not delete the _state_ commit checks.

<!-- Repository Cover -->
<img src="https://picsum.photos/1600/900" alt="Project Name Website Repository" width="100%" style="border-radius: 50px">
<br><br>

# Project Name

Built with Gatsby. Install with `pnpm install` and run with `pnpm start`

## Setup

1. Initialize the project submodule: `git submodule update --init --recursive`

1. Install nvm and Node.js
   The preferred way to install node is with nvm. After installing nvm, run `nvm install` in this project to download and use the correct version of node for this project.

1. Install PNPM
   The preferred way to install pnpm is with corepack. After you've installed node, you install pnpm with `corepack enable`. You should now be able to run `pnpm install` and `pnpm start`.
   Note that if you installed node from homebrew, you may need to install corepack separately.
