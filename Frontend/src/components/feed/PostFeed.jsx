import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import api from "@/api/axios";
import PostCard from "./PostCard";
import { Link } from "react-router-dom";
import PostModal from "./PostModal";
import {toast} from "sonner";
import usePostStore from "@/store/postStore";


export default function PostFeed({
  endpoint,
  title,
  icon,
  subtitle,
  emptyMessage,
}) {
  // const [posts, setPosts] = useState([]);
  const posts = usePostStore((s) => s.posts);
  const setPosts = usePostStore((s) => s.setPosts);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const removePost = usePostStore((s) => s.removePost);
  const { user, login } = useAuthStore();
  const selectedPost = posts.find((p) => p._id === selectedPostId) || null;
  const updatePost = usePostStore((s) => s.updatePost);
  const regexx = /^\/users\/profile\/([^\/]+)\/posts$/

  const isProfile = regexx.test(endpoint) || endpoint === "/users/saved"

  useEffect(() => {
    fetchPosts();
  }, [endpoint]);

  const fetchPosts = async () => {
    try {
      const res = await api.get(endpoint);
      setPosts(res.data.posts);
    } catch (error) {
        console.log(error)
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (postId) => {
  try {
    const res = await api.put(`/users/save/${postId}`);
    console.log("postid", postId)

    const updatedSavedPosts = res.data.saved
      ? [...(user.savedPosts || []), postId]
      : (user.savedPosts || []).filter(
          (id) => id.toString() !== postId.toString()
        );

    login({
      ...user,
      savedPosts: updatedSavedPosts,
    });

    toast.success(res.data.message);
  } catch (e) {
    console.log(e)
      toast.error("Failed to save post");
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/posts/${postId}/like`);
      
     updatePost(postId, (p) => {
      const alreadyLiked = p.likes.includes(user._id);

      return {
        ...p,
        likes: alreadyLiked
          ? p.likes.filter((id) => id !== user._id)
          : [...p.likes, user._id],
      };
    });
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleCommentAdded = (postId, newComments) => {
    updatePost(postId, (p) => ({
      ...p,
      comments: newComments,
    }));
  };
  
  const handleDelete = async (e, postId) => {
    e.stopPropagation();
    try {
      await api.delete(`/posts/${postId}`);
      removePost(postId);
      toast.success("Post deleted");
      
    } catch (e) {
      console.log(e)
      toast.error("Failed to delete post");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

 return (
    <div className="max-w-2xl mx-auto px-4 py-2 pb-6">

      {  <div className="mb-4">
          <div className="mb-1 flex items-center gap-3">
          {icon}
          <div>
            <h1 className="text-2xl font-black tracking-tight">{title}</h1>
            <p className="text-[13px] text-white/25 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </div>}

      {posts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-white/40 font-medium">No posts yet</p>
         {!isProfile ? <>
         <p className="text-white/20 text-[13px] mt-1">
            Follow people to see posts
          </p>
          <Link to="/explore">
            <button className="mt-2 text-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all py-1.5 px-3 rounded-xl">Explore</button>
          </Link> 
          </> : <></>}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onClick={() => setSelectedPostId(post._id)}
              onDelete={handleDelete}
              onSaveToggle={handleSave}
            />
          ))}
        </div>
      )}

      {selectedPost && (
        <PostModal
          key={selectedPost._id}
          post={selectedPost}
          onClose={() => setSelectedPostId(null)}
          onLike={handleLike}
          onCommentAdded={handleCommentAdded}
          onSaveToggle={handleSave}

        />
      )}
    </div>
 )
}