// Copyright 2020 Self Group Ltd. All Rights Reserved.

// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
import AuthenticationService from './authentication-service'
import FactsService from './facts-service'
import IdentityService from './identity-service'
import MessagingService from './messaging-service'
import Jwt from './jwt'
import Messaging from './messaging'
import Crypto from './crypto'
import { logging, LogEntry, Logger } from './logging'
import ChatService from './chat-service';
import DocsService from './docs-service';
import Requester from './requester';
import { IOManager } from './storage';
import VoiceService from './voice-service';

/**
 * SelfSDK allow you interact with self network.
 */
export default class SelfSDK {
  appID: string
  appKey: string
  storageKey: string
  storageFolder: string
  baseURL: string
  messagingURL: string
  autoReconnect: boolean
  jwt: any
  ms: any
  logger: Logger

  private requester: Requester
  private authenticationService: any
  private factsService: FactsService
  private identityService: IdentityService
  private messagingService: MessagingService
  private chatService: ChatService
  private docsService: DocsService
  private voiceService: VoiceService
  private encryptionClient: Crypto

  defaultBaseURL = 'https://api.joinself.com'
  defaultMessagingURL = 'wss://messaging.joinself.com/v2/messaging'

  /**
   * Use static build method to create your SDK
   * @param appID your SELF_APP_ID
   * @param appKey your SELF_APP_SECRET
   * @param storageKey your SELF_STORAGE_KEY
   * @param opts array of options
   */
  constructor(
    appID: string,
    appKey: string,
    storageKey: string,
    opts?: { baseURL?: string; messagingURL?: string; env?: string; autoReconnect?: boolean }
  ) {
    this.appID = appID
    this.appKey = keyCleanup(appKey)
    this.storageKey = storageKey

    this.baseURL = this.calculateBaseURL(opts)
    this.messagingURL = this.calculateMessagingURL(opts)
    // this.autoReconnect = opts?.autoReconnect ? opts?.autoReconnect : true;
  }

  /**
   * Creates and starts your SelfSDK instance
   * @param appID your SELF_APP_ID
   * @param appKey your SELF_APP_SECRET
   * @param storageKey your SELF_STORAGE_KEY
   * @param storageFolder the folder you want to use to store your self sessions.
   * @param opts optional parameters
   *  - baseURL : string with the baseURL you want to use
   *  - messagingURL : string the messaging url to be used
   *  - env : the environment you want to run your app against
   *  - autoReconnect : will automatically reconnect your app if disconnected
   *  - ntp : enable/disable ntp sync (just for testing)
   *  - deviceID : the device id to be used.
   *  - checkPaidActions : force to check if app has credits on each request.
   * @returns a ready to use SelfSDK
   */
  public static async build(
    appID: string,
    appKey: string,
    storageKey: string,
    storageFolder: string,
    opts?: {
      baseURL?: string
      messagingURL?: string
      env?: string
      autoReconnect?: boolean
      ntp?: boolean
      deviceID?: string
      encryptionClient?: Crypto
      logLevel?: string,
      checkPaidActions?: boolean,
      stateManager?: IOManager
    }
  ): Promise<SelfSDK> {
    let options = opts ? opts : {}
    let logLevel = 'info'
    if (options['logLevel'] != undefined) {
      logLevel = options['logLevel']
    }

    logging
      .configure({
        minLevels: { core: logLevel }
      })
      .registerConsoleLogger()

    appKey = keyCleanup(appKey)
    const sdk = new SelfSDK(appID, appKey, storageKey, opts)
    sdk.logger = logging.getLogger('core.self-sdk')
    sdk.jwt = await Jwt.build(appID, appKey, opts)

    storageFolder = `${storageFolder}/apps/${sdk.jwt.appID}/devices/${sdk.jwt.deviceID}`
    var shell = require('shelljs')
    shell.mkdir('-p', `${storageFolder}/keys/${sdk.jwt.appKeyID}`)

    sdk.identityService = new IdentityService(sdk.jwt, sdk.baseURL)
    // Check the current app still exists
    await sdk.deviceStillExists()
    if (options['encryptionClient'] == undefined) {
      sdk.encryptionClient = await Crypto.build(
        sdk.identityService,
        sdk.jwt.deviceID,
        `${storageFolder}/keys/${sdk.jwt.appKeyID}`,
        storageKey
      )
    } else {
      sdk.encryptionClient = options['encryptionClient']
    }

    if (sdk.messagingURL === '') {
      sdk.ms = new Messaging(sdk.messagingURL, sdk.jwt, sdk.identityService, sdk.encryptionClient, {
        storageDir: storageFolder
      })
    } else {
      sdk.ms = await Messaging.build(
        sdk.messagingURL,
        sdk.jwt,
        sdk.identityService,
        sdk.encryptionClient,
        { storageDir: storageFolder }
      )
    }

    sdk.messagingService = new MessagingService(
      sdk.jwt,
      sdk.ms,
      sdk.identityService,
      sdk.encryptionClient
    )

    let env = options['env'] ? options['env'] : '-'
    sdk.requester = new Requester(
      sdk.jwt,
      sdk.messagingService,
      sdk.identityService,
      sdk.encryptionClient,
      env
    )
    sdk.factsService = new FactsService(sdk.requester)
    sdk.authenticationService = new AuthenticationService(sdk.requester)
    sdk.chatService = new ChatService(
      sdk.messagingService,
      sdk.identityService,
      { env: env }
    )
    sdk.docsService = new DocsService(
      sdk.messagingService,
      sdk.identityService.url,
    )
    sdk.voiceService = new VoiceService(
      sdk.messagingService
    )

    return sdk
  }

