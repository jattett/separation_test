import React from 'react';

interface Message {
  speaker: number;
  text: string;
}

interface ChatProps {
  messages: Message[];
}

// 🔥 최대 7명의 화자를 A~E로 매핑
const SPEAKER_MAP = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// 🔥 화자별 배경색 정의
const SPEAKER_COLORS: { [key: string]: string } = {
  A: '#d1e7ff', // 연한 파랑
  B: '#f1f0f0', // 연한 회색
  C: '#ffd1dc', // 연한 핑크
  D: '#d4edda', // 연한 녹색
  E: '#f8d7da', // 연한 빨강
};

const ChatBubble: React.FC<{ speaker: string; text: string }> = ({ speaker, text }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: speaker === 'A' ? 'flex-start' : 'flex-end',
        marginBottom: '10px',
      }}
    >
      <div
        style={{
          background: SPEAKER_COLORS[speaker] || '#ffffff', // 기본 배경색
          padding: '10px',
          borderRadius: '10px',
          maxWidth: '60%',
          border: '1px solid #ccc',
        }}
      >
        <strong>{speaker}</strong>: {text}
      </div>
    </div>
  );
};

const Chat: React.FC<ChatProps> = ({ messages }) => {
  // 🔥 화자 매핑을 저장하는 객체
  const speakerMapping: { [key: number]: string } = {};

  let assignedCount = 0; // 현재까지 매핑된 화자 수

  messages.forEach((msg) => {
    if (!(msg.speaker in speakerMapping)) {
      // 🔥 최대 5명까지만 매핑 (5명을 초과하면 마지막 문자(E)로 유지)
      if (assignedCount < SPEAKER_MAP.length) {
        speakerMapping[msg.speaker] = SPEAKER_MAP[assignedCount];
        assignedCount++;
      } else {
        speakerMapping[msg.speaker] = 'E'; // 초과하는 화자는 E로 유지
      }
    }
  });

  return (
    <div style={{ padding: '10px', maxWidth: '500px', margin: '0 auto' }}>
      {messages.map((msg, index) => (
        <ChatBubble
          key={index}
          speaker={speakerMapping[msg.speaker] || 'E'} // 매핑된 A~E 표시
          text={msg.text}
        />
      ))}
    </div>
  );
};

export default Chat;
