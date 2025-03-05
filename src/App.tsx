import React, { useState } from 'react';
import AudioProcessor from './components/audioprocessor';
import Chat from './components/chat';
import Summary from './components/summary'; // 🔥 요약 컴포넌트 추가

interface Message {
  speaker: number; // 🔥 speaker는 number 타입으로 유지
  text: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleTranscript = (transcript: { speaker: number; text: string }[]) => {
    const SPEAKER_MAP = ['A', 'B', 'C', 'D', 'E'];
    const speakerMapping: { [key: number]: string } = {};
    let assignedCount = 0;

    const formattedMessages: Message[] = transcript.map((msg) => {
      if (!(msg.speaker in speakerMapping)) {
        if (assignedCount < SPEAKER_MAP.length) {
          speakerMapping[msg.speaker] = SPEAKER_MAP[assignedCount]; // A~E 매핑
          assignedCount++;
        } else {
          speakerMapping[msg.speaker] = 'E'; // 6번째 화자는 E로 고정
        }
      }

      return {
        speaker: msg.speaker, // 🔥 speaker를 number 그대로 유지
        text: msg.text,
      };
    });

    setMessages(formattedMessages);
  };

  return (
    <div>
      <h1>음성 파일 화자 분리</h1>
      <AudioProcessor onTranscript={handleTranscript} />
      <Chat messages={messages} />
      <Summary messages={messages} /> {/* 🔥 요약 컴포넌트 추가 */}
    </div>
  );
};

export default App;
