import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export async function GET(request: NextRequest) {
  const semester = request.nextUrl.searchParams.get("semester");
  const semesterYear = request.nextUrl.searchParams.get("year");
  const courses = request.nextUrl.searchParams.get("courses");
  if (!semester || !semesterYear || !courses) {
    return new NextResponse("Invalid request", { status: 400 });
  }
  const courseIds = courses.split(",");
  const getCourseData = `https://api.michigantechcourses.com/courses?semester=${semester}&year=${semesterYear}`;
  const getCourses = unstable_cache(
    async () => (await fetch(getCourseData)).json(),
    ["Courses", `Semester = ${semester} Year = ${semesterYear}`],
    { revalidate: 900 }
  );
  const data = await getCourses();
  const filteredCourses = data.filter((course: { id: string }) =>
    courseIds.includes(course.id)
  );
  return Response.json({ courses: filteredCourses });
}
