import Loader from "@/components/shared/Loader";
import {
    useGetRecentPosts,
    useGetUsers,
} from "@/lib/react-queries/queriesAndMutations";
import { Models } from "appwrite";
import PostCard from "./../../components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";

const Home = () => {
    const { data: posts, isPending: isPostLoading } = useGetRecentPosts();
    const { data: creators, isPending: isUserLoading } = useGetUsers();

    return (
        <div className="flex flex-1">
            <div className="home-container">
                <div className="home-posts">
                    <h2 className="h3-bold md:h2-bold text-left w-full">
                        Home feed
                    </h2>
                    {isPostLoading && !posts ? (
                        <Loader />
                    ) : (
                        <ul className="flex flex-col flex-1 gap-9 w-full">
                            {posts?.documents.map((post: Models.Document) => (
                                <PostCard post={post} key={post.$id} />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="home-creators">
                <h3 className="h3-bold text-light-1">Top creators</h3>
                {isUserLoading && !creators ? (
                    <Loader />
                ) : (
                    <ul className="grid 2xl:grid-cols-2 gap-6">
                        {creators?.documents.map((creator: Models.Document) => (
                            <li key={creator?.$id}>
                                <UserCard user={creator} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Home;
