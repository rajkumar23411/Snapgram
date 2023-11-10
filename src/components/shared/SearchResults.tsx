import { Models } from "appwrite";
import Loader from "./Loader";
import GridPostList from "./GridPostList";

type SeachResultProps = {
    isFetchingSearch: boolean;
    searchedPosts: Models.Document[];
};

const SearchResults = ({
    isFetchingSearch,
    searchedPosts,
}: SeachResultProps) => {
    if (isFetchingSearch) {
        return <Loader />;
    }

    if (searchedPosts?.documents.length > 0) {
        return <GridPostList posts={searchedPosts.documents} />;
    }
    return <p className="text-light-4 text-center w-full">No results found</p>;
};

export default SearchResults;
