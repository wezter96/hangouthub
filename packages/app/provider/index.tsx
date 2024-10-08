import { useColorScheme } from 'react-native'
import { CustomToast, TamaguiProvider, type TamaguiProviderProps, ToastProvider, config } from '@my/ui'
import { ToastViewport } from './ToastViewport'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Provider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
  const colorScheme = useColorScheme()
  const [queryClient] = useState(() => new QueryClient())

  return (
    <TamaguiProvider
      config={config}
      defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}
      {...rest}
    >
      <ToastProvider
        swipeDirection="horizontal"
        duration={6000}
        native={
          [
            /* uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go */
            // 'mobile',
          ]
        }
      >
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        <CustomToast />
        <ToastViewport />
      </ToastProvider>
    </TamaguiProvider>
  )
}
