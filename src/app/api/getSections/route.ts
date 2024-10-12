import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export async function GET(request: NextRequest) {
  const semester = request.nextUrl.searchParams.get("semester");
  const semesterYear = request.nextUrl.searchParams.get("year");
  const sections = request.nextUrl.searchParams.get("sections");
  if (!semester || !semesterYear || !sections) {
    return new NextResponse("Invalid request", { status: 400 });
  }
  const crns = sections.split(",");
  const getSectionData = `https://api.michigantechcourses.com/sections?semester=${semester}&year=${semesterYear}`;
  const getSections = unstable_cache(
    async () => (await fetch(getSectionData)).json(),
    ["Sections", `Semester = ${semester} Year = ${semesterYear}`],
    { revalidate: 900 }
  );
  const data = await getSections();
  const filteredSections = data.filter((section: { crn: string }) =>
    crns.includes(section.crn)
  );
  return Response.json({ sections: filteredSections });
}
