// Example basket content: MTUANDROID:SEMESTER=SPRING-2024&CRNS=12345,67890&BASKET_NAME=Gabagool&NAME=

import { cache, useEffect, useState } from "react";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export default async function Page({
  params,
}: {
  params: { basketContent: string };
}) {
  let basketMap = new Map();
  let basket = decodeURIComponent(params?.basketContent);
  if (!basket.startsWith("MTUANDROID:")) {
    basket = atob(basket);
  }
  if (basket.startsWith("MTUANDROID:")) {
    basket = basket.substring(11);
    basket.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      basketMap.set(key, value);
    });
  } else {
    console.log("Invalid basket");
    return 404;
  }
  const semester = basketMap.get("SEMESTER").split("-")[0];
  const semesterYear = basketMap.get("SEMESTER").split("-")[1];

  const crns = basketMap.get("CRNS").split(",");

  const getSectionData = `https://api.michigantechcourses.com/sections?semester=${semester}&year=${semesterYear}`;

  const getSections = unstable_cache(async () =>
    (await fetch(getSectionData)).json()
  );
  let data = await await getSections();
  // console.log(data);

  return <p>{}</p>;
}
