# MOCO SEPA

This tool allows the generation of SEPA XML files out of MOCO invoices.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Duplexmedia/moco-sepa)

## How it works

This tools generates a SEPA XML for all invoices in your MOCO account that are marked as *sent*, that have a custom field "Zahlbar per" set to "Lastschrift" and that have an active project and customer associated. The associated customer needs to have the following custom fields:

- IBAN
- BIC
- Kontoinhaber
- Mandatsreferenz
- Eingangsdatum des Mandates

After creating the XML, the invoice status is not updated. You have to set them to *paid* manually when the SEPA collection finished successfully. However, every payment has a unique id associated to the invoice, so your customers won't be charged multiple times on accident.

## Netlify setup

This tool uses Netlify Functions to communicate with MOCO and Netlify Identity to manage logins. You'll have to enable both after you've deployed the project. It is recommended to set the Identity mode to *Invite only*.

## Development

To setup this tool locally, you need to copy the given `.env.example` file in the project root 
as `.env` and fill the variables with your values.

To install required components, run

```shell
yarn
```

You can serve the project locally using the following command:

```shell
yarn serve
```

To build this project, use:

```shell
yarn build
```
