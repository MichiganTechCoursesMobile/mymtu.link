import type { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest) {
  console.log(req);
  return Response.json({ message: "Hello from Next.js!" });
}
