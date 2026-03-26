export interface ApiSuccessResponse<T = unknown> {
    success: true
    data: T
    message?: string
}

export interface ApiErrorResponse {
    success: false
    error: string
    details?: unknown
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse
