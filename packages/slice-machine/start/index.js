#!/usr/bin/env node

require('module-alias/register')

global.fetch = require('node-fetch')
const fs = require('fs')

const path = require('path')
const open = require('open')
const boxen = require('boxen')
const spawn = require('child_process').spawn
// const migrate = require('../changelog/migrate')

const validate = require('../build/lib/env/client').validate

const infobox = require('./info')

const compareVersions = require('../build/lib/env/semver').default
const { defineFramework } = require('../build/lib/env/framework')
const { default: handleManifest, ManifestStates } = require('../build/lib/env/manifest')

const { createManifest, selectRepo, shouldOnboard } = require('./manifest')

const { argv } = require('yargs')

async function handleChangelog(params) {
  try {
    // await migrate(false, params)
  } catch(e) {
    console.error('An error occured while migrating file system. Continuing...')
    console.error(`Full error: ${e}`)
    return
  }
}

async function handleMigration(cwd) {
  const pathToPkg = path.join(cwd, 'package.json')
  const pathToSmFile = path.join(cwd, 'sm.json')
  if (!fs.existsSync(pathToSmFile)) {
    return
  }

  // const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
  // const cleanVersion = version.split('-')[0]

  return handleChangelog({ cwd, pathToPkg, pathToSmFile })
}

function start({ cwd, port }, callback) {
  const start = spawn('node', ['../build/server/src/index.js'], {
    cwd: __dirname,
    port,
    env: {
      ...process.env,
      CWD: cwd,
      PORT: port
    },
  })
  start.stdout.on('data', function (data) {
    const lns = data.toString().split('=')
    if (lns.length === 2) { // server was launched
      if (callback) {


      }
      callback(lns[1].replace(/\\n/, '').trim())
    } else {
      console.log(data.toString())
    }
  })

  start.stderr.on('data', function (data) {
    console.log('[slice-machine] ' + data.toString())
  })

  start.on('exit', function (code) {
    console.log('[slice-machine] Thanks for using SliceMachine')
  })
}

async function handleManifestState(manifestState, cwd) {
  if (manifestState.state !== ManifestStates.Valid) {
    console.log(
      boxen(
        `🔴 A configuration error was detected!
        
Error Message:
"${manifestState.message}"

See below for more info 👇`,
        { padding: 1, borderColor: 'red' }
      )
    )

    console.log('\n--- ℹ️  How to solve this: ---\n')
  }

  switch (manifestState.state) {
    case ManifestStates.Valid:
      return { exit: false }
    case ManifestStates.NotFound: {
      console.log(`Slicemachine requires an "sm.json" config file, at the root of your project.
      
Required properties:
* apiEndpoint, eg. "https://repo.prismic.io/api/v2"
* libraries, eg. ["~/slices"]\n\n`)

      return createManifest(cwd)

      // console.log('\n\nWelcome to Slicemachine!')
      
      // const yes = await shouldOnboard()

      // return !yes

      // const validateRes = await validate()
      // const repositories = Object.entries(JSON.parse(validateRes.body.repositories))
      // const response = await selectRepo(repositories)
      // return { exit: false, data: validateRes }
      // return createManifest(cwd)
    }
    case ManifestStates.MissingEndpoint:
      console.log('Add a property "apiEndpoint" to your config.\nExample: https://my-repo.prismic.io/api/v2\n\n')
      return { exit: true }
    case ManifestStates.InvalidEndpoint:
      console.log('Update your config file with a valid Prismic endpoint.\nExample: https://my-repo.prismic.io/api/v2\n\n')
      return { exit: true }
    case ManifestStates.InvalidJson: {
      console.log('Update your config file with a valid JSON structure.')
      return { exit: true }
    }
    default: {
      return { exit: false }
    }
  }
}

async function run() {
  const cwd = process.cwd()
  
  const port = argv.p || argv.port || '9999'
  if (!argv.skipMigration) {
    await handleMigration(cwd)
  }

  const nodeVersion = process.version.slice(1).split('.')[0]
  if (parseInt(nodeVersion) < 15) {
    console.error(`\n🔴 Slicemachine requires node version >= 15 to work properly.\nCurrent version: ${process.version}\n`)
    process.exit(-1)
  }

  const userConfig = handleManifest(cwd)
  // if (userConfig.state === ManifestStates.NotFound) {
  //   console.log('Welcome to Slicemachine! 🍕')
  //   const yes = await shouldOnboard()
  //   if (!yes) {
  //     console.log('Please create a config file manually!')
  //     process.exit(-1)
  //   } else {
  //     return start({ cwd, port }, (url) => {
  //       open(`${url}/onboarding`)
  //     })
  //   }
  // }
  const { exit, data } = await handleManifestState(userConfig, cwd)
  if (exit) {
    process.exit(-1)
  }

  const npmCompareData = await compareVersions({ cwd }, false)

  const framework = defineFramework(userConfig.content, cwd)

  const validateRes = await validate()

  start({ cwd, port }, (url) => {
    infobox(
      npmCompareData,
      url,
      framework,
      validateRes?.body?.email
    )
  })
}

main()
async function main() {
  try {
    run()
  } catch (err) {
    console.error(`[slice-machine] An unexpected error occured. Exiting...`);
    console.log('Full error: ', err)
  }
}