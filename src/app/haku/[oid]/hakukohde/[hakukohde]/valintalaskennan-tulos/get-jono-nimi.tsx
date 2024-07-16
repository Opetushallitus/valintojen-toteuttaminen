'use client';
export const getJonoNimi = ({
  valinnanVaiheNimi,
  jonoNimi,
}: {
  valinnanVaiheNimi: string;
  jonoNimi: string;
}) => {
  return jonoNimi.includes(valinnanVaiheNimi)
    ? jonoNimi
    : `${valinnanVaiheNimi}: ${jonoNimi}`;
};
