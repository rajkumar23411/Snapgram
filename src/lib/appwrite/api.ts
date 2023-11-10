import { INewPost, INewUser, IUpdatePost } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        });

        return newUser;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    name: string;
    email: string;
    username?: string;
    imageUrl: URL | string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            user
        );
        return newUser;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function signInAccount(user: { email: string; password: string }) {
    try {
        const session = await account.createEmailSession(
            user.email,
            user.password
        );

        return session;
    } catch (error) {
        console.log(error);
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );
        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        console.log(error);
    }
}

export async function createPost(post: INewPost) {
    try {
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw Error;

        const fileUrl = await getFilePreview(uploadedFile.$id);

        if (!fileUrl) {
            deleteFile(uploadedFile.$id);
            throw Error;
        }

        //   convert tags into an array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        return newPost;
    } catch (error) {
        console.log(error);
    }
}

export async function uploadFile(file: File) {
    try {
        const uploadFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );
        return uploadFile;
    } catch (error) {
        console.log(error);
    }
}

export async function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100
        );
        return fileUrl;
    } catch (error) {
        console.log(error);
    }
}

export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

export async function getRecentPosts() {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(20)]
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            postId,
            {
                likes: likesArray,
            }
        );

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

export async function savePost(postId: string, userId: string) {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId,
            }
        );
    } catch (error) {
        console.log(error);
    }
}

export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId
        );

        if (!statusCode) throw Error;

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

export async function getPostById(postId: string) {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            postId
        );

        if (!post) {
            throw Error;
        }

        return post;
    } catch (error) {
        console.log(error);
    }
}

export async function updatePost(post: IUpdatePost) {
    try {
        const hasFileToUpdate = post.file.length > 0;
        let image = {
            imageId: post.imageId,
            imageUrl: post.imageUrl,
        };

        if (hasFileToUpdate) {
            const uploadedFile = await uploadFile(post.file[0]);

            if (!uploadedFile) throw Error;

            const fileUrl = await getFilePreview(uploadedFile.$id);

            if (!fileUrl) {
                deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
        }

        //   convert tags into an array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags,
            }
        );

        if (!updatedPost) {
            await deleteFile(post.imageId);
            throw Error;
        }

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

export async function deletePost(postId: string, imageId: string) {
    try {
        if (!imageId || !postId) throw Error;
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            postId
        );

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries = [Query.orderAsc("$updatedAt"), Query.limit(20)];

    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            queries
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

export async function searchPosts(searchTeerm: string) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            [Query.search("caption", searchTeerm)]
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

export async function getUsers() {
    try {
        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            [Query.orderAsc("$createdAt")]
        );

        if (!users) throw Error;

        return users;
    } catch (error) {
        console.log(error);
    }
}

export async function getUserById(userId: string) {
    try {
        const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            userId
        );
        if (!user) throw Error;

        return user;
    } catch (error) {
        console.log(error);
    }
}
