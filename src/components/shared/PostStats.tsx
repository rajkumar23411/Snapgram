import {
    useDeleteSavedPost,
    useGetCurrentUser,
    useLikePost,
    useSavedPost,
} from "@/lib/react-queries/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import { useToast } from "@/components/ui/use-toast";
type PostStatsProps = {
    post: Models.Document;
    userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
    const likesList = post.likes.map((user: Models.Document) => user.$id);
    const [likes, setLikes] = useState(likesList);
    const [isSaved, setIsSaved] = useState(false);
    const { mutate: likePost } = useLikePost();
    const { mutate: savePost, isPending: isSavingPost } = useSavedPost();
    const { mutate: deleteSavedPost, isPending: isDeletingPost } =
        useDeleteSavedPost();
    const { data: currentUser } = useGetCurrentUser();
    const { toast } = useToast();
    const savedPostRecord = currentUser?.save.find(
        (record: Models.Document) => record.post.$id === post.$id
    );

    useEffect(() => {
        setIsSaved(!!savedPostRecord);
    }, [currentUser]);

    const handleLikePost = (e: React.MouseEvent) => {
        e.stopPropagation();

        let newLikes = [...likes];

        if (newLikes.includes(userId)) {
            newLikes = newLikes.filter((id) => id !== userId);
        } else {
            newLikes.push(userId);
        }

        setLikes(newLikes);
        likePost({ postId: post.$id, likedArray: newLikes });
    };
    const handleSavePost = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (savedPostRecord) {
            setIsSaved(false);
            deleteSavedPost(savedPostRecord.$id);
        } else {
            savePost({ postId: post.$id, userId });
            setIsSaved(true);
            toast({
                description: "Post saved",
            });
        }
    };
    return (
        <div className="flex justify-between items-center z-20">
            <div className="flex gap-2 mr-5">
                <img
                    src={
                        checkIsLiked(likes, userId)
                            ? "/assets/icons/liked.svg"
                            : "/assets/icons/like.svg"
                    }
                    alt="like"
                    width={20}
                    height={20}
                    onClick={handleLikePost}
                    className="cursor-pointer"
                />
                <p className="small-medium lg:base-medium">{likes.length}</p>
            </div>
            <div className="flex gap-2 mr-5">
                {isDeletingPost || isSavingPost ? (
                    <Loader />
                ) : (
                    <img
                        src={
                            isSaved
                                ? "/assets/icons/saved.svg"
                                : "/assets/icons/save.svg"
                        }
                        alt="save"
                        width={20}
                        height={20}
                        onClick={handleSavePost}
                        className="cursor-pointer"
                    />
                )}
            </div>
        </div>
    );
};

export default PostStats;
