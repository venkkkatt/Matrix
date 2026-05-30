import {create} from "zustand"

const usePostStore = create((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter(p => p._id !== postId),
    })),

  updatePost: (postId, updater) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p._id === postId ? updater(p) : p
      ),
    })),
}));

export default usePostStore;