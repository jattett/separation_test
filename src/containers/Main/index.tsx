import React, { useState } from 'react';
import AudioProcessor from '../../components/audioprocessor';
import Chat from '../../components/chat';
import Summary from '../../components/summary';
import { TitleAnimation, MainStyled } from './Styled';

interface Message {
  speaker: number;
  text: string;
}

const Main: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [openModal, setOpenModal] = useState(false); // 🔥 모달 상태 추가

  const handleTranscript = (transcript: { speaker: number; text: string }[]) => {
    const SPEAKER_MAP = ['A', 'B', 'C', 'D', 'E'];
    const speakerMapping: { [key: number]: string } = {};
    let assignedCount = 0;

    const formattedMessages: Message[] = transcript.map((msg) => {
      if (!(msg.speaker in speakerMapping)) {
        if (assignedCount < SPEAKER_MAP.length) {
          speakerMapping[msg.speaker] = SPEAKER_MAP[assignedCount];
          assignedCount++;
        } else {
          speakerMapping[msg.speaker] = 'E';
        }
      }

      return {
        speaker: msg.speaker,
        text: msg.text,
      };
    });

    setMessages(formattedMessages);
  };

  return (
    <MainStyled>
      <TitleAnimation>대화체 피드백 프로젝트</TitleAnimation>
      <AudioProcessor onTranscript={handleTranscript} />
      {/* 🔥 `setOpenModal`을 Chat에 전달 */}
      <Chat messages={messages} openModal={openModal} setOpenModal={setOpenModal} />
      {openModal && <Summary messages={messages} setOpenModal={setOpenModal} />}
    </MainStyled>
  );
};

export default Main;
