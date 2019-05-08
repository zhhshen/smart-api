#!/usr/bin/env node

"use strict"

const pkg = require('../package.json')
const run = require("../lib")
const chalk = require('chalk')

const yargs = require('yargs')
.usage(chalk.blue("sapi <init|update|clean>"))
.version('version', chalk.blue(pkg.version))
.alias('version', 'V')
.command({
  command: 'init',
  alias: 'init',
  desc: chalk.blue('init a config file'),
  handler: argv => {
    run.init()
  }
})
.command({
  command: 'replace',
  alias: 'replace',
  desc: chalk.blue('replace api'),
  handler: argv => {
    run.replace()
  }
})
.command({
  command: 'unreplace',
  alias: 'unreplace',
  desc: chalk.blue('unreplace api'),
  handler: argv => {
    run.unreplace()
  }
})
.command({
  command: 'clean',
  alias: 'clean',
  desc: chalk.blue('clean api'),
  handler: argv => {
    run.clean()
  }
})
.demandCommand(1, 'must provide a valid command')
.help('help')
.alias('help', 'h')
.epilogue('for more information, to be continue!')
.argv
