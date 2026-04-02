import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
    role: string
    hospitalId: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{ user: User }>
        ) => {
            state.user = action.payload.user
            state.isAuthenticated = true
        },
        logout: (state) => {
            state.user = null
            state.isAuthenticated = false
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
    },
})

export const { setUser, logout, setLoading } = authSlice.actions
export default authSlice.reducer
