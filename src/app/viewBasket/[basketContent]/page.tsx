"use client";
import useSWR from "swr";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

// Example basket content: MTUANDROID:SEMESTER=SPRING-2024&CRNS=12345,67890&BASKET_NAME=Gabagool&NAME=
export default function Page({
  params,
}: {
  params: { basketContent: string };
}) {
  let basketMap = new Map();
  let request = decodeURIComponent(params?.basketContent);
  // If the request does not start with MTUANDROID:, assume its base64 encoded, and decode it.
  if (!request.startsWith("MTUANDROID:")) {
    request = atob(request);
  }
  if (request.startsWith("MTUANDROID:")) {
    request = request.substring(11);
    request.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      basketMap.set(key, value);
    });
  } else {
    return notFound();
  }

  // From this point on, we have already verified that the request is valid.

  const fetcher = (url: string | Request | URL) =>
    fetch(url).then((r) => r.json());

  const [sectionMap, setSectionMap] = useState<Map<string, any>>(new Map());
  const [courseMap, setCourseMap] = useState<Map<string, any>>(new Map());
  const [courseIds, setCourseIds] = useState<string[]>([]);

  const semester = basketMap.get("SEMESTER").split("-")[0];
  const semesterYear = basketMap.get("SEMESTER").split("-")[1];
  const crns = basketMap.get("CRNS");

  const { data, error, isLoading } = useSWR(
    `/api/getSections?semester=${semester}&year=${semesterYear}&sections=${crns}`,
    fetcher
  );

  const {
    data: courseData,
    error: courseError,
    isLoading: courseIsLoading,
  } = useSWR(
    `/api/getCourses?semester=${semester}&year=${semesterYear}&courses=${courseIds.join(
      ","
    )}`,
    fetcher
  );

  useEffect(() => {
    if (!data) return;
    data.sections.forEach((section: any) => {
      setCourseIds((courseIds) => [...courseIds, section.courseId]);
      setSectionMap(sectionMap.set(section.crn, section));
    });
  }, [data]);

  useEffect(() => {
    if (!courseData) return;
    courseData.courses.forEach((course: any) => {
      setCourseMap(courseMap.set(course.id, course));
    });
  }, [courseData]);

  if (error) {
    return <div>Something went wrong</div>;
  }

  if (!isLoading && !courseIsLoading && !error && !courseError) {
    return (
      <div>
        {crns.split(",").map((crn: string) => (
          <div key={crn}>{JSON.stringify(sectionMap.get(crn))}</div>
        ))}
      </div>
    );
  } else {
    return <div>Loading...</div>;
  }
}
