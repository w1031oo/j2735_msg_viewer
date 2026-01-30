import { io } from "socket.io-client";
import { useMapStore } from "../stores/mapStore";

export const useSocket = () => {
  const socket = io("http://localhost:3301");
  const mapStore = useMapStore();

  const decodeMap = (uperData, fileName) => {
    socket.emit("decode-map", { uperData, fileName });
  };

  socket.on("map-decoded", async (data) => {
    // 받은 데이터를 바로 mapStore에 전달
    await mapStore.loadIntersectionData(data.jsonData, data.fileName);
  });

  return {
    socket,
    decodeMap,
  };
};
