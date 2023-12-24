import { hashPassword } from "../../../lib/auth";
import connectToDB from "./../../../lib/db";

const handler = async (req, res) => {
  const client = await connectToDB();

  const db = client.db();

  const { email, password } = req.body;

  const existingUser = await db.collection('users').findOne({
    email
  })

  if(existingUser) {
    res.status(422).json({ message: "User exist already"});
    client.close();
    return;
  }

  if (
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 7
  ) {
    res.status(422).json({ message: "Invalid input" });
    client.close();
    return;
  }

  const encryptedPassword = await hashPassword(password);

  const result = await db.collection("users").insertOne({
    email,
    password: encryptedPassword,
  });

  res.status(201).json({ message: "Created user!" });
  client.close();
};

export default handler;
