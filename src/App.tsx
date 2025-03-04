import React, { useState } from 'react';
import AudioProcessor from './components/audioprocessor';
import Chat from './components/chat';

interface Message {
  speaker: number;
  text: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleTranscript = (transcript: Message[]) => {
    setMessages(transcript);
  };

  return (
    <div>
      <h1>음성 파일 화자 분리</h1>
      <AudioProcessor onTranscript={handleTranscript} />
      <Chat messages={messages} />
    </div>
  );
};

export default App;
