# @airnode/deployer

> Deployment tools for Airnode

*The recommended way to deploy Airnode is by using the deployment Docker image.
This package simply implements the scripts used by that image and is not meant to be used directly by the end user.*

## Temporary instructions

At the root
```sh
yarn run build-all
```
In this package
```sh
yarn run webpack
yarn run webpack:copy-config
yarn run command:deploy:nonstop
yarn run command:remove-with-receipt
```

The information below is outdated.

## Setup

- Download the [Terraform v0.13.* binary](https://www.terraform.io/downloads.html) and move it to your `PATH`
- Get an *Access Key ID* and *Secret Access Key* from AWS and insert into `.env` in the package directory (refer to `.env.example`)
- Install Serverless Framework globally

```sh
npm install -g serverless
```

## Basics

Airnode is deployed in two steps:

1. Deploy the mnemonic at AWS SSM at the `region` that the serverless functions will be deployed at using Terraform

1. Deploy the serverless functions at the target `region` using Serverless Framework

The mnemonic deployment needs to be performed only when deploying for the first time on a region.
For the following redeployments, mnemonic deployment must not be repeated.

## Regular user flow

1. Use the `deploy-first-time` for your first deployment.
Note down the displayed mnemonic.
Keep the outputted receipt file, or send it to API3 if you are an API3 partner.

1. Fund the master wallet address with the displayed amount to set your Airnode parameters.
This will be done for you if you are an API3 partner.

1. Use the `redeploy` command when you need to update your node.
Note that your `airnodeIdShort` from your receipt file must be inserted into the `nodeSettings.airnodeIdShort` field of your `config.json` file.
This will be done for you if you are an API3 partner.

## Commands

Note that for all commands, environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_KEY` must exist.
You can keep them in a `.env` file (refer to `.env.example`) and inject them when needed with
```sh
test -f .env && export $(egrep -v '^#' .env | xargs)
```

### `deploy-first-time`

> Generates a mnemonic, displays it for the user to note down, deploys it at AWS SSM.
Then, using `config.json` and `security.json`, deploys the serverless functions that implement Airnode.
Outputs a receipt file.

Your `config.json` file **must not** include a `nodeSettings.airnodeIdShort` field or this command will error.

`--configPath, -c` (required): Path to the `config.json` file

`--securityPath, -s` (required): Path to the `security.json` file

### `redeploy`

> Using `config.json` and `security.json`, deploys the serverless functions that implement Airnode.
Outputs a receipt file.

Your `config.json` file **must** include a `nodeSettings.airnodeIdShort` field or this command will error.

`--configPath, -c` (required): Path to the `config.json` file

`--securityPath, -s` (required): Path to the `security.json` file

### `deploy-mnemonic`

> Deploys a user-specified mnemonic

This command can be used to migrate your mnemonic across regions or cloud providers.
Its usage is not recommended otherwise.

`--mnemonic, -m` (required): Mnemonic to be deployed

`--region, -r` (required): Region that the mnemonic will be deployed at

### `remove-with-receipt`

> Removes the mnemonic and the serverless functions that implement Airnode

`--receiptFilename, --rf` (required): Full name of the `*.receipt.json` file

**WARNING** This command will also remove the mnemonic associated with this deployment.
If you have other deployments associated with this mnemonic (with different `region`s and `stage`s), you should not be using this command, but prefer `remove-airnode` instead.
Otherwise, you will not be able to `redeploy` your other associated deployments.

### `remove-mnemonic`

> Removes the mnemonic

The user does not need to use this command between redeployments.
It should only be used when the user wants to remove Airnode completely.

`--airnodeIdShort, -p` (required): `airnodeIdShort` from the receipt outputted at deployment

`--region, -r` (required): Region that the mnemonic to be removed is deployed at

### `remove-airnode`

> Removes the serverless functions that implement Airnode

The user does not need to use this command between redeployments.
It should only be used when the user wants to remove Airnode completely.

`--airnodeIdShort, -p` (required): `airnodeIdShort` from the receipt outputted at deployment

`--region, -r` (required): Region that the Airnode to be removed is deployed at

`--stage, -s` (required): `stage` label of the Airnode to be removed
