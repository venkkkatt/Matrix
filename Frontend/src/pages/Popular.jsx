import { Flame } from "lucide-react";
import PostFeed from "@/components/feed/PostFeed";

export default function Popular() {
 
  return (
    <>
    <PostFeed endpoint={"/posts/popular"} icon={<Flame size={22} className="text-green-400" />} title={"Popular"} subtitle={"Most liked posts on matrix"} />
    </>
  )
}