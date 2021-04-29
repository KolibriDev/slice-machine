import path from 'path'
import { maybeJsonFile } from '../../../utils'
import upload from './upload'

interface ApiSettings {
  STAGE: string
  PROD: string
}

type DevConfig = [string, string, string]

const SharedSlicesApi = {
  STAGE: 'https://customtypes.wroom.io/slices/',
  PROD: 'https://customtypes.prismic.io/slices/'
} as ApiSettings

const AclProviderApi = {
  STAGE: 'https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/',
  PROD: 'https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/'
} as ApiSettings

function createApiUrl(base: string, { STAGE, PROD }: ApiSettings): string {
  if (base && base.includes('wroom.io')) {
    return STAGE
  }
  return PROD
}

function createFetcher(apiUrl: string, repo: string, auth: string): (body?: object | string, action?: string, method?: string) => Promise<Response> {
  return function runFetch(body?: object | string, action = '', method = 'get'): Promise<Response> {
    const headers = {
      repository: repo,
      Authorization: `Bearer ${auth}`
    }
    return fetch(new URL(action, apiUrl).toString(), {
      headers,
      method,
      ...(method === 'post' ? {
        body: 'object' === typeof body ? JSON.stringify(body) : body,
      } : null),
    })
  }
}

const initFetcher = (base: string, ApiUrls: ApiSettings, devConfigArgs: DevConfig, repo: string, auth: string) => {
  const apiUrl = createApiUrl(base, ApiUrls)
  const args = devConfigArgs
      ? devConfigArgs
      : [apiUrl, repo, auth]
  return createFetcher(args[0], args[1], args[2])
}

export default class DefaultClient {
  apiFetcher: (body?: object | string, action?: string, method?: string) => Promise<Response>
  aclFetcher: (body?: object | string, action?: string, method?: string) => Promise<Response>

  constructor(readonly cwd: string, readonly base: string, readonly repo: string, readonly auth: string) {
    const devConfig = cwd ? maybeJsonFile(path.join(cwd, 'sm.dev.json')) : {}

    this.apiFetcher = initFetcher(base, SharedSlicesApi, devConfig.sharedSlicesApi, repo, auth)
    this.aclFetcher = initFetcher(base, AclProviderApi, devConfig.aclProviderApi, repo, auth)
  }

  isFake() {
    return false;
  }

  async get() {
    return this.apiFetcher()
  }

  async insert(body: object | string) {
    return this.apiFetcher(body, 'insert', 'post')
  }

  async update(body: object | string) {
    return this.apiFetcher(body, 'update', 'post')
  }

  images = {
    createAcl: async () => {
      return this.aclFetcher(undefined, 'create', 'get')
    },
    deleteFolder: async (body: object | string) => {
      return this.aclFetcher(body, 'delete-folder', 'post')
    },
    post: async (params: { url: string, fields: { [key: string]: string}, key: string, filename: string, pathToFile: string }) => {
      return upload(params)
    } 
  }
}