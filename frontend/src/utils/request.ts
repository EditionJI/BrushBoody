import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { tansParams, blobValidate } from "@/utils/index";
import errorCode from "@/utils/errorCode";
import { getToken, clearAuthData } from "@/utils/storage";
import router from "@/router";

// 创建axios实例
const service: AxiosInstance = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000,
  // 默认Content-Type，但会被具体请求的headers覆盖
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    // Inject token if exists
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 如果请求没有设置Content-Type，设置默认值
    // 但不要覆盖已有的Content-Type（如multipart/form-data）
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json;charset=utf-8";
    }

    // get请求映射params参数
    if (config.method === "get" && config.params) {
      let url = config.url + "?" + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (config.method === "post" || config.method === "put") {
      const requestObj = {
        url: config.url,
        data: typeof config.data === "object" ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime(),
      };
      const requestSize = Object.keys(JSON.stringify(requestObj)).length; // 请求数据大小
      const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
      if (requestSize >= limitSize) {
        console.warn(`[${config.url}]: ` + "请求数据大小超出允许的5M限制，无法进行防重复提交验证。");
        return config;
      }
    }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    // 后端返回格式：{ code: 0, message: "success", data: {...} }
    const code = res.data.code;
    // 获取错误信息
    const msg = res.data.message || errorCode[code] || res.data.msg || errorCode["default"];
    // 二进制数据则直接返回
    if (res.request.responseType === "blob" || res.request.responseType === "arraybuffer") {
      return Promise.resolve(res.data);
    }
    // 如果没有 code 字段，直接返回数据（兼容旧接口）
    if (code === undefined || code === null) {
      return Promise.resolve(res.data);
    }
    // code = 0 表示成功
    if (code === 0) {
      return Promise.resolve(res.data);
    }
    if (code === 401) {
      // Check if this is a login/register request - don't clear data for auth endpoints
      const isAuthEndpoint = res.config?.url?.includes("/auth/login") ||
                            res.config?.url?.includes("/auth/register") ||
                            res.config?.url?.includes("/auth/change-password");

      if (isAuthEndpoint) {
        // For login/register/ change-password, return the error message from backend
        return Promise.reject(new Error(msg));
      }

      // For other endpoints, 401 means session expired - clear auth data and redirect
      clearAuthData();
      const currentPath = router.currentRoute.value.path;
      if (currentPath !== "/login") {
        router.push("/login");
      }
      return Promise.reject(new Error(msg));
    } else if (code === 500) {
      return Promise.reject(new Error(msg));
    } else if (code === 601) {
      return Promise.reject(new Error(msg));
    } else {
      return Promise.reject(new Error(msg || "error"));
    }
  },
  (error) => {
    console.log("err" + error);
    let { message } = error;

    // Handle HTTP 401 from axios error
    if (error.response?.status === 401) {
      // Check if this is a login/register request
      const isAuthEndpoint = error.config?.url?.includes("/auth/login") ||
                            error.config?.url?.includes("/auth/register") ||
                            error.config?.url?.includes("/auth/change-password");

      if (isAuthEndpoint) {
        // For auth endpoints, extract backend error message
        const backendMsg = error.response?.data?.message ||
                           error.response?.data?.msg ||
                           "Invalid email or password";
        return Promise.reject(new Error(backendMsg));
      } else {
        // For non-auth endpoints, clear data and redirect
        clearAuthData();
        const currentPath = router.currentRoute.value.path;
        if (currentPath !== "/login") {
          router.push("/login");
        }
      }
    }

    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }

    return Promise.reject(error);
  },
);

// 创建请求函数
const request = async <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return service.request(config) as Promise<ApiResponse<T>>;
};

export default request;
