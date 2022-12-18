# Kudos Identify Contributors Action

This likely runs on build, extracts the contributors for kudos creation.

Much of this work is done via `@kudos-protocol/dosku-cli` and the corresponding `@kudos-protocol/dosku-cli-basic@next` which handles the extraction.

## Inputs

## `path`

**Required** The path to look in. Default `.`.

## Outputs

## `contributors`

All contributors found.

## Example usage Github Action


```
on: 
  push:
    branches: [main]

concurrency:
  group: kudos-identify-contributors-${{ github.ref }}
  cancel-in-progress: true

jobs:
  kudos_identify_job:
    runs-on: ubuntu-latest
    name: Identify Contributors Basic
    env:
      searchDir: .
    steps:
    - uses: actions/checkout@v3
    # use a cached node, more options at https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md
    - name: Get current cohort
      id: cohort
      run: echo "cohort=$(date +'%Y%W')" >> $GITHUB_ENV
    - name: Setup Build Cache
      id: build-cache
      uses: actions/cache@v3
      env:
        cache-name: build-cache
      with:
        path: ~/.npm
        key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('**/package.json') }}
    - name: Setup Kudos Storage Cache
      id: kudos-dir-cache
      uses: actions/cache@v3
      env:
        cache-name: kudos-dir-cache
      with:
        # npm cache files are stored in `~/.npm` on Linux/macOS
        path: kudos-dir
        key: cache-${{ env.cache-name }}-${{ env.cohort  }}

    # CUSTOMIZE_BUILD START
    #   - To identify the libraries we need to install
    - uses: pnpm/action-setup@v2
      with:
        version: 6.32.9
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'

    - name: "Install Application Library"
      run: pnpm i

    # CUSTOMIZE_BUILD END

    - name: "Install Kudos Basic Tools"
      run: |
        mkdir -p kudos-dir
        npx @kudos-protocol/dosku-cli@next init
        npx @kudos-protocol/dosku-cli-basic@next enable --all --yes
        npx @kudos-protocol/dosku-cli@next init --dbDir=./kudos-dir
    - name: "Identify Contributors"
      run: |
        npx @kudos-protocol/dosku-cli@next config set kudos.context '{\"code\":{\"type\":\"deploy\",\"repositoryUrl\":\"${{github.repositoryUrl}}\",\"commit\":\"${{github.sha}}\"}}'
        npx @kudos-protocol/dosku-cli@next identify ${{ env.searchDir }} --nodeDevDependencies=true --outFile="kudos-dir/${{ env.cohort }}-${{github.sha}}.ndjson"
    - name: "Ink Kudos"
      run: |
        npx @kudos-protocol/dosku-cli@next ink --inFile="kudos-dir/${{ env.cohort }}-${{github.sha}}.ndjson" --src="github-action"
    - name: "List All Current Kudos"
      run: |
        npx @kudos-protocol/dosku-cli@next list --cohort=${{ env.cohort }}
  ```