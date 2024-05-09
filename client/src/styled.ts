import styled from 'styled-components';

export const LocalComponents = {
  Container: styled.div`
    width: 100vw;
    height: fit-content;

    padding: 32px;

    display: flex;
    gap: 16px;
  `,

  GasEstimate: styled.span`
    font-size: 16px;
    font-weight: 500;
  `,

  RightWrapper: styled.div`
    width: 100%;
  `,

  InputsWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
};
