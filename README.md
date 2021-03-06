# actions-set-env-vars

Dynamically sets the `.env` file based on the branch name (or target branch if a pull request),
then sets each env var as a github "output" on the action.

Also sets `NODE_VERSION` from a `.nvmrc`, if found

## Ouputs

```
.env file
# Set from the branch name (or target branch if a pull request)
```

```
APP_ENV
# Set to dev, qa, stage, or prod (based on branch name)
```

```
NODE_VERSION
# Set to the value found in the `.nvmrc` file
```

```
All values inside .env file
# Set as key value pairs on the "outputs" of this action
```

## Usage

```
jobs:
  your_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set env vars
        id: set-env-vars
        uses: aplaceformom/actions-set-env-vars@main

      - name: Setup node
        uses: actions/setup-node@v1
        with:
          node-version: ${{ steps.set-env-vars.outputs.NODE_VERSION }}

      - name: Read .env file
        run: cat .env

      - name: Echo some variable
        runs: echo ${{ steps.set-env-vars.outputs.SOME_VARIABLE }}
```
