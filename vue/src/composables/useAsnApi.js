import { ref } from "vue";

const API_BASE = "http://localhost:3301";

const asnError = ref(null);
const asnIsPending = ref(false);

const decodeUper = async (hexData, fileName) => {
  asnError.value = null;
  asnIsPending.value = true;

  try {
    const res = await fetch(`${API_BASE}/asn/decode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hexData, fileName }),
    });

    asnError.value = null;
    asnIsPending.value = false;

    if (!res.ok) throw new Error("디코딩 요청 실패");

    return await res.json();
  } catch (err) {
    asnError.value = err.message;
    asnIsPending.value = false;
    throw err;
  }
};

const useAsnApi = () => {
  return { asnError, asnIsPending, decodeUper };
};

export default useAsnApi;
