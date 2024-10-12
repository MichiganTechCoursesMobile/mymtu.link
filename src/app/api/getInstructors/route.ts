import { unstable_cache } from "next/cache";

export async function GET() {
  const instructorURL = `https://api.michigantechcourses.com/instructors`;
  const getInstructorData = unstable_cache(
    async () => (await fetch(instructorURL)).json(),
    ["Instructors"],
    { revalidate: 3600 }
  );
  const data = await getInstructorData();

  return Response.json({ instructors: data });
}
