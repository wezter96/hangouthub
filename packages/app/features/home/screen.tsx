import {
  Anchor,
  Button,
  H1,
  Paragraph,
  Separator,
  Sheet,
  useToastController,
  SwitchThemeButton,
  SwitchRouterButton,
  XStack,
  YStack,
  H2,
} from '@my/ui'
import { ChevronDown, ChevronUp, X } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { Platform } from 'react-native'
import { useLink } from 'solito/navigation'
import { api } from 'hangouthub-elysia'
import { useMutation, useQuery } from '@tanstack/react-query'
export function HomeScreen({ pagesMode = false }: { pagesMode?: boolean }) {
  const linkTarget = pagesMode ? '/pages-example-user' : '/user'
  const linkProps = useLink({
    href: `${linkTarget}/nate`,
  })
  const { data } = useQuery({
    queryKey: ['message'],
    queryFn: () => api.message.index.get(),
  })
  const { data: data2 } = useQuery({
    queryKey: ['userById'],
    queryFn: () => api.users({ id: 'dcbd770f-b3ed-4fa6-9f8f-6d367e149014' }).get(),
  })

  const { data: data3 } = useQuery({
    queryKey: ['userByEmail'],
    queryFn: () => api.users.email({ email: 'test@test.se' }).get(),
  })
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.index.get(),
  })

  const mutation = useMutation({
    mutationFn: () =>
      api.users['sign-up'].post({
        firstName: 'firstTestName',
        lastName: 'lastTestName',
        email: 'test@test.se',
      }),
    onSuccess: () => refetchUsers(),
  })

  console.log('data: ', data)
  console.log('data2:', data2)
  console.log('users: ', users)

  return (
    <YStack f={1} jc="center" ai="center" gap="$8" p="$4" bg="$background">
      <XStack
        pos="absolute"
        w="100%"
        t="$6"
        gap="$6"
        jc="center"
        fw="wrap"
        $sm={{ pos: 'relative', t: 0 }}
      >
        {Platform.OS === 'web' && (
          <>
            <SwitchRouterButton pagesMode={pagesMode} />
            <SwitchThemeButton />
          </>
        )}
      </XStack>

      <YStack gap="$4">
        <H1 ta="center" col="$color12">
          Welcome to HangoutHub.
        </H1>
        <H2> API data: {data?.data} </H2>
        <H2> UserById name: {data2?.data.firstName} </H2>
        <H2> User names: {users?.data?.map((user) => user.firstName).join(', ')} </H2>
        <Button onPress={() => mutation.mutate()}>Sign up</Button>
        <Separator />
        <Separator />
      </YStack>

      <Button {...linkProps}>Link to user</Button>

      <SheetDemo />
    </YStack>
  )
}

function SheetDemo() {
  const toast = useToastController()

  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(0)

  return (
    <>
      <Button
        size="$6"
        icon={open ? ChevronDown : ChevronUp}
        circular
        onPress={() => setOpen((x) => !x)}
      />
      <Sheet
        modal
        animation="medium"
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Handle bg="$gray8" />
        <Sheet.Frame ai="center" jc="center" gap="$10" bg="$color2">
          <XStack gap="$2">
            <Paragraph ta="center">Made by</Paragraph>
            <Anchor col="$blue10" href="https://twitter.com/natebirdman" target="_blank">
              @natebirdman,
            </Anchor>
            <Anchor
              color="$purple10"
              href="https://github.com/tamagui/tamagui"
              target="_blank"
              rel="noreferrer"
            >
              give it a ⭐️
            </Anchor>
          </XStack>

          <Button
            size="$6"
            circular
            icon={ChevronDown}
            onPress={() => {
              setOpen(false)
              toast.show('Sheet closed!', {
                message: 'Just showing how toast works...',
              })
            }}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
