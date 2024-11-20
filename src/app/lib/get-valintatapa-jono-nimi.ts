export const getValintatapaJonoNimi = ({
  valinnanVaiheNimi,
  jonoNimi,
}: {
  valinnanVaiheNimi?: string | null;
  jonoNimi: string;
}) => {
  if (valinnanVaiheNimi) {
    return jonoNimi.includes(valinnanVaiheNimi)
      ? jonoNimi
      : `${valinnanVaiheNimi}: ${jonoNimi}`;
  }
  return jonoNimi;
};
