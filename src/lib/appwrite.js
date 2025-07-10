import { Client, Account, Databases, Storage, Avatars, ID } from "appwrite";
import { toast } from "react-toastify";

const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
  userCollectionId: process.env.NEXT_PUBLIC_USER_COLECTION_ID,
};

const { endpoint, projectId, userCollectionId, databaseId } = config;

const client = new Client();

client.setEndpoint(endpoint).setProject(projectId);

const account = new Account(client);
const avatar = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) {
      toast.error("Failed to create account");
    }
    const avatarUrl = avatar.getInitials(username);
    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        userId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );
    const response = {
      account: newUser.userId,
      email: newUser.email,
      username: newUser.username,
      avatar: newUser.avatar,
    };
    toast.success(`Welcome ${username}`);
    return response;
  } catch (error) {
    console.error("Error creating user:", error.message);
    toast.error("error creating user");
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.log("Error in Sign In", error.message);
    toast.error("Error in sign In");
  }
};
