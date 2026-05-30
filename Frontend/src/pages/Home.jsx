import PostFeed from "@/components/feed/PostFeed";

export default function Home() {

  return (
    <>
      <PostFeed endpoint={"/posts/feed"}
        title={"Feed"}
        subtitle={"posts from your college"}
       />
    </>
  );
}