import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getWeavrClient, associateUserToken, setUserToken } from '../client'
import { mockWeavrClient } from './setup'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getWeavrClient', () => {
  it('returns the window.OpcUxSecureClient', () => {
    const client = getWeavrClient()
    expect(client).toBe(mockWeavrClient)
  })
})

describe('associateUserToken', () => {
  it('calls associate with auth token and resolves on success', async () => {
    await associateUserToken('Bearer test-token')

    expect(mockWeavrClient.associate).toHaveBeenCalledWith(
      'Bearer test-token',
      expect.any(Function),
      expect.any(Function)
    )
  })

  it('rejects on error', async () => {
    mockWeavrClient.associate.mockImplementationOnce((token, onSuccess, onError) => {
      onError(new Error('Auth failed'))
    })

    await expect(associateUserToken('Bearer bad-token')).rejects.toThrow('Auth failed')
  })
})

describe('setUserToken', () => {
  it('calls setUserToken with auth token and resolves on success', async () => {
    await setUserToken('Bearer test-token')

    expect(mockWeavrClient.setUserToken).toHaveBeenCalledWith(
      'Bearer test-token',
      expect.any(Function),
      expect.any(Function)
    )
  })
})
