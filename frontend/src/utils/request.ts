import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { tansParams, blobValidate } from "@/utils/index";
import errorCode from "@/utils/errorCode";

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
// 创建axios实例
const service: AxiosInstance = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000,
});

// request拦截器
service.interceptors.request.use(
  (config) => {
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
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode["default"];
    // 二进制数据则直接返回
    if (res.request.responseType === "blob" || res.request.responseType === "arraybuffer") {
      return Promise.resolve(res.data);
    }
    if (code === 401) {
      return Promise.reject("无效的会话，或者会话已过期，请重新登录。");
    } else if (code === 500) {
      return Promise.reject(new Error(msg));
    } else if (code === 601) {
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      return Promise.reject("error");
    } else {
      return Promise.resolve(res.data);
    }
  },
  (error) => {
    console.log("err" + error);
    let { message } = error;
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
const request = async <T, R = undefined>(config: AxiosRequestConfig): Promise<ApiResponse<T, R>> => {
  return service.request(config) as Promise<ApiResponse<T, R>>;
};

export default request;
