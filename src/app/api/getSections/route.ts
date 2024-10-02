import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export async function GET(request: NextRequest) {
  let semester = request.nextUrl.searchParams.get("semester");
  let semesterYear = request.nextUrl.searchParams.get("year");
  let sections = request.nextUrl.searchParams.get("sections");
  if (!semester || !semesterYear || !sections) {
    return new NextResponse("Invalid request", { status: 400 });
  }
  let crns = sections.split(",");
  const getSectionData = `https://api.michigantechcourses.com/sections?semester=${semester}&year=${semesterYear}`;
  const getSections = unstable_cache(
    async () => (await fetch(getSectionData)).json(),
    ["Sections", `Semester = ${semester} Year = ${semesterYear}`],
    { revalidate: 900 }
  );
  let data = await getSections();
  let filteredSections = data.filter((section: { crn: string }) =>
    crns.includes(section.crn)
  );
  return Response.json({ sections: filteredSections });
}
