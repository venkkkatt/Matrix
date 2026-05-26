import {create} from "zustand"
import {persist} from "zustand/middleware"

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({user, isAuthenticated: true}),
            logout: () => set({user: null, isAuthenticated: false})
        }),
        { name: "matrix-authStore"}
    )
)

export default useAuthStore;