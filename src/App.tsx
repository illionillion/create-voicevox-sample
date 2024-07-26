import { Button, Center, Container, Heading, Textarea, useBoolean, useNotice, VStack } from "@yamada-ui/react"
import { useState } from "react"

function App() {

  const [inputText, setInputText] = useState<string>("")
  const [audioData, setAudioData] = useState<Blob>()
  const [isLoading, {on, off} ] = useBoolean()

  const notice = useNotice()

  const handleCreate = async () => {
    if(!inputText) return
    setAudioData(undefined)
    on()
    const apiResponse = await fetch(`https://api.tts.quest/v3/voicevox/synthesis?text=${inputText}&speaker=3&key=${import.meta.env.VITE_API_KEY}`)
    const apiData = await apiResponse.json()
    
    const { mp3DownloadUrl, audioStatusUrl } = apiData

    while (true) {
      await new Promise<void>((resolve) => setTimeout(() => {
        resolve()
      }, 1000))

      const statusResponse = await fetch(audioStatusUrl)
      const statusJson = await statusResponse.json()
      
      if(statusJson.isAudioReady) break
      if(statusJson.isAudioError) {
        notice({
          title: "失敗",
          colorScheme: "danger",
          variant: "solid"
        })
        off()
        return
      }
    }
    
    const audioResponse = await fetch(mp3DownloadUrl)
    const audioBlob = await audioResponse.blob()
    setAudioData(audioBlob)
    off()
  }

  return (
    <Container mx="auto" maxW="2xl" h="100dvh">
      <Center flexDir="column" w="full" h="full" gap="lg">
        <Heading>VOICEVOX 音声生成 サンプル</Heading>
        <VStack>
          <Textarea value={inputText} onChange={e => setInputText(e.currentTarget.value)} placeholder="テキストを入力" />
          <Button onClick={handleCreate} isDisabled={isLoading}>生成</Button>
          {
            audioData ? <audio src={audioData ? window.URL.createObjectURL(audioData) : undefined} controls></audio> : undefined
          }
        </VStack>
      </Center>
    </Container>
  )
}

export default App
