# actions-set-env-vars

Dynamically sets the `.env` file based on the `env` input (if supplied), or
auto-detects based on branch name (target branch if a pull request).

Then sets each env var as a github "output" on the action.

Also sets `NODE_VERSION` from a `.nvmrc`, if found

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
        # OPTIONAL
        # with:
        #  env: dev

      - name: Setup node
        uses: actions/setup-node@v1
        with:
          node-version: ${{ steps.set-env-vars.outputs.NODE_VERSION }}

      - name: Read .env file
        run: cat .env

      - name: Echo some variable
        runs: echo ${{ steps.set-env-vars.outputs.SOME_VARIABLE }}
```
