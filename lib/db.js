import { MongoClient } from "mongodb";

const connectToDB = async () => {
  const client = await MongoClient.connect(
    "mongodb+srv://kiran:Wjf8UHvqDAsGqiuq@cluster0.llwxw4h.mongodb.net/auth-demo?retryWrites=true&w=majority"
  );
  return client;
};

export default connectToDB;
