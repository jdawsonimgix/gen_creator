import { NextApiResponse, NextApiRequest } from 'next'

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  return res.status(200).json({ key: process.env.IMGIX_API_KEY })
}

/*
Update handler function to take in update info to handle the update.
I'll make the upload request here.
Handle response how it normally would.
*/
