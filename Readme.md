# gha-node-deps-divergent

This action can be used to determine if the listed dependencies have changed
between a base branch and a pull request.

We do not version this action. You should utilize the most recent Git
SHA as the version string.

## Inputs

+ `current-sha` (required): the SHA for the changed branch, e.g. `github.sha`.
+ `base-sha` (required): the SHA for the original branch, e.g. `github.base_ref`.
+ `package-name`: When set, verify only if the specified package has changed.
+ `package-type`: One of "base", "dev", "peer", or "optional" to indicate the location in the `package.json` of the dependency to verify. Default "base".

## Examples

### Checking everything

This example will check all dependency blocks in the `package.json` and return
the string "true" if any divergence is discovered, otherwise the string "false".

```yaml
name: Continuous Integration

on:
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - uses: jsumners-nr/gha-node-deps-divergent
        id: deps
        with:
          base-sha: ${{ github.base_ref }}
          current-sha: ${{ github.sha }}
      - env:
          DIVERGENT: ${{ steps.deps.outputs.divergent }}
        run: |
          echo "divergent: ${DIVERGENT}"

```

### Checking a single package

This example will check a specific dependency in the `package.json` and return
the string "true" if any divergence is discovered, otherwise the string "false".

```yaml
name: Continuous Integration

on:
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - uses: jsumners-nr/gha-node-deps-divergent
        id: deps
        with:
          base-sha: ${{ github.base_ref }}
          current-sha: ${{ github.sha }}
          package-name: 'foo'
      - env:
          DIVERGENT: ${{ steps.deps.outputs.divergent }}
        run: |
          echo "divergent: ${DIVERGENT}"

```