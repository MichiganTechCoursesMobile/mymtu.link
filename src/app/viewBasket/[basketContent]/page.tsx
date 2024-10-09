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
  const [courseIds, setCourseIds] = useState<string[]>([]);

  const [selectedSection, setSelectedSection] = useState<string | null>(null);

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

  if (error) {
    return <div>Something went wrong</div>;
  }

  let getCourse = (crn: string) => {
    return courseMap?.get(sectionMap?.get(crn).courseId);
  };

  var sharerName = "Someone"; //Default sharer name

  if (basketMap.get("NAME") != "") {
    sharerName = basketMap.get("NAME");
  }

  const [isSafe, setSafe] = useState(true);
  useEffect(() => {
    if (selectedSection == null) {
      setTimeout(() => {
        setSafe(true);
      }, 500);
    }
  }, [selectedSection]);

  if (
    !isLoading &&
    !courseIsLoading &&
    !error &&
    !courseError &&
    courseMap &&
    sectionMap
  ) {
    return (
      <>
        <motion.dialog id="courseDetail" className="modal">
          <AnimatePresence>
            {selectedSection && (
              <motion.div
                layoutId={selectedSection}
                className="card bg-base-300 text-neutral-content w-1/2 absolute"
              >
                <motion.div className="card-body">
                  <motion.h2 className="card-title">
                    {`${getCourse(selectedSection).subject}${
                      getCourse(selectedSection).crse
                    } - ${getCourse(selectedSection).title}`}
                  </motion.h2>
                  <motion.p>{sectionMap.get(selectedSection).section}</motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.form method="dialog" className="modal-backdrop">
            <motion.button onClick={() => setSelectedSection(null)}>
              close
            </motion.button>
          </motion.form>
        </motion.dialog>

        <h2 className="text-4xl font-extrabold dark:text-white p-8">
          <span className="text-primary">{sharerName}</span> shared a basket
          with you!
        </h2>
        <div className="px-7">
          <div className="card bg-base-200 text-neutral-content w-1/2">
            <div className="card-body">
              <h2 className="card-title pb-2 font-extrabold">
                {basketMap.get("BASKET_NAME")}
              </h2>
              {[...new Set<string>(crns.split(","))].map((crn: string) => (
                <motion.label htmlFor="section_modal">
                  <motion.div
                    layoutId={crn}
                    onClick={() => {
                      const courseDetailDialog = document.getElementById(
                        "courseDetail"
                      ) as HTMLDialogElement;
                      if (
                        courseDetailDialog &&
                        selectedSection == null &&
                        isSafe
                      ) {
                        setSafe(false);
                        courseDetailDialog.showModal();
                        setSelectedSection(crn);
                      }
                    }}
                    className="card bg-base-300 text-neutral-content w-full"
                  >
                    <motion.div className="card-body">
                      <motion.h2 className="card-title">
                        {`${getCourse(crn).subject}${getCourse(crn).crse} - ${
                          getCourse(crn).title
                        }`}
                      </motion.h2>
                      <motion.p>{sectionMap.get(crn).section}</motion.p>
                    </motion.div>
                  </motion.div>
                </motion.label>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <div>Loading...</div>;
  }
}
