# MOCO SEPA

This tool allows the generation of SEPA XML files out of MOCO invoices.

## Development

To setup this tool locally, you need to create an `.env` file in the project root
which contains the following fields:

```shell
MOCO_WORKSPACE=<workspace name>
MOCO_TOKEN=<token>

CREDITOR_NAME=<creditor name>
CREDITOR_IBAN=<creditor iban>
CREDITOR_BIC=<creditor bic>
CREDITOR_ID=<creditor id>
```

To install required components, run

```shell
yarn
```

You can start the project backend using the following command:

```shell
yarn serve:backend
```