  /**
   * Gracefully closes the sdk
   */
  close() {
    this.jwt.stop()
    this.messagingService.close()
  }

  /**
   * Access the authentication service
   * @returns AuthenticationService
   */
  authentication(): AuthenticationService {
    return this.authenticationService
  }

  /**
   * Access the facts service
   * @returns FactsService
   */
  facts(): FactsService {
    return this.factsService
  }

  /**
   * Access the identity service
   * @returns IdentityService
   */
  identity(): IdentityService {
    return this.identityService
  }

  /**
   * Access the messaging service
   * @returns MessagingService
   */
  messaging(): MessagingService {
    return this.messagingService
  }

  /**
   * Access the chat service
   * @returns ChatService
   */
  chat(): ChatService {
    return this.chatService
  }

  /**
   * Access the docs service
   * @returns ChatService
   */
  docs(): DocsService {
    return this.docsService
  }

  /**
   * Access the voice service
   * @returns ChatService
   */
  voice(): VoiceService {
      return this.voiceService
  }

  private calculateBaseURL(opts?: { baseURL?: string; env?: string }) {
    if (!opts) {
      return this.defaultBaseURL
    }

    if (opts.baseURL) {
      return opts.baseURL
    }
    if (opts.env) {
      return `https://api.${opts.env}.joinself.com`
    }

    return this.defaultBaseURL
  }

  private calculateMessagingURL(opts?: { messagingURL?: string; env?: string }) {
    if (!opts) {
      return this.defaultMessagingURL
    }

    if (opts.messagingURL !== undefined) {
      return opts.messagingURL
    }
    if (opts.env) {
      return `wss://messaging.${opts.env}.joinself.com/v2/messaging`
    }

    return this.defaultMessagingURL
  }

  private async deviceStillExists() {
    let devices = await this.identityService.devices(this.jwt.appID)
    for (var i=0; i<devices.length; i++) {
      if (devices[i] == this.jwt.deviceID) {
        return
      }
    }
    throw new Error('identity does not exist')
  }
}

/**
 * Cleans up a given key
 * @param key
 * @returns
 */
  const keyCleanup = (key: string): string => {
  if(!key.includes("_")) {
    return key
  }

  return key.split("_")[1]
}
