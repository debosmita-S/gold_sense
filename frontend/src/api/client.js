import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  timeout: 120000,
});

export async function assess(formData) {
  const { data } = await client.post("/assess", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function runDemoScenario(scenario) {
  const body = new FormData();
  body.append("scenario", scenario);
  const { data } = await client.post("/demo/run", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchGoldPrice() {
  const { data } = await client.get("/gold-price");
  return data;
}

export async function healthCheck() {
  const { data } = await client.get("/health");
  return data;
}

export default client;
