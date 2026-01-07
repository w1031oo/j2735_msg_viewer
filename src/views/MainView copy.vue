<template>
  <!-- Loading Overlay -->
  <v-overlay
    v-model="mapStore.state.isLoading"
    class="align-center justify-center text-h4"
  >
    Loading...
  </v-overlay>
  <!-- <div v-if="mapStore.state.isLoading" class="loading-overlay">Loading...</div> -->

  <!-- Error Message -->
  <div v-if="mapStore.state.mapError" class="error-message">
    {{ mapStore.state.mapError }}
  </div>

  <div class="control-panel">
    <v-btn icon="mdi-calendar" size="x-large"></v-btn>
  </div>

  <!-- <v-navigation-drawer class="bg-deep-purple" theme="dark" permanent>
    <v-list color="transparent">
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
      ></v-list-item>
      <v-list-item prepend-icon="mdi-account-box" title="Account"></v-list-item>
      <v-list-item prepend-icon="mdi-gavel" title="Admin"></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn block> Logout </v-btn>
      </div>
    </template>
  </v-navigation-drawer> -->

  <!-- Control Panel -->
  <!-- <div class="control-panel1">
    <button
      @click="loadIntersectionData('57')"
      :disabled="mapStore.state.isLoading"
    >
      57
    </button>
  </div>

  <div class="control-panel2">
    <button
      @click="loadIntersectionData('r1')"
      :disabled="mapStore.state.isLoading"
    >
      map_cest_r1
    </button>
  </div>

  <div class="control-panel3">
    <button
      @click="mapStore.cleanupLayers()"
      :disabled="mapStore.state.isLoading"
    >
      cleanUp
    </button>
  </div> -->

  <v-main style="height: 100vh; width: 100vw">
    <div id="map"></div>
  </v-main>

  <!-- Map Container -->
  <!-- <div id="map"></div> -->

  <!-- <div class="logo">
    <img :src="logo" alt="Logo" width="200" />
  </div> -->
</template>

<script setup>
import { nextTick, onMounted, onUnmounted } from "vue";
import logo from "../assets/logo.png";
// Store
import { useMapStore } from "../stores/mapStore";
const mapStore = useMapStore();

// import map57JSON from "@/assets/57.json"; // JSON 파일 경로에 맞게 수정 필요
// import mapCestR1JSON from "@/assets/map_cest_r1.json"; // JSON 파일 경로에 맞게 수정 필요

onMounted(async () => {
  try {
    // DOM이 완전히 렌더링된 후 실행
    await nextTick();

    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      mapContainer.innerHTML = "";

      mapStore.initMap("map");
    } else {
      console.error("Map container not found");
      return;
    }
  } catch (error) {
    mapStore.state.mapError = "Failed to initialize map";
    console.error("Map initialization error:", error);
  }
});

onUnmounted(() => {
  mapStore.cleanUp();
});

// 교차로 데이터 로드 함수
const loadIntersectionData = async (type) => {
  try {
    let intersectionJSON;
    if (type === "57") {
      intersectionJSON = map57JSON;
    } else if (type === "r1") {
      intersectionJSON = mapCestR1JSON;
    } else {
      throw new Error("Unknown intersection type: " + type);
    }

    await mapStore.loadIntersectionData(intersectionJSON);
  } catch (error) {
    console.error("Failed to load intersection data:", error);
  }
};
</script>

<style>
/* 전역 스타일 - scoped 제거 */

/* #app {
  height: 100vh;
  width: 100vw;
} */

#map {
  /* position: absolute; */
  /* top: 0;
  bottom: 0;
  left: 0;
  right: 0; */
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-size: 1.5rem;
}

.error-message {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
  max-width: 80%;
}

.logo {
  position: fixed;
  top: 20px;
  left: 20px;
}

.control-panel {
  position: fixed;
  top: 10px;
  left: 10px;
  padding: 10px;
  z-index: 900;
}

.control-panel1 {
  position: fixed;
  top: 10px;
  left: 260px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 900;
}

.control-panel1 button {
  background-color: #3388ff;
  color: white;
  border: none;
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
}

.control-panel1 button:hover {
  background-color: #006aff;
}

.control-panel1 button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.control-panel2 {
  position: fixed;
  top: 10px;
  left: 350px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 900;
}

.control-panel2 button {
  background-color: #3388ff;
  color: white;
  border: none;
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
}

.control-panel2 button:hover {
  background-color: #006aff;
}

.control-panel2 button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.control-panel3 {
  position: fixed;
  top: 10px;
  left: 510px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 900;
}

.control-panel3 button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
}

.control-panel3 button:hover {
  background-color: #45a049;
}

.control-panel3 button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
