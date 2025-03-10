import styled, { keyframes } from 'styled-components';

// 🔥 보라색 계열에서 색상이 변하는 애니메이션 정의
const purpleGradientAnimation = keyframes`
  0% { color: #7C3AED; }   // 보라색 (바이올렛)
  25% { color: #9333EA; }  // 연한 보라 (라벤더)
  50% { color: #A855F7; }  // 중간 보라 (라이트 퍼플)
  75% { color: #C084FC; }  // 핑크빛 보라
  100% { color: #7C3AED; } // 원래 색상으로 돌아옴
`;

// ✅ 보라색 애니메이션이 적용된 제목 스타일
export const TitleAnimation = styled.h1`
  font-size: 1.7rem;
  font-weight: bold;
  animation: ${purpleGradientAnimation} 3s infinite alternate; // 3초 동안 애니메이션 반복
  transition: color 0.3s ease-in-out;
  font-weight: 700;
`;

export const MainStyled = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  background: #fff;
  width: 90%;
  margin: 20px auto;
  min-height: 95vh;
  overflow: auto;
  border-radius: 20px;
`;
