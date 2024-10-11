"use client";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { s, section, select } from "framer-motion/client";
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

  const [sectionMap, setSectionMap] = useState<Map<string, any> | null>(null);
  const [courseMap, setCourseMap] = useState<Map<string, any> | null>(null);
  const [buildingMap, setBuildingMap] = useState<Map<string, any> | null>(null);
  const [instructorMap, setInstructorMap] = useState<Map<string, any> | null>(
    null
  );
  const [courseIds, setCourseIds] = useState<string[]>([]);

  const semester = basketMap.get("SEMESTER").split("-")[0];
  const semesterYear = basketMap.get("SEMESTER").split("-")[1];
  const crns = basketMap.get("CRNS");

  const { data, error, isLoading } = useSWR(
    `/api/getSections?semester=${semester}&year=${semesterYear}&sections=${crns}`,
    fetcher
  );

  const {
    data: buildingData,
    error: buildingError,
    isLoading: buildingIsLoading,
  } = useSWR("https://api.michigantechcourses.com/buildings", fetcher);

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

  const {
    data: instructorData,
    error: instructorError,
    isLoading: instructorIsLoading,
  } = useSWR("/api/getInstructors", fetcher);

  useEffect(() => {
    if (!data) return;
    let coolMap = new Map();
    data.sections.forEach((section: any) => {
      setCourseIds((courseIds) => [...courseIds, section.courseId]);
      setSectionMap(coolMap.set(section.crn, section));
    });
  }, [data]);

  useEffect(() => {
    if (!courseData) return;
    let coolMap = new Map();
    courseData.courses.forEach((course: any) => {
      setCourseMap(coolMap.set(course.id, course));
    });
  }, [courseData]);

  useEffect(() => {
    if (!buildingData) return;
    let coolMap = new Map();
    buildingData.forEach((building: any) => {
      setBuildingMap(coolMap.set(building.name, building));
    });
  }, [buildingData]);

  useEffect(() => {
    if (!instructorData) return;
    let coolMap = new Map();
    instructorData.instructors.forEach((instructor: any) => {
      setInstructorMap(coolMap.set(instructor.id.toString(), instructor));
    });
  }, [instructorData]);

  let getCourse = (crn: string) => {
    if (sectionMap?.get(crn) == null) return null;
    return courseMap?.get(sectionMap?.get(crn).courseId);
  };

  var sharerName = "Someone"; //Default sharer name

  if (basketMap.get("NAME") != "") {
    sharerName = basketMap.get("NAME");
  }

  const [clipboardToast, setClipboardToast] = useState(false);
  useEffect(() => {
    if (clipboardToast) {
      setTimeout(() => {
        setClipboardToast(false);
      }, 3000);
    }
  }, [clipboardToast]);

  if (error || buildingError || courseError || instructorError) {
    <div className="h-screen mx-auto grid place-items-center text-center px-8">
      <div>
        <svg
          viewBox="0 0 1024 1024"
          fill="currentColor"
          height="1em"
          width="1em"
          className="w-20 h-20 mx-auto fill-error"
        >
          <path d="M880 305H624V192c0-17.7-14.3-32-32-32H184v-40c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v784c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V640h248v113c0 17.7 14.3 32 32 32h416c17.7 0 32-14.3 32-32V337c0-17.7-14.3-32-32-32z" />
        </svg>
        <h1 className="mt-10 !text-3xl !leading-snug md:!text-4xl">Uh oh!</h1>
        <p className="mt-2 text-error !text-2xl !leading-snug md:!text-2xl">
          Something went wrong!
        </p>
      </div>
    </div>;
  }

  if (
    !isLoading &&
    !courseIsLoading &&
    !error &&
    !courseError &&
    !buildingIsLoading &&
    !buildingError &&
    !instructorError &&
    buildingMap &&
    courseMap &&
    sectionMap &&
    instructorMap
  ) {
    return (
      <>
        <div className="flex flex-col gap-4 pb-8 justify-center items-center">
          <div className="px-7 w-full md:w-2/3">
            <h2 className="text-4xl font-extrabold dark:text-white py-8">
              <span className="text-primary">{sharerName}</span> shared a basket
              with you!
            </h2>
            <div className="card bg-base-200 text-neutral-content">
              <div className="card-body flex flex-col flex-wrap align-middle">
                <div className="flex flex-row flex-wrap">
                  <h2 className="card-title pb-2 font-extrabold flex-1">
                    {basketMap.get("BASKET_NAME")}
                  </h2>
                  <h3>
                    {semester} {semesterYear}
                  </h3>
                </div>
                {[...new Set<string>(crns.split(","))].map((crn: string) => {
                  const course = getCourse(crn);
                  const section = sectionMap.get(crn);
                  if (!course || !section) return null;
                  const instructor = instructorMap?.get(
                    section.instructors[0]?.id.toString()
                  );
                  var time: string = "";
                  if (section.time.rrules.length > 0) {
                    section.time.rrules[0].config.byDayOfWeek.forEach(
                      (day: string) => {
                        if (day == "TH") day = "R";
                        time += day.substring(0, 1);
                      }
                    );
                    const formatTime = (hour: number, minute: number) => {
                      const period = hour >= 12 ? "pm" : "am";
                      const formattedHour = hour > 12 ? hour - 12 : hour;
                      const formattedMinute = minute === 0 ? "00" : minute;
                      return `${formattedHour}:${formattedMinute}${period}`;
                    };

                    const startTime = section.time.rrules[0].config.start;
                    const endTime = section.time.rrules[0].config.end;

                    time += " | ";
                    time += formatTime(startTime.hour, startTime.minute);
                    time += " - ";
                    time += formatTime(endTime.hour, endTime.minute);
                  }

                  const instructorSize = section.instructors.length;
                  return (
                    <div
                      className="card bg-base-300 text-neutral-content w-full"
                      key={crn}
                    >
                      <div className="card-body">
                        <div className="card-title flex flex-row flex-wrap">
                          <h2 className="flex-1">
                            {`${course.subject}${course.crse} - ${course.title}`}{" "}
                          </h2>
                          <h4 className="italic">({section.section})</h4>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="flex flex-row space-x-1.5 items-center">
                            {instructor ? (
                              <div
                                className={`avatar ${
                                  instructor.thumbnailURL ? "" : "placeholder"
                                }`}
                              >
                                <div
                                  className={`w-10 rounded-full bg-base-200`}
                                >
                                  {instructor?.thumbnailURL ? (
                                    <img src={instructor.thumbnailURL} />
                                  ) : (
                                    <span className="text-sm">
                                      {instructor.fullName.split(" ")[0][0]}
                                      {instructor.fullName.split(" ")[2]
                                        ? instructor.fullName.split(" ")[2][0]
                                        : instructor.fullName.split(" ")[1][0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}

                            <div>
                              {instructor ? instructor.fullName : "¯\\_(ツ)_/¯"}{" "}
                              {instructorSize > 1 ? (
                                <div className="badge badge-primary">
                                  +{instructorSize - 1}
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>

                          <div className="flex flex-row flex-wrap gap-2">
                            <div
                              className={`p-4 badge ${
                                section.availableSeats <= 0
                                  ? "badge-error"
                                  : "badge-primary"
                              }`}
                            >
                              {section.availableSeats}/{section.totalSeats}
                            </div>
                            <div className="p-4 badge">
                              {buildingMap.get(section.buildingName)
                                ?.shortName ?? "¯\\_(ツ)_/¯"}{" "}
                              {section.room ?? ""}
                            </div>
                            <div className="p-4 badge">CRN: {crn}</div>
                            <div className="p-4 badge badge-primary flex flex-row gap-2">
                              <svg
                                viewBox="0 0 1024 1024"
                                fill="currentColor"
                                height="1.5em"
                                width="1.5em"
                              >
                                <defs>
                                  <style />
                                </defs>
                                <path d="M945 412H689c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h256c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM811 548H689c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h122c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM477.3 322.5H434c-6.2 0-11.2 5-11.2 11.2v248c0 3.6 1.7 6.9 4.6 9l148.9 108.6c5 3.6 12 2.6 15.6-2.4l25.7-35.1v-.1c3.6-5 2.5-12-2.5-15.6l-126.7-91.6V333.7c.1-6.2-5-11.2-11.1-11.2z" />
                                <path d="M804.8 673.9H747c-5.6 0-10.9 2.9-13.9 7.7-12.7 20.1-27.5 38.7-44.5 55.7-29.3 29.3-63.4 52.3-101.3 68.3-39.3 16.6-81 25-124 25-43.1 0-84.8-8.4-124-25-37.9-16-72-39-101.3-68.3s-52.3-63.4-68.3-101.3c-16.6-39.2-25-80.9-25-124 0-43.1 8.4-84.7 25-124 16-37.9 39-72 68.3-101.3 29.3-29.3 63.4-52.3 101.3-68.3 39.2-16.6 81-25 124-25 43.1 0 84.8 8.4 124 25 37.9 16 72 39 101.3 68.3 17 17 31.8 35.6 44.5 55.7 3 4.8 8.3 7.7 13.9 7.7h57.8c6.9 0 11.3-7.2 8.2-13.3-65.2-129.7-197.4-214-345-215.7-216.1-2.7-395.6 174.2-396 390.1C71.6 727.5 246.9 903 463.2 903c149.5 0 283.9-84.6 349.8-215.8 3.1-6.1-1.4-13.3-8.2-13.3z" />
                              </svg>
                              {time ? time : "¯\\_(ツ)_/¯"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="px-7 w-full md:w-2/3 flex flex-row place-content-end">
            <div
              className="btn btn-primary"
              onClick={() => {
                navigator.clipboard.writeText(location.href);
                setClipboardToast(true);
              }}
            >
              Share
              <svg
                viewBox="0 0 576 512"
                fill="currentColor"
                height="1em"
                width="1em"
              >
                <path d="M384 24c0-9.6 5.7-18.2 14.5-22s19-2 26 4.6l144 136c4.8 4.5 7.5 10.8 7.5 17.4s-2.7 12.9-7.5 17.4l-144 136c-7 6.6-17.2 8.4-26 4.6S384 305.5 384 296v-72h-46.5c-45 0-81.5 36.5-81.5 81.5 0 22.3 10.3 34.3 19.2 40.5 6.8 4.7 12.8 12 12.8 20.3 0 9.8-8 17.8-17.8 17.8h-2.5c-2.4 0-4.8-.4-7.1-1.4C242.8 374.8 160 333.4 160 240c0-79.5 64.5-144 144-144h80V24zM0 144c0-44.2 35.8-80 80-80h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H80c-8.8 0-16 7.2-16 16v288c0 8.8 7.2 16 16 16h288c8.8 0 16-7.2 16-16v-16c0-17.7 14.3-32 32-32s32 14.3 32 32v16c0 44.2-35.8 80-80 80H80c-44.2 0-80-35.8-80-80V144z" />
              </svg>
            </div>
            <AnimatePresence>
              {clipboardToast && (
                <motion.div
                  exit={{ opacity: 0 }}
                  className="toast toast-top toast-end"
                >
                  <div className="alert bg-accent text-accent-content">
                    <span>Link Copied to clipboard</span>
                    <svg
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      height="1em"
                      width="1em"
                    >
                      <path d="M6.5 0A1.5 1.5 0 005 1.5v1A1.5 1.5 0 006.5 4h3A1.5 1.5 0 0011 2.5v-1A1.5 1.5 0 009.5 0h-3zm3 1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h3z" />
                      <path d="M4 1.5H3a2 2 0 00-2 2V14a2 2 0 002 2h10a2 2 0 002-2V3.5a2 2 0 00-2-2h-1v1A2.5 2.5 0 019.5 5h-3A2.5 2.5 0 014 2.5v-1zm6.854 7.354l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 01.708-.708L7.5 10.793l2.646-2.647a.5.5 0 01.708.708z" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className="flex flex-row min-h-screen justify-center items-center">
        <span className="loading loading-spinner loading-lg "></span>
      </div>
    );
  }
}
