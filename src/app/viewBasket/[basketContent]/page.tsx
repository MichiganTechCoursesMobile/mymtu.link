export default async function Page({
  params,
}: {
  params: { basketContent: string };
}) {
  return <p>{params?.basketContent}</p>;
}
