import { useState, useEffect } from 'react'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

interface UseApiOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  enabled?: boolean
  dependencies?: any[]
}

interface MutateOptions {
  body?: any
  headers?: Record<string, string>
  url?: string
}

export function useApi<T>(
  url: string, 
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    method = 'GET',
    body: initialBody,
    headers: initialHeaders = {},
    onSuccess,
    onError,
    enabled = true,
    dependencies = []
  } = options

  const fetchData = async (mutateOptions: MutateOptions = {}) => {
    try {
      setIsLoading(true)
      
      const requestConfig = {
        url: mutateOptions.url || url,
        method,
        headers: {
          ...initialHeaders,
          ...mutateOptions.headers
        },
        data: mutateOptions.body || initialBody
      }
      
      const response = await api.request(requestConfig)
      
      // Handle successful response
      const result = response.status !== 204 ? response.data : null
      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      // Handle error
      const axiosError = err as any
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'An error occurred'
      const error = new Error(errorMessage)
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (enabled && method === 'GET') {
      fetchData()
    }
  }, [url, enabled, method, ...dependencies])

  return {
    data,
    error,
    isLoading,
    mutate: fetchData
  }
}