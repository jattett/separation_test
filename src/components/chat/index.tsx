import React from 'react';
import { ChatContainer, BubbleWrapper, ChatBubbleStyled, SpeakerName } from './Styled';

interface Message {
  speaker: number;
  text: string;
}

interface ChatProps {
  messages: Message[];
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>; // 🔥 모달 상태 변경 함수 추가
}

// 🔥 최대 7명의 화자를 A~G로 매핑
const SPEAKER_MAP = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const ChatBubble: React.FC<{ speaker: string; text: string }> = ({ speaker, text }) => {
  return (
    <BubbleWrapper isLeft={speaker === 'A'}>
      <ChatBubbleStyled speaker={speaker}>
        <SpeakerName>{speaker}</SpeakerName>
        {text}
      </ChatBubbleStyled>
    </BubbleWrapper>
  );
};

const Chat: React.FC<ChatProps> = ({ messages, setOpenModal }) => {
  const speakerMapping: { [key: number]: string } = {};
  let assignedCount = 0;

  messages.forEach((msg) => {
    if (!(msg.speaker in speakerMapping)) {
      if (assignedCount < SPEAKER_MAP.length) {
        speakerMapping[msg.speaker] = SPEAKER_MAP[assignedCount];
        assignedCount++;
      } else {
        speakerMapping[msg.speaker] = 'E';
      }
    }
  });

  return (
    <>
      <ChatContainer>
        {messages.map((msg, index) => (
          <ChatBubble key={index} speaker={speakerMapping[msg.speaker] || 'E'} text={msg.text} />
        ))}
      </ChatContainer>
      <button onClick={() => setOpenModal(true)}>나의 대화 분석 & 피드백 받기</button>
    </>
  );
};

export default Chat;
