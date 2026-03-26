/**
 * Legacy Vault API Client
 *
 * Wraps all backend API calls. The client handles:
 * 1. Attaching JWT tokens to authenticated requests
 * 2. Encrypting data before sending (caller's responsibility — this layer is transport)
 * 3. Consistent error handling
 *
 * IMPORTANT: All data sent to the backend is already encrypted (ciphertext).
 * The server never sees plaintext — zero-knowledge architecture.
 */

// API base URL — set via environment variable or default to localhost for dev
const API_BASE = import.meta.env.VITE_API_BASE || '';

// Token management
let authToken: string | null = localStorage.getItem('lv_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('lv_token', token);
  } else {
    localStorage.removeItem('lv_token');
  }
}

export function getToken(): string | null {
  return authToken;
}

export function clearAuth() {
  setToken(null);
  localStorage.removeItem('lv_userId');
  localStorage.removeItem('lv_email');
}

// Store user info after auth
export function setUserInfo(userId: string, email: string) {
  localStorage.setItem('lv_userId', userId);
  localStorage.setItem('lv_email', email);
}

export function getUserInfo() {
  return {
    userId: localStorage.getItem('lv_userId'),
    email: localStorage.getItem('lv_email'),
  };
}

export function isLoggedIn(): boolean {
  return !!authToken;
}

// ==================== HTTP Helpers ====================

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    // If 401 and we had a token, it's expired — clear auth
    if (res.status === 401 && authToken) {
      clearAuth();
    }
    return { ok: false, status: res.status, data };
  }

  return { ok: true, status: res.status, data };
}

// ==================== Auth API ====================

export interface RegisterRequest {
  email: string;
  authHash: string;
  userName?: string;
  encryptedSettings?: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  userName?: string;
  token: string;
  message: string;
}

export async function register(params: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  const result = await request<AuthResponse>('POST', '/api/auth/register', params);
  if (result.ok) {
    setToken(result.data.token);
    setUserInfo(result.data.userId, result.data.email);
  }
  return result;
}

export interface LoginRequest {
  email: string;
  authHash: string;
}

export async function login(params: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const result = await request<AuthResponse>('POST', '/api/auth/login', params);
  if (result.ok) {
    setToken(result.data.token);
    setUserInfo(result.data.userId, result.data.email);
  }
  return result;
}

export function logout() {
  clearAuth();
}

// ==================== Vault API ====================

export interface SaveEntryRequest {
  entryId?: string;
  type: 'password' | 'note' | 'file';
  encryptedData: string;
}

export interface SaveEntryResponse {
  entryId: string;
  message: string;
}

export async function saveEntry(params: SaveEntryRequest): Promise<ApiResponse<SaveEntryResponse>> {
  return request('POST', '/api/vault', params);
}

export interface VaultEntry {
  userId: string;
  entryId: string;
  type: 'password' | 'note' | 'file';
  encryptedData: string;
  createdAt: number;
  updatedAt: number;
}

export interface GetEntriesResponse {
  entries: VaultEntry[];
  count: number;
}

export async function getEntries(): Promise<ApiResponse<GetEntriesResponse>> {
  return request('GET', '/api/vault');
}

export interface DeleteEntryResponse {
  message: string;
}

export async function deleteEntry(entryId: string): Promise<ApiResponse<DeleteEntryResponse>> {
  return request('DELETE', `/api/vault/${entryId}`);
}

// ==================== Guardians API ====================

export interface SaveGuardianRequest {
  guardianId?: string;
  encryptedData: string;
}

export interface SaveGuardianResponse {
  guardianId: string;
  message: string;
}

export async function saveGuardian(params: SaveGuardianRequest): Promise<ApiResponse<SaveGuardianResponse>> {
  return request('POST', '/api/guardians', params);
}

export interface GuardianEntry {
  userId: string;
  guardianId: string;
  encryptedData: string;
  createdAt: number;
  updatedAt: number;
}

export interface GetGuardiansResponse {
  guardians: GuardianEntry[];
  count: number;
}

export async function getGuardians(): Promise<ApiResponse<GetGuardiansResponse>> {
  return request('GET', '/api/guardians');
}

// ==================== Capsules API ====================

export interface SaveCapsuleRequest {
  capsuleId?: string;
  encryptedData: string;
}

export interface SaveCapsuleResponse {
  capsuleId: string;
  message: string;
}

export async function saveCapsule(params: SaveCapsuleRequest): Promise<ApiResponse<SaveCapsuleResponse>> {
  return request('POST', '/api/capsules', params);
}

export interface CapsuleEntry {
  userId: string;
  capsuleId: string;
  encryptedData: string;
  createdAt: number;
  updatedAt: number;
}

export interface GetCapsulesResponse {
  capsules: CapsuleEntry[];
  count: number;
}

export async function getCapsules(): Promise<ApiResponse<GetCapsulesResponse>> {
  return request('GET', '/api/capsules');
}

// ==================== Heartbeat API ====================

export interface HeartbeatResponse {
  lastHeartbeat: number;
  message: string;
}

export async function heartbeat(): Promise<ApiResponse<HeartbeatResponse>> {
  return request('POST', '/api/heartbeat');
}

// ==================== Heartbeat Manager ====================

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
const HEARTBEAT_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

export function startHeartbeat() {
  stopHeartbeat();
  // Send immediately, then every 4 hours
  heartbeat().catch(() => {});
  heartbeatTimer = setInterval(() => {
    if (isLoggedIn()) {
      heartbeat().catch(() => {});
    } else {
      stopHeartbeat();
    }
  }, HEARTBEAT_INTERVAL);
}

export function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}
