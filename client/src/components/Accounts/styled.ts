import styled from 'styled-components';

export const LocalComponents = {
  Container: styled.div`
    border-radius: 6px;

    border: 2px solid black;

    display: flex;
    flex-direction: column;
    gap: 8px;

    padding: 8px;

    width: fit-content;
  `,

  Account: styled.div`
    display: flex;
    flex-direction: column;
  `,

  AccountInformation: styled.span`
    font-size: 1.2rem;
  `,

  AccountInformationWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;

    padding-left: 8px;
  `,

  AccountButtonsWrapper: styled.div`
    display: flex;

    gap: 8px;
  `,
};
