# Adobe Hands-on Labs

## Repoless Setup

1. Fetch User Authorization Token or auth_token using: https://admin.hlx.page/auth/adobe
 
## Invoke API calls:

1. Check once if you have admin access to that org. (auth_token is required be passed as header)
2. List All Site Configs to verify no existing site with that name already exist. (auth_token is required be passed as header)
3. Copy master content to a new location in SharePoint and copy the new SharePoint location url.
4. Create new configuration for new site by updating the URL of existing site with new site and updating below mentioned fields in JSON body. (auth_token is required be passed as header)
   - Update the new SharePoint location url with "url" field.
   - Update the sidekick configurations to add or remove Sidekick options
5. Preview your site(s) > update the URL of existing site with new site (no auth token req)
6. Publish your site(s) > update the URL of existing site with new site (no auth token req)

**FINAL URL:** https://main--{YOUR_REPO_URL}--adobe-demopoc.aem.live

**Note:** In case you need to update the existing configuration, update the method type from PUT to POST and provide the updated JSON.

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
2. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
3. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
4. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
5. Open the `hands-on-labs` directory in your favorite IDE and start coding :)
