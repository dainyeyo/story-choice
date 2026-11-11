import { CreateForm } from "../CreateForm";

export default async function NewStoryPage({ searchParams }: PageProps<"/create/new">) {
  const fresh = (await searchParams).reset === "1";
  return <CreateForm key={fresh ? "fresh" : "resume"} fresh={fresh} />;
}
