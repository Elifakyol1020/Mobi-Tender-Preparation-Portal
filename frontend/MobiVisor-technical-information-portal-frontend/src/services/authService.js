import axios from "axios";
import { API_BASE_URL } from "../config/env";

export const login = (payload) =>
  axios.post(`${API_BASE_URL}/api/v1/auth/login`, payload, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

export const register = (payload) =>
  axios.post(`${API_BASE_URL}/api/v1/auth/register`, payload, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

export const logout = (accessToken) =>
  axios.post(
    `${API_BASE_URL}/api/v1/auth/logout`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
