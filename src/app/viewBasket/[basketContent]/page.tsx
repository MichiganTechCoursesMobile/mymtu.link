// Example basket content: MTUANDROID:SEMESTER=SPRING-2024&CRNS=12345,67890&BASKET_NAME=Gabagool&NAME=

import { useEffect, useState } from "react";
import { NextResponse } from "next/server";

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
      console.log(key, value);
    });
  } else {
    console.log("Invalid basket");
    return 404;
  }
  const semester = basketMap.get("SEMESTER").split("-")[0];
  const semesterYear = basketMap.get("SEMESTER").split("-")[1];

  const crns = basketMap.get("CRNS").split(",");

  const getSectionData = `https://api.michigantechcourses.com/sections?semester=${semester}&year=${semesterYear}`;

  const [data, setData] = useState(null);

  useEffect(() => {
    // Function to fetch data
    const fetchData = async () => {
      const response = await fetch(getSectionData); // Replace with your API endpoint
      const result = await response.json();
      setData(result);
    };

    // Call the function
    fetchData();
  }, []); // Empty array ensures this effect runs once on mount

  return <p>{data}</p>;
}
