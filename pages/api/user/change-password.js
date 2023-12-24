import { getServerSession } from "next-auth";

import connectToDB from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/auth";
import { authOptions } from "../auth/[...nextAuth]";

const handler = async (req, res) => {
  if (req.method !== "PATCH") {
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  console.log(session);

  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const userEmail = session.user.email;

  const client = await connectToDB();

  const user = await client
    .db()
    .collection("users")
    .findOne({ email: userEmail });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    client.close();
    return;
  }

  const arePasswordsEqual = await verifyPassword(oldPassword, user.password);

  if (!arePasswordsEqual) {
    res.status(422).json({ message: "old password is not correct" });
    client.close();
    return;
  }

  const newHashedPassword = await hashPassword(newPassword);

  const result = await client
    .db()
    .collection("users")
    .updateOne(
      { email: userEmail },
      {
        $set: {
          password: newHashedPassword,
        },
      }
    );
  client.close();
  return res.status(201).json({ message: "Password updated" });
};

export default handler;
