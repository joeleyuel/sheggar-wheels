import Workspace from "@/components/Workspace";
export default async function CarDetail({ params }) {
  const { id } = await params;
  return <Workspace page="car-detail" itemId={id} />;
}
