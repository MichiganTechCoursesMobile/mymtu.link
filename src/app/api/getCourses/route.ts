import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export async function GET(request: NextRequest) {
  let semester = request.nextUrl.searchParams.get("semester");
  let semesterYear = request.nextUrl.searchParams.get("year");
  let courses = request.nextUrl.searchParams.get("courses");
  if (!semester || !semesterYear || !courses) {
    return new NextResponse("Invalid request", { status: 400 });
  }
  let courseIds = courses.split(",");
  const getCourseData = `https://api.michigantechcourses.com/courses?semester=${semester}&year=${semesterYear}`;
  const getCourses = unstable_cache(
    async () => (await fetch(getCourseData)).json(),
    ["Courses", `Semester = ${semester} Year = ${semesterYear}`],
    { revalidate: 900 }
  );
  let data = await getCourses();
  let filteredCourses = data.filter((course: { id: string }) =>
    courseIds.includes(course.id)
  );
  return Response.json({ courses: filteredCourses });
}
