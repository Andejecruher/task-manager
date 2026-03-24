import { RegisterDTO } from "@/types";
import axios from "axios";

export async function registerServices(data: RegisterDTO): Promise<boolean> {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, data)
        console.log("🚀 ----------------------------------------🚀");
        console.log("🚀 ~ :7 ~ register ~ response:", response);
        console.log("🚀 ----------------------------------------🚀");
        return response.status === 201
    } catch (error) {
        console.log("Error during registration:", error)
        return false
    }
}