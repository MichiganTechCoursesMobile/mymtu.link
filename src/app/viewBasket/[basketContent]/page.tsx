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

  // // Logic for clicking on a section
  // const [selectedSection, setSelectedSection] = useState<string | null>(null);
  // const [isSafe, setSafe] = useState(true);
  // useEffect(() => {
  //   if (selectedSection == null) {
  //     setTimeout(() => {
  //       setSafe(true);
  //     }, 500);
  //   }
  // }, [selectedSection]);

  const [clipboardToast, setClipboardToast] = useState(false);
  useEffect(() => {
    if (clipboardToast) {
      setTimeout(() => {
        setClipboardToast(false);
      }, 3000);
    }
  }, [clipboardToast]);

  if (error || buildingError || courseError || instructorError) {
    return <div>Something went wrong</div>;
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
        {/* For Another time */}
        {/* <motion.dialog id="courseDetail" className="modal">
          <AnimatePresence>
            {selectedSection && (
              <motion.div
                layoutId={selectedSection}
                className="card bg-base-300 text-neutral-content w-1/2 absolute"
              >
                <div className="card-body">
                  <h2 className="card-title">
                    {`${getCourse(selectedSection).subject}${
                      getCourse(selectedSection).crse
                    } - ${getCourse(selectedSection).title}`}
                  </h2>
                  <p>{sectionMap.get(selectedSection).section}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.form method="dialog" className="modal-backdrop">
            <motion.button onClick={() => setSelectedSection(null)}>
              close
            </motion.button>
          </motion.form>
        </motion.dialog> */}

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
                  if (!course) return null;
                  const instructor = instructorMap?.get(
                    sectionMap.get(crn).instructors[0]?.id.toString()
                  );
                  return (
                    <div
                      // onClick={() => {
                      //   const courseDetailDialog = document.getElementById(
                      //     "courseDetail"
                      //   ) as HTMLDialogElement;
                      //   if (
                      //     courseDetailDialog &&
                      //     selectedSection == null &&
                      //     isSafe
                      //   ) {
                      //     setSafe(false);
                      //     courseDetailDialog.showModal();
                      //     setSelectedSection(crn);
                      //   }
                      // }}
                      className="card bg-base-300 text-neutral-content w-full"
                      key={crn}
                    >
                      <div className="card-body">
                        <div className="card-title flex flex-row flex-wrap">
                          <h2 className="flex-1">
                            {`${course.subject}${course.crse} - ${course.title}`}{" "}
                          </h2>
                          <h4 className="italic">
                            ({sectionMap.get(crn).section})
                          </h4>
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
                              {instructor ? instructor.fullName : "¯\\_(ツ)_/¯"}
                            </div>
                          </div>

                          <div className="flex flex-row flex-wrap gap-2">
                            <div
                              className={`p-4 badge ${
                                sectionMap.get(crn).availableSeats <= 0
                                  ? "badge-error"
                                  : "badge-primary"
                              }`}
                            >
                              {sectionMap.get(crn).availableSeats}/
                              {sectionMap.get(crn).totalSeats}
                            </div>
                            <div className="p-4 badge">
                              {buildingMap.get(sectionMap.get(crn).buildingName)
                                ?.shortName ?? "¯\\_(ツ)_/¯"}{" "}
                              {sectionMap.get(crn).room ?? ""}
                            </div>
                            <div className="p-4 badge">CRN: {crn}</div>
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
    return <div>Loading...</div>;
  }
}
