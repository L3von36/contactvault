"use client"

import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { useState, useEffect } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  const [persister, setPersister] = useState<any>(null)

  useEffect(() => {
    setPersister(
      createSyncStoragePersister({
        storage: window.localStorage,
      })
    )
  }, [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ 
        persister: persister || { 
          persistClient: () => {}, 
          restoreClient: () => {}, 
          removeClient: () => {} 
        } 
      }}
      onSuccess={() => {
        // Optional: handle success
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
