import { BACKEND_API_URL, BACKEND_API_VERSION } from "config";

export async function GET(path, params = null) {
  const newPath = params ? `${path}?${new URLSearchParams(params)}` : path;
  return await apiRequest(newPath, "GET");
}

export async function POST(path, data, uploadingImage = false) {
  return await apiRequest(path, "POST", data, uploadingImage);
}

export async function PATCH(path, data, uploadingImage = false) {
  return await apiRequest(path, "PATCH", data, uploadingImage);
}

export async function DELETE(path, data, uploadingImage = false) {
  return await apiRequest(path, "DELETE", data, uploadingImage);
}

export async function apiRequest(
  path,
  method = "GET",
  data,
  uploadingImage = false
) {
  let jwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzM2ZhNmFmZjM5NzY4YmRiODVkMDQxNCIsImV0aGVyZXVtQWRkcmVzcyI6IjB4NzE4YUExN0YyMjdjMTIzOUZGNWMwODgxYUNEMGI5MWY2OEI5ZmM2NiIsInN1ZmZpeCI6MSwiaWF0IjoxNjc1MTI3Njc2LCJleHAiOjE2ODIzMjc2NzYsImF1ZCI6ImVhcnRoTU1PLWNsaWVudCIsImlzcyI6ImVhcnRoTU1PIn0.CXOCdZ8PznBqWa1rM23sO39OuW4ztr4qYYoIzt-nyQM";
  try {
    const resource = `${BACKEND_API_URL}/api/${BACKEND_API_VERSION}/${path}`;
    const options = uploadingImage
      ? {
          method,
          headers: {
            Authorization: jwt,
          },
          body: data,
        }
      : {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: jwt,
          },
          body: data ? JSON.stringify(data) : undefined,
        };
    console.log("WTF", resource, options);
    const response = await fetch(resource, options);
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.log("ERROR", error);
  }
}
