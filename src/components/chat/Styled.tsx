import styled from 'styled-components';

export const SPEAKER_COLORS: { [key: string]: string } = {
  A: '#1E3A8A', // 🔵 딥 블루
  B: '#065F46', // 🟢 딥 그린
  C: '#9D174D', // 🌸 다크 핑크
  D: '#7C3AED', // 💜 퍼플 바이올렛
  E: '#B91C1C', // 🔴 강렬한 레드
  F: '#92400E', // 🟠 다크 오렌지 브라운
  G: '#374151', // ⚫ 차콜 그레이
};

// ✅ 스타일 컴포넌트 정의
export const ChatContainer = styled.div`
  padding: 20px;
  margin: 0 auto;
  width: auto;
`;

export const BubbleWrapper = styled.div<{ isLeft: boolean }>`
  display: flex;
  justify-content: ${(props) => (props.isLeft ? 'flex-start' : 'flex-end')};
  margin-bottom: 10px;
`;

export const ChatBubbleStyled = styled.div<{ speaker: string }>`
  background: ${(props) => SPEAKER_COLORS[props.speaker] || '#ffffff'};
  padding: 10px;
  border-radius: 10px;
  max-width: 90%;
  min-width: 30%;
  border: 1px solid #ccc;
  color: #fff;
  font-size: 14px;
  strong {
    font-size: 21px;
    text-shadow: 3px 1px 3px black;
  }
`;

export const SpeakerName = styled.strong`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
`;